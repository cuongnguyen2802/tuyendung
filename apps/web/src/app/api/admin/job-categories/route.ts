import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const FILE = join(process.cwd(), 'src/data/job-categories.json')

function readFile() {
  try {
    return JSON.parse(readFileSync(FILE, 'utf-8'))
  } catch {
    return { positions: [], fields: [] }
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: readFile() })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  if (!Array.isArray(body.positions) || !Array.isArray(body.fields)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  writeFileSync(FILE, JSON.stringify(body, null, 2), 'utf-8')
  return NextResponse.json({ success: true })
}
