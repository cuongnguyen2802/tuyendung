import {
  Injectable, OnModuleInit, OnModuleDestroy, Logger,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import {
  createWriteStream, createReadStream, existsSync,
  mkdirSync, unlinkSync, statSync,
  readFileSync, writeFileSync,
} from 'fs'
import { createGzip, gunzipSync } from 'zlib'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { join } from 'path'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BackupRecord {
  filename:   string
  createdAt:  string
  sizeBytes:  number
  type:       'manual' | 'auto'
  status:     'success' | 'failed'
  tables?:    number
  rows?:      number
  note?:      string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MANIFEST_FILE = 'manifest.json'
const AUTO_INTERVAL = 24 * 60 * 60 * 1000   // 24 hours
const MAX_KEEP_DAYS = 30

/** Tables to export in order (respects FK deps for restore) */
const EXPORT_MODELS = [
  'user', 'refreshToken', 'candidateProfile', 'workExperience', 'education',
  'skill', 'candidateSkill', 'resume',
  'employer', 'employerMember', 'jobCategory', 'job', 'jobSkill',
  'application', 'savedJob', 'followedCompany',
  'notification', 'notificationPreference', 'jobAlert',
  'article', 'articleCategory', 'media',
  'message', 'profileView', 'coverLetter',
  'campaign', 'servicePackage', 'order', 'orderItem', 'invoice', 'payment',
  'activityLog', 'systemSetting',
  'aiChatSession', 'aiChatMessage',
] as const

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class BackupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackupService.name)
  private readonly backupDir: string
  private timer: NodeJS.Timeout | null = null
  private autoEnabled = false

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.backupDir = join(process.cwd(), 'uploads', 'backups')
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  onModuleInit() {
    if (!existsSync(this.backupDir)) mkdirSync(this.backupDir, { recursive: true })
    this.logger.log(`Backup dir: ${this.backupDir}`)
    const { autoEnabled } = this.readSettings()
    if (autoEnabled) this.startAutoBackup()
  }

  onModuleDestroy() { this.stopAutoBackup() }

  // ── Create backup ─────────────────────────────────────────────────────────

  async createBackup(type: 'manual' | 'auto' = 'manual'): Promise<BackupRecord> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename  = `backup_${timestamp}.json.gz`
    const filepath  = join(this.backupDir, filename)

    this.logger.log(`Starting ${type} backup → ${filename}`)

    try {
      const { payload, tables, rows } = await this.dumpAllTables()

      // Serialize → gzip → file
      const json = JSON.stringify(payload, null, 0)
      await pipeline(
        Readable.from([json]),
        createGzip(),
        createWriteStream(filepath),
      )

      const sizeBytes = statSync(filepath).size
      const record: BackupRecord = {
        filename, sizeBytes, type, status: 'success',
        createdAt: new Date().toISOString(),
        tables, rows,
      }
      this.appendManifest(record)
      this.purgeOldBackups()
      this.logger.log(`Backup done: ${filename} — ${tables} tables, ${rows} rows, ${this.formatBytes(sizeBytes)}`)
      return record
    } catch (err: any) {
      const record: BackupRecord = {
        filename: `failed_${timestamp}`, sizeBytes: 0, type, status: 'failed',
        createdAt: new Date().toISOString(),
        note: err?.message ?? 'Unknown error',
      }
      this.appendManifest(record)
      this.logger.error(`Backup failed: ${err?.message}`)
      throw new InternalServerErrorException(`Backup thất bại: ${err?.message}`)
    }
  }

  // ── Dump all tables via Prisma ─────────────────────────────────────────────

  private async dumpAllTables(): Promise<{ payload: Record<string, unknown[]>; tables: number; rows: number }> {
    const payload: Record<string, unknown[]> = {
      _meta: [{
        exportedAt:  new Date().toISOString(),
        version:     '1.0',
        generator:   'TuyenDung Backup',
      }] as unknown[],
    }

    let totalRows = 0
    let tableCount = 0

    for (const model of EXPORT_MODELS) {
      try {
        // Prisma delegate lookup — dynamic access
        const delegate = (this.prisma as any)[model]
        if (!delegate?.findMany) continue

        const rows = await delegate.findMany({})
        payload[model] = rows
        totalRows += rows.length
        tableCount++
        this.logger.verbose(`  ${model}: ${rows.length} rows`)
      } catch (err: any) {
        this.logger.warn(`  Skipping ${model}: ${err?.message}`)
        payload[model] = []
      }
    }

    return { payload, tables: tableCount, rows: totalRows }
  }

  // ── List & stream ─────────────────────────────────────────────────────────

  listBackups(): BackupRecord[] {
    return this.readManifest()
      .map((r) => {
        const fp = join(this.backupDir, r.filename)
        if (!existsSync(fp)) return null
        return { ...r, sizeBytes: statSync(fp).size }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()) as BackupRecord[]
  }

  createReadStream(filename: string) {
    const fp = join(this.backupDir, filename)
    if (!existsSync(fp)) throw new InternalServerErrorException('File không tồn tại')
    return createReadStream(fp)
  }

  deleteBackup(filename: string): void {
    const fp = join(this.backupDir, filename)
    if (existsSync(fp)) unlinkSync(fp)
    this.writeManifest(this.readManifest().filter((r) => r.filename !== filename))
  }

  // ── Status ────────────────────────────────────────────────────────────────

  getStatus() {
    const { autoEnabled } = this.readSettings()
    const list = this.listBackups()
    const lastOk = list.find((r) => r.status === 'success')
    return {
      autoEnabled,
      lastBackupAt:    lastOk?.createdAt ?? null,
      lastBackupRows:  lastOk?.rows ?? null,
      lastBackupTables: lastOk?.tables ?? null,
      totalBackups:    list.length,
      totalSizeBytes:  list.reduce((s, r) => s + r.sizeBytes, 0),
      nextAutoAt:      this.autoEnabled && this.timer
        ? new Date(Date.now() + AUTO_INTERVAL).toISOString()
        : null,
    }
  }

  // ── Auto-backup ───────────────────────────────────────────────────────────

  setAutoBackup(enabled: boolean) {
    this.saveSettings({ autoEnabled: enabled })
    enabled ? this.startAutoBackup() : this.stopAutoBackup()
  }

  private startAutoBackup() {
    if (this.timer) return
    this.autoEnabled = true
    this.logger.log('Auto-backup enabled (every 24h)')
    this.timer = setInterval(async () => {
      try { await this.createBackup('auto') } catch { /* logged in createBackup */ }
    }, AUTO_INTERVAL)
  }

  private stopAutoBackup() {
    if (this.timer) { clearInterval(this.timer); this.timer = null }
    this.autoEnabled = false
  }

  // ── Restore ───────────────────────────────────────────────────────────────

  async restoreFromBuffer(buffer: Buffer): Promise<{ tables: number; rows: number }> {
    this.logger.warn('⚠️  RESTORE started — all current data will be replaced')

    // 1. Decompress
    let json: string
    try {
      json = gunzipSync(buffer).toString('utf-8')
    } catch {
      throw new InternalServerErrorException('File không hợp lệ — không thể giải nén gzip')
    }

    // 2. Parse
    let payload: Record<string, unknown[]>
    try {
      payload = JSON.parse(json)
    } catch {
      throw new InternalServerErrorException('File không hợp lệ — JSON bị hỏng')
    }

    if (!payload['_meta']) {
      throw new InternalServerErrorException('File không phải backup hợp lệ của TuyenDung')
    }

    // 3. Disable FK checks, wipe tables in REVERSE FK order, re-insert in FORWARD order
    //    PostgreSQL: SET session_replication_role = replica bypasses FK triggers
    let totalRows = 0
    let tableCount = 0

    try {
      await this.prisma.$executeRawUnsafe(`SET session_replication_role = 'replica'`)

      // Wipe in reverse order
      const reversed = [...EXPORT_MODELS].reverse()
      for (const model of reversed) {
        try {
          const delegate = (this.prisma as any)[model]
          if (delegate?.deleteMany) await delegate.deleteMany({})
        } catch { /* table may not exist yet */ }
      }

      // Re-insert in forward order
      for (const model of EXPORT_MODELS) {
        const rows = payload[model]
        if (!Array.isArray(rows) || rows.length === 0) continue
        try {
          const delegate = (this.prisma as any)[model]
          if (!delegate?.createMany) continue
          await delegate.createMany({ data: rows, skipDuplicates: true })
          totalRows += rows.length
          tableCount++
          this.logger.verbose(`  restored ${model}: ${rows.length} rows`)
        } catch (err: any) {
          this.logger.warn(`  skip ${model}: ${err?.message?.slice(0, 80)}`)
        }
      }
    } finally {
      // Always re-enable FK checks
      await this.prisma.$executeRawUnsafe(`SET session_replication_role = 'DEFAULT'`)
    }

    this.logger.log(`✅ Restore complete: ${tableCount} tables, ${totalRows} rows`)
    return { tables: tableCount, rows: totalRows }
  }

  // ── Purge ─────────────────────────────────────────────────────────────────

  private purgeOldBackups() {
    const cutoff   = Date.now() - MAX_KEEP_DAYS * 86_400_000
    const manifest = this.readManifest()
    const kept: BackupRecord[] = []
    for (const r of manifest) {
      if (new Date(r.createdAt).getTime() < cutoff) {
        const fp = join(this.backupDir, r.filename)
        if (existsSync(fp)) unlinkSync(fp)
        this.logger.log(`Purged: ${r.filename}`)
      } else { kept.push(r) }
    }
    this.writeManifest(kept)
  }

  // ── Manifest & settings ───────────────────────────────────────────────────

  private manifestPath() { return join(this.backupDir, MANIFEST_FILE) }
  private settingsPath()  { return join(this.backupDir, 'settings.json') }

  private readManifest(): BackupRecord[] {
    try {
      const p = this.manifestPath()
      return existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) : []
    } catch { return [] }
  }
  private writeManifest(r: BackupRecord[]) {
    writeFileSync(this.manifestPath(), JSON.stringify(r, null, 2))
  }
  private appendManifest(r: BackupRecord) {
    const list = this.readManifest(); list.push(r); this.writeManifest(list)
  }

  private readSettings(): { autoEnabled: boolean } {
    try {
      const p = this.settingsPath()
      return existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) : { autoEnabled: false }
    } catch { return { autoEnabled: false } }
  }
  private saveSettings(s: { autoEnabled: boolean }) {
    writeFileSync(this.settingsPath(), JSON.stringify(s, null, 2))
  }

  // ── Utils ─────────────────────────────────────────────────────────────────

  formatBytes(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`
    if (bytes < 1_048_576)   return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1_048_576).toFixed(1)} MB`
  }
}
