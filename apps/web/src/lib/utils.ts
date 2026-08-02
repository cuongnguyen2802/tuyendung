import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { JOB_TYPE_LABELS, WORK_MODE_LABELS } from '@tuyendung/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min?: number | null, max?: number | null, negotiable?: boolean): string {
  if (negotiable || (!min && !max)) return 'Thỏa thuận'
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)} triệu` : `${(n / 1000).toFixed(0)}K`
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `Từ ${fmt(min)}`
  if (max) return `Đến ${fmt(max)}`
  return 'Thỏa thuận'
}

export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hôm nay'
  if (days === 1) return 'Hôm qua'
  if (days < 7) return `${days} ngày trước`
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`
  return `${Math.floor(days / 365)} năm trước`
}

export function formatDeadline(date?: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export { JOB_TYPE_LABELS, WORK_MODE_LABELS }
