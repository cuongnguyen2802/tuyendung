import {
  Injectable, OnModuleInit, OnModuleDestroy, Logger,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { spawn } from 'child_process'
import { createWriteStream, createReadStream, existsSync, mkdirSync, unlinkSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { createGzip } from 'zlib'
import { join } from 'path'
import { pipeline } from 'stream/promises'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BackupRecord {
  filename: string
  createdAt: string
  sizeBytes: number
  type: 'manual' | 'auto'
  status: 'success' | 'failed'
  note?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MANIFEST_FILE  = 'manifest.json'
const AUTO_INTERVAL  = 24 * 60 * 60 * 1000   // 24 hours
const MAX_KEEP_DAYS  = 30                      // delete backups older than 30 days

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class BackupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackupService.name)
  private readonly backupDir: string
  private timer: NodeJS.Timeout | null = null
  private autoEnabled = false

  constructor(private config: ConfigService) {
    this.backupDir = join(process.cwd(), 'uploads', 'backups')
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  onModuleInit() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true })
    }
    this.logger.log(`Backup directory: ${this.backupDir}`)

    // Read persisted auto-backup setting
    const settings = this.readSettings()
    if (settings.autoEnabled) this.startAutoBackup()
  }

  onModuleDestroy() {
    this.stopAutoBackup()
  }

  // ── Manual backup ─────────────────────────────────────────────────────────

  async createBackup(type: 'manual' | 'auto' = 'manual'): Promise<BackupRecord> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename  = `backup_${timestamp}.sql.gz`
    const filepath  = join(this.backupDir, filename)

    this.logger.log(`Starting ${type} backup → ${filename}`)

    try {
      await this.runPgDump(filepath)
      const sizeBytes = statSync(filepath).size
      const record: BackupRecord = {
        filename, sizeBytes, type, status: 'success',
        createdAt: new Date().toISOString(),
      }
      this.appendManifest(record)
      this.purgeOldBackups()
      this.logger.log(`Backup complete: ${filename} (${this.formatBytes(sizeBytes)})`)
      return record
    } catch (err: any) {
      const record: BackupRecord = {
        filename, sizeBytes: 0, type, status: 'failed',
        createdAt: new Date().toISOString(),
        note: err?.message ?? 'Unknown error',
      }
      this.appendManifest(record)
      this.logger.error(`Backup failed: ${err?.message}`)
      throw new InternalServerErrorException(`Backup thất bại: ${err?.message}`)
    }
  }

  // ── List & stream ─────────────────────────────────────────────────────────

  listBackups(): BackupRecord[] {
    const manifest = this.readManifest()
    // Sync sizes in case files were manually deleted
    return manifest
      .map((r) => {
        const fp = join(this.backupDir, r.filename)
        if (existsSync(fp)) return { ...r, sizeBytes: statSync(fp).size }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()) as BackupRecord[]
  }

  getFilePath(filename: string): string {
    const fp = join(this.backupDir, filename)
    if (!existsSync(fp)) throw new InternalServerErrorException('File backup không tồn tại')
    return fp
  }

  createReadStream(filename: string) {
    return createReadStream(this.getFilePath(filename))
  }

  deleteBackup(filename: string): void {
    const fp = join(this.backupDir, filename)
    if (existsSync(fp)) unlinkSync(fp)
    const manifest = this.readManifest().filter((r) => r.filename !== filename)
    this.writeManifest(manifest)
  }

  // ── Auto-backup ───────────────────────────────────────────────────────────

  getStatus() {
    const settings = this.readSettings()
    const manifest = this.listBackups()
    const lastSuccess = manifest.find((r) => r.status === 'success')
    return {
      autoEnabled: settings.autoEnabled,
      lastBackupAt: lastSuccess?.createdAt ?? null,
      totalBackups: manifest.length,
      totalSizeBytes: manifest.reduce((s, r) => s + r.sizeBytes, 0),
      nextAutoAt: this.autoEnabled && this.timer
        ? new Date(Date.now() + AUTO_INTERVAL).toISOString()
        : null,
    }
  }

  setAutoBackup(enabled: boolean): void {
    this.saveSettings({ autoEnabled: enabled })
    if (enabled) {
      this.startAutoBackup()
    } else {
      this.stopAutoBackup()
    }
  }

  private startAutoBackup() {
    if (this.timer) return
    this.autoEnabled = true
    this.logger.log('Auto-backup enabled (every 24h)')
    this.timer = setInterval(async () => {
      try { await this.createBackup('auto') } catch { /* already logged */ }
    }, AUTO_INTERVAL)
  }

  private stopAutoBackup() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.autoEnabled = false
  }

  // ── pg_dump ────────────────────────────────────────────────────────────────

  private runPgDump(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbUrl  = this.config.get<string>('DATABASE_URL', '')
      const parsed = this.parseDbUrl(dbUrl)

      const env = {
        ...process.env,
        PGPASSWORD: parsed.password,
      }

      const args = [
        `--host=${parsed.host}`,
        `--port=${parsed.port}`,
        `--username=${parsed.user}`,
        `--dbname=${parsed.database}`,
        '--no-password',
        '--format=plain',
        '--encoding=UTF8',
      ]

      const pg  = spawn('pg_dump', args, { env })
      const gz  = createGzip()
      const out = createWriteStream(outputPath)

      // pg_dump stdout → gzip → file
      pipeline(pg.stdout, gz, out)
        .then(resolve)
        .catch(reject)

      pg.stderr.on('data', (d: Buffer) => {
        const msg = d.toString().trim()
        if (msg) this.logger.warn(`pg_dump: ${msg}`)
      })

      pg.on('error', (err) => reject(new Error(`pg_dump not found: ${err.message}. Ensure PostgreSQL client tools are installed.`)))
      pg.on('close', (code) => {
        if (code !== 0) reject(new Error(`pg_dump exited with code ${code}`))
      })
    })
  }

  // ── Purge old files ────────────────────────────────────────────────────────

  private purgeOldBackups() {
    const cutoff = Date.now() - MAX_KEEP_DAYS * 86400_000
    const manifest = this.readManifest()
    const kept: BackupRecord[] = []
    for (const r of manifest) {
      if (new Date(r.createdAt).getTime() < cutoff) {
        const fp = join(this.backupDir, r.filename)
        if (existsSync(fp)) unlinkSync(fp)
        this.logger.log(`Purged old backup: ${r.filename}`)
      } else {
        kept.push(r)
      }
    }
    this.writeManifest(kept)
  }

  // ── Manifest helpers ──────────────────────────────────────────────────────

  private manifestPath() { return join(this.backupDir, MANIFEST_FILE) }

  private readManifest(): BackupRecord[] {
    try {
      const p = this.manifestPath()
      if (!existsSync(p)) return []
      return JSON.parse(readFileSync(p, 'utf-8'))
    } catch { return [] }
  }

  private writeManifest(records: BackupRecord[]) {
    writeFileSync(this.manifestPath(), JSON.stringify(records, null, 2))
  }

  private appendManifest(record: BackupRecord) {
    const manifest = this.readManifest()
    manifest.push(record)
    this.writeManifest(manifest)
  }

  // ── Settings helpers ──────────────────────────────────────────────────────

  private settingsPath() { return join(this.backupDir, 'settings.json') }

  private readSettings(): { autoEnabled: boolean } {
    try {
      const p = this.settingsPath()
      if (!existsSync(p)) return { autoEnabled: false }
      return JSON.parse(readFileSync(p, 'utf-8'))
    } catch { return { autoEnabled: false } }
  }

  private saveSettings(s: { autoEnabled: boolean }) {
    writeFileSync(this.settingsPath(), JSON.stringify(s, null, 2))
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private parseDbUrl(url: string) {
    try {
      const u = new URL(url)
      return {
        host:     u.hostname || 'localhost',
        port:     u.port     || '5432',
        user:     u.username || 'postgres',
        password: u.password || '',
        database: u.pathname.replace(/^\//, '') || 'tuyendung',
      }
    } catch {
      return { host: 'localhost', port: '5432', user: 'postgres', password: '', database: 'tuyendung' }
    }
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024)         return `${bytes} B`
    if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}
