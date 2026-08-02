'use client'

import { useState, useEffect } from 'react'
import {
  GripVerticalIcon, EyeIcon, EyeOffIcon, PlusIcon, Trash2Icon,
  ChevronDownIcon, ChevronRightIcon, SaveIcon, PencilIcon, CheckIcon,
  LayoutGridIcon, ExternalLinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NavChild {
  id: string; label: string; href: string; visible: boolean
}

interface MegaSection {
  id: string; title: string; href?: string; items: NavChild[]
}

interface NavItem {
  id: string; label: string; type: 'mega' | 'simple'; href?: string
  visible: boolean; children?: NavChild[]; sections?: MegaSection[]
}

interface NavConfig { items: NavItem[] }

function genId(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6)
}

// ── Section editor (reusable) ────────────────────────────────────────────────

interface SectionEditorProps {
  itemId: string
  section: MegaSection
  expandedSections: Set<string>
  editingSectionId: { itemId: string; sectionId: string } | null
  editSectionTitle: string
  editingSectionItem: { itemId: string; sectionId: string; itemChildId: string } | null
  editSILabel: string; editSIHref: string
  addingToSection: { itemId: string; sectionId: string } | null
  newSILabel: string; newSIHref: string
  onToggleSection: (key: string) => void
  onStartEditSection: (itemId: string, section: MegaSection) => void
  onApplyEditSection: () => void
  onCancelEditSection: () => void
  onSetEditSectionTitle: (v: string) => void
  onDeleteSection: (itemId: string, sectionId: string) => void
  onStartEditSI: (itemId: string, sectionId: string, si: NavChild) => void
  onApplyEditSI: () => void
  onCancelEditSI: () => void
  onSetEditSILabel: (v: string) => void
  onSetEditSIHref: (v: string) => void
  onDeleteSI: (itemId: string, sectionId: string, itemChildId: string) => void
  onToggleSI: (itemId: string, sectionId: string, itemChildId: string) => void
  onStartAddSI: (itemId: string, sectionId: string) => void
  onCancelAddSI: () => void
  onAddSI: (itemId: string, sectionId: string) => void
  onSetNewSILabel: (v: string) => void
  onSetNewSIHref: (v: string) => void
}

function SectionEditor({
  itemId, section, expandedSections,
  editingSectionId, editSectionTitle,
  editingSectionItem, editSILabel, editSIHref,
  addingToSection, newSILabel, newSIHref,
  onToggleSection, onStartEditSection, onApplyEditSection, onCancelEditSection, onSetEditSectionTitle,
  onDeleteSection,
  onStartEditSI, onApplyEditSI, onCancelEditSI, onSetEditSILabel, onSetEditSIHref,
  onDeleteSI, onToggleSI,
  onStartAddSI, onCancelAddSI, onAddSI, onSetNewSILabel, onSetNewSIHref,
}: SectionEditorProps) {
  const sKey = `${itemId}:${section.id}`
  const isSectionExpanded = expandedSections.has(sKey)
  const isEditingSection = editingSectionId?.itemId === itemId && editingSectionId.sectionId === section.id

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 px-4 py-2.5">
        {isEditingSection ? (
          <div className="flex flex-1 items-center gap-2">
            <input autoFocus value={editSectionTitle} onChange={e => onSetEditSectionTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onApplyEditSection(); if (e.key === 'Escape') onCancelEditSection() }}
              className="flex-1 rounded-lg border border-brand px-2 py-1 text-sm outline-none" />
            <button onClick={onApplyEditSection} className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white">OK</button>
            <button onClick={onCancelEditSection} className="rounded-lg border px-2.5 py-1 text-xs text-gray-500">Hủy</button>
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm font-semibold text-gray-700">{section.title}</span>
            <span className="text-xs text-gray-400">{section.items.length} mục</span>
            <button onClick={() => onStartEditSection(itemId, section)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition">
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDeleteSection(itemId, section.id)}
              className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 transition">
              <Trash2Icon className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onToggleSection(sKey)}
              className="rounded-lg p-1 text-xs text-gray-500 hover:bg-gray-200 transition">
              {isSectionExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>

      {isSectionExpanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-1">
          {section.items.map(si => {
            const isEditingSI = editingSectionItem?.itemId === itemId && editingSectionItem.sectionId === section.id && editingSectionItem.itemChildId === si.id
            return (
              <div key={si.id}
                className={cn('group flex items-center gap-2 rounded-lg bg-white px-3 py-2 transition', si.visible ? 'hover:bg-gray-50' : 'opacity-50')}>
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand/40" />
                {isEditingSI ? (
                  <div className="flex flex-1 flex-col gap-1">
                    <input autoFocus value={editSILabel} onChange={e => onSetEditSILabel(e.target.value)}
                      placeholder="Nhãn" className="rounded-lg border border-brand px-2 py-1 text-xs outline-none" />
                    <input value={editSIHref} onChange={e => onSetEditSIHref(e.target.value)}
                      placeholder="Đường dẫn" onKeyDown={e => { if (e.key === 'Enter') onApplyEditSI() }}
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none" />
                    <div className="flex gap-1">
                      <button onClick={onApplyEditSI} className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white">Lưu</button>
                      <button onClick={onCancelEditSI} className="rounded-lg border px-2.5 py-1 text-xs text-gray-500">Hủy</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-700">{si.label}</p>
                      <p className="truncate text-[10px] text-gray-400">{si.href}</p>
                    </div>
                    <div className="invisible flex items-center gap-0.5 group-hover:visible">
                      <button onClick={() => onStartEditSI(itemId, section.id, si)}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition">
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button onClick={() => onDeleteSI(itemId, section.id, si.id)}
                        className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 transition">
                        <Trash2Icon className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => onToggleSI(itemId, section.id, si.id)}
                      className={cn('shrink-0 rounded-full p-1 transition', si.visible ? 'text-brand hover:bg-brand-50' : 'text-gray-300 hover:bg-gray-100')}>
                      {si.visible ? <EyeIcon className="h-3 w-3" /> : <EyeOffIcon className="h-3 w-3" />}
                    </button>
                  </>
                )}
              </div>
            )
          })}

          {addingToSection?.itemId === itemId && addingToSection.sectionId === section.id ? (
            <div className="mt-1.5 space-y-1.5 rounded-xl border border-brand/20 bg-brand/5 p-2.5">
              <input autoFocus value={newSILabel} onChange={e => onSetNewSILabel(e.target.value)} placeholder="Tên mục"
                className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand" />
              <input value={newSIHref} onChange={e => onSetNewSIHref(e.target.value)} placeholder="Đường dẫn"
                onKeyDown={e => { if (e.key === 'Enter') onAddSI(itemId, section.id); if (e.key === 'Escape') onCancelAddSI() }}
                className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brand" />
              <div className="flex gap-1.5">
                <button onClick={() => onAddSI(itemId, section.id)} className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white">Thêm</button>
                <button onClick={onCancelAddSI} className="rounded-lg border px-3 py-1 text-xs text-gray-500">Hủy</button>
              </div>
            </div>
          ) : (
            <button onClick={() => onStartAddSI(itemId, section.id)}
              className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/5">
              <PlusIcon className="h-3.5 w-3.5" /> Thêm mục
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminMenuPage() {
  const [config, setConfig] = useState<NavConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Item label edit
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')

  // Simple children
  const [editingChild, setEditingChild] = useState<{ itemId: string; childId: string } | null>(null)
  const [editChildLabel, setEditChildLabel] = useState('')
  const [editChildHref, setEditChildHref] = useState('')
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null)
  const [newChildLabel, setNewChildLabel] = useState('')
  const [newChildHref, setNewChildHref] = useState('')

  // Mega section meta
  const [editingSectionId, setEditingSectionId] = useState<{ itemId: string; sectionId: string } | null>(null)
  const [editSectionTitle, setEditSectionTitle] = useState('')
  const [addingSection, setAddingSection] = useState<string | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')

  // Mega section items
  const [editingSectionItem, setEditingSectionItem] = useState<{ itemId: string; sectionId: string; itemChildId: string } | null>(null)
  const [editSILabel, setEditSILabel] = useState('')
  const [editSIHref, setEditSIHref] = useState('')
  const [addingToSection, setAddingToSection] = useState<{ itemId: string; sectionId: string } | null>(null)
  const [newSILabel, setNewSILabel] = useState('')
  const [newSIHref, setNewSIHref] = useState('')

  // Add main
  const [addingMain, setAddingMain] = useState(false)
  const [newMainLabel, setNewMainLabel] = useState('')
  const [newMainType, setNewMainType] = useState<'simple' | 'mega'>('simple')
  const [newMainHref, setNewMainHref] = useState('')

  // Drag
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/nav-config')
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!config) return
    setSaving(true)
    try {
      await fetch('/api/admin/nav-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  // Drag
  const onDragStart = (e: React.DragEvent, idx: number) => { setDragIndex(idx); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIndex(idx) }
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === idx || !config) return
    const items = [...config.items]; const [removed] = items.splice(dragIndex, 1); items.splice(idx, 0, removed)
    setConfig({ ...config, items }); setDragIndex(null); setDragOverIndex(null)
  }
  const onDragEnd = () => { setDragIndex(null); setDragOverIndex(null) }

  // Item
  const toggleItem = (id: string) => setConfig(p => p ? { ...p, items: p.items.map(i => i.id === id ? { ...i, visible: !i.visible } : i) } : p)
  const deleteItem = (id: string) => setConfig(p => p ? { ...p, items: p.items.filter(i => i.id !== id) } : p)
  const applyItemLabel = () => {
    if (!editingItemId || !config) return
    setConfig({ ...config, items: config.items.map(i => i.id === editingItemId ? { ...i, label: editLabel } : i) })
    setEditingItemId(null)
  }

  // Simple children
  const toggleChild = (itemId: string, childId: string) =>
    setConfig(p => p ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, children: i.children?.map(c => c.id === childId ? { ...c, visible: !c.visible } : c) } : i) } : p)
  const deleteChild = (itemId: string, childId: string) =>
    setConfig(p => p ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, children: i.children?.filter(c => c.id !== childId) } : i) } : p)
  const applyEditChild = () => {
    if (!editingChild || !config) return
    setConfig({ ...config, items: config.items.map(i => i.id === editingChild.itemId ? { ...i, children: i.children?.map(c => c.id === editingChild.childId ? { ...c, label: editChildLabel, href: editChildHref } : c) } : i) })
    setEditingChild(null)
  }
  const addChild = (itemId: string) => {
    if (!newChildLabel.trim() || !newChildHref.trim() || !config) return
    const id = genId(newChildLabel)
    setConfig({ ...config, items: config.items.map(i => i.id === itemId ? { ...i, children: [...(i.children ?? []), { id, label: newChildLabel, href: newChildHref, visible: true }] } : i) })
    setNewChildLabel(''); setNewChildHref(''); setAddingChildTo(null)
  }

  // Mega sections
  const applyEditSection = () => {
    if (!editingSectionId || !config) return
    setConfig({ ...config, items: config.items.map(i => i.id === editingSectionId.itemId ? { ...i, sections: i.sections?.map(s => s.id === editingSectionId.sectionId ? { ...s, title: editSectionTitle } : s) } : i) })
    setEditingSectionId(null)
  }
  const deleteSection = (itemId: string, sectionId: string) =>
    setConfig(p => p ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, sections: i.sections?.filter(s => s.id !== sectionId) } : i) } : p)
  const addSection = (itemId: string) => {
    if (!newSectionTitle.trim() || !config) return
    const id = genId(newSectionTitle)
    setConfig({ ...config, items: config.items.map(i => i.id === itemId ? { ...i, sections: [...(i.sections ?? []), { id, title: newSectionTitle, items: [] }] } : i) })
    setNewSectionTitle(''); setAddingSection(null)
  }

  // Mega section items
  const applyEditSI = () => {
    if (!editingSectionItem || !config) return
    setConfig({ ...config, items: config.items.map(i => i.id === editingSectionItem.itemId ? { ...i, sections: i.sections?.map(s => s.id === editingSectionItem.sectionId ? { ...s, items: s.items.map(si => si.id === editingSectionItem.itemChildId ? { ...si, label: editSILabel, href: editSIHref } : si) } : s) } : i) })
    setEditingSectionItem(null)
  }
  const deleteSI = (itemId: string, sectionId: string, itemChildId: string) =>
    setConfig(p => p ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, sections: i.sections?.map(s => s.id === sectionId ? { ...s, items: s.items.filter(si => si.id !== itemChildId) } : s) } : i) } : p)
  const toggleSI = (itemId: string, sectionId: string, itemChildId: string) =>
    setConfig(p => p ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, sections: i.sections?.map(s => s.id === sectionId ? { ...s, items: s.items.map(si => si.id === itemChildId ? { ...si, visible: !si.visible } : si) } : s) } : i) } : p)
  const addSI = (itemId: string, sectionId: string) => {
    if (!newSILabel.trim() || !newSIHref.trim() || !config) return
    const id = genId(newSILabel)
    setConfig({ ...config, items: config.items.map(i => i.id === itemId ? { ...i, sections: i.sections?.map(s => s.id === sectionId ? { ...s, items: [...s.items, { id, label: newSILabel, href: newSIHref, visible: true }] } : s) } : i) })
    setNewSILabel(''); setNewSIHref(''); setAddingToSection(null)
  }

  const addMainItem = () => {
    if (!newMainLabel.trim() || !config) return
    const id = genId(newMainLabel)
    const item: NavItem = { id, label: newMainLabel, type: newMainType, visible: true, ...(newMainType === 'simple' ? { children: newMainHref ? [{ id: genId(newMainHref), label: newMainLabel, href: newMainHref, visible: true }] : [] } : { sections: [] }) }
    setConfig({ ...config, items: [...config.items, item] })
    setNewMainLabel(''); setNewMainHref(''); setAddingMain(false)
  }

  const toggleExpand = (id: string) => setExpandedItems(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSection = (key: string) => setExpandedSections(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n })

  // Shared props for SectionEditor
  const sectionEditorProps = {
    expandedSections, editingSectionId, editSectionTitle,
    editingSectionItem, editSILabel, editSIHref,
    addingToSection, newSILabel, newSIHref,
    onToggleSection: toggleSection,
    onStartEditSection: (itemId: string, section: MegaSection) => { setEditingSectionId({ itemId, sectionId: section.id }); setEditSectionTitle(section.title) },
    onApplyEditSection: applyEditSection,
    onCancelEditSection: () => setEditingSectionId(null),
    onSetEditSectionTitle: setEditSectionTitle,
    onDeleteSection: deleteSection,
    onStartEditSI: (itemId: string, sectionId: string, si: NavChild) => { setEditingSectionItem({ itemId, sectionId, itemChildId: si.id }); setEditSILabel(si.label); setEditSIHref(si.href) },
    onApplyEditSI: applyEditSI,
    onCancelEditSI: () => setEditingSectionItem(null),
    onSetEditSILabel: setEditSILabel,
    onSetEditSIHref: setEditSIHref,
    onDeleteSI: deleteSI,
    onToggleSI: toggleSI,
    onStartAddSI: (itemId: string, sectionId: string) => { setAddingToSection({ itemId, sectionId }); setNewSILabel(''); setNewSIHref('') },
    onCancelAddSI: () => setAddingToSection(null),
    onAddSI: addSI,
    onSetNewSILabel: setNewSILabel,
    onSetNewSIHref: setNewSIHref,
  }

  if (loading) return (
    <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
  )
  if (!config) return <div className="py-20 text-center text-red-500">Không thể tải cấu hình menu</div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý menu</h1>
          <p className="mt-1 text-sm text-gray-500">Kéo thả để sắp xếp · bật/tắt · thêm/xóa mục điều hướng</p>
        </div>
        <button onClick={save} disabled={saving}
          className={cn('flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition', saved ? 'bg-brand' : 'bg-brand hover:bg-brand/90')}>
          {saved ? <CheckIcon className="h-4 w-4" /> : <SaveIcon className="h-4 w-4" />}
          {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {config.items.map((item, idx) => {
          const isExpanded = expandedItems.has(item.id)
          const isMega = item.type === 'mega'
          const isEditingLabel = editingItemId === item.id
          const isDragging = dragIndex === idx
          const isDragOver = dragOverIndex === idx && dragIndex !== idx
          const childCount = isMega ? (item.sections?.length ?? 0) : (item.children?.length ?? 0)

          return (
            <div key={item.id}
              draggable onDragStart={e => onDragStart(e, idx)} onDragOver={e => onDragOver(e, idx)}
              onDrop={e => onDrop(e, idx)} onDragEnd={onDragEnd}
              className={cn('rounded-xl border bg-white transition', item.visible ? 'border-gray-200' : 'border-gray-100 opacity-60', isDragging && 'opacity-40 ring-2 ring-brand/30', isDragOver && 'border-brand/50 shadow-md')}>

              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <GripVerticalIcon className="h-4 w-4 shrink-0 cursor-grab text-gray-300 active:cursor-grabbing" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">{idx + 1}</span>

                {isEditingLabel ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') applyItemLabel(); if (e.key === 'Escape') setEditingItemId(null) }}
                      className="flex-1 rounded-lg border border-brand px-3 py-1.5 text-sm outline-none" />
                    <button onClick={applyItemLabel} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">OK</button>
                    <button onClick={() => setEditingItemId(null)} className="rounded-lg border px-3 py-1.5 text-xs text-gray-500">Hủy</button>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center gap-2">
                    <span className="font-semibold text-gray-800">{item.label}</span>
                    {isMega && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">MEGA</span>}
                    <button onClick={() => { setEditingItemId(item.id); setEditLabel(item.label) }}
                      className="ml-1 rounded-md p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600">
                      <PencilIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => toggleExpand(item.id)}
                    className={cn('flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition',
                      isExpanded ? 'bg-brand/5 text-brand font-medium' : 'text-gray-500 hover:bg-gray-100')}>
                    {isExpanded ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                    {isMega ? (childCount > 0 ? `${childCount} section` : 'Cấu hình') : (childCount > 0 ? `${childCount} mục` : 'Thêm mục')}
                  </button>
                  <button onClick={() => toggleItem(item.id)}
                    className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                      item.visible ? 'bg-brand-50 text-brand hover:bg-brand-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')}>
                    {item.visible ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
                    {item.visible ? 'Hiện' : 'Ẩn'}
                  </button>
                  {!['jobs', 'cv', 'tools', 'handbook', 'companies'].includes(item.id) && (
                    <button onClick={() => deleteItem(item.id)}
                      className="rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500">
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded: simple children */}
              {isExpanded && !isMega && item.children && (
                <div className="border-t border-gray-100 px-4 pb-3 pt-2 space-y-1">
                  {item.children.map(child => {
                    const isEditing = editingChild?.itemId === item.id && editingChild.childId === child.id
                    return (
                      <div key={child.id}
                        className={cn('group flex items-center gap-3 rounded-lg px-3 py-2 transition', child.visible ? 'hover:bg-gray-50' : 'opacity-50 hover:bg-gray-50')}>
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                        {isEditing ? (
                          <div className="flex flex-1 flex-col gap-1.5">
                            <input autoFocus value={editChildLabel} onChange={e => setEditChildLabel(e.target.value)} placeholder="Nhãn"
                              className="rounded-lg border border-brand px-3 py-1.5 text-xs outline-none" />
                            <input value={editChildHref} onChange={e => setEditChildHref(e.target.value)} placeholder="Đường dẫn"
                              onKeyDown={e => { if (e.key === 'Enter') applyEditChild() }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none" />
                            <div className="flex gap-1">
                              <button onClick={applyEditChild} className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white">Lưu</button>
                              <button onClick={() => setEditingChild(null)} className="rounded-lg border px-3 py-1 text-xs text-gray-500">Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-700">{child.label}</p>
                              <p className="truncate text-xs text-gray-400">{child.href}</p>
                            </div>
                            <div className="invisible flex items-center gap-1 group-hover:visible">
                              <button onClick={() => { setEditingChild({ itemId: item.id, childId: child.id }); setEditChildLabel(child.label); setEditChildHref(child.href) }}
                                className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition">
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteChild(item.id, child.id)}
                                className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 transition">
                                <Trash2Icon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                        {!isEditing && (
                          <button onClick={() => toggleChild(item.id, child.id)}
                            className={cn('shrink-0 rounded-full p-1 transition', child.visible ? 'text-brand hover:bg-brand-50' : 'text-gray-300 hover:bg-gray-100')}>
                            {child.visible ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {addingChildTo === item.id ? (
                    <div className="mt-2 space-y-1.5 rounded-xl border border-brand/20 bg-brand/5 p-3">
                      <input autoFocus value={newChildLabel} onChange={e => setNewChildLabel(e.target.value)} placeholder="Tên mục"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand" />
                      <input value={newChildHref} onChange={e => setNewChildHref(e.target.value)} placeholder="Đường dẫn"
                        onKeyDown={e => { if (e.key === 'Enter') addChild(item.id); if (e.key === 'Escape') setAddingChildTo(null) }}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand" />
                      <div className="flex gap-2">
                        <button onClick={() => addChild(item.id)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">Thêm</button>
                        <button onClick={() => { setAddingChildTo(null); setNewChildLabel(''); setNewChildHref('') }} className="rounded-lg border px-3 py-1.5 text-xs text-gray-500">Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingChildTo(item.id)}
                      className="mt-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-brand transition hover:bg-brand/5">
                      <PlusIcon className="h-3.5 w-3.5" /> Thêm mục con
                    </button>
                  )}
                </div>
              )}

              {/* Expanded: MEGA — visual column layout */}
              {isExpanded && isMega && (
                <div className="border-t border-gray-100 p-4">
                  {item.id === 'jobs' ? (
                    /* Jobs: 3-column layout */
                    <div className="grid grid-cols-3 gap-3">
                      {/* Col 1 — editable quick links */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cột 1 — Quick links</p>
                        {(item.sections ?? []).map(section => (
                          <SectionEditor key={section.id} itemId={item.id} section={section} {...sectionEditorProps} />
                        ))}
                        {addingSection === item.id ? (
                          <div className="space-y-1.5 rounded-xl border border-brand/20 bg-brand/5 p-3">
                            <input autoFocus value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
                              placeholder="Tên section" onKeyDown={e => { if (e.key === 'Enter') addSection(item.id); if (e.key === 'Escape') setAddingSection(null) }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand" />
                            <div className="flex gap-1.5">
                              <button onClick={() => addSection(item.id)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">Thêm</button>
                              <button onClick={() => { setAddingSection(null); setNewSectionTitle('') }} className="rounded-lg border px-3 py-1.5 text-xs text-gray-500">Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setAddingSection(item.id)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-2 text-xs text-gray-400 transition hover:border-brand hover:text-brand">
                            <PlusIcon className="h-3.5 w-3.5" /> Thêm section
                          </button>
                        )}
                      </div>

                      {/* Col 2-3 — DB categories (read-only) */}
                      <div className="col-span-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Cột 2–3 — Phân loại việc làm (từ database)</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                          {['IT - Phần mềm', 'Kinh doanh', 'Marketing', 'Kế toán', 'Hành chính', 'Kỹ thuật', 'Ngân hàng', 'Giáo dục', 'Y tế', 'Bán lẻ', 'Logistics', 'Nhà hàng'].map(cat => (
                            <div key={cat} className="flex items-center gap-1.5">
                              <div className="h-1 w-1 rounded-full bg-gray-300" />
                              <span className="text-xs text-gray-400">{cat}</span>
                            </div>
                          ))}
                        </div>
                        <Link href="/admin/job-categories"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-brand transition hover:border-brand hover:bg-brand/5">
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                          Quản lý phân loại việc làm
                        </Link>
                        <p className="mt-2 text-[10px] text-gray-400">* Danh sách cột 2–3 tự động lấy từ database. Chỉnh tại trang "Phân loại việc làm".</p>
                      </div>
                    </div>
                  ) : item.id === 'cv' ? (
                    /* CV: 2-column layout */
                    <div className="grid grid-cols-2 gap-3">
                      {/* Col 1 — cv-styles + cv-positions */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cột 1 — Mẫu CV</p>
                        {(item.sections ?? []).filter(s => ['cv-styles', 'cv-positions'].includes(s.id)).map(section => (
                          <SectionEditor key={section.id} itemId={item.id} section={section} {...sectionEditorProps} />
                        ))}
                        {/* Other sections not in col2 */}
                        {(item.sections ?? []).filter(s => !['cv-styles', 'cv-positions', 'cv-tools'].includes(s.id)).map(section => (
                          <SectionEditor key={section.id} itemId={item.id} section={section} {...sectionEditorProps} />
                        ))}
                      </div>

                      {/* Col 2 — cv-tools */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cột 2 — Công cụ CV</p>
                        {(item.sections ?? []).filter(s => s.id === 'cv-tools').map(section => (
                          <SectionEditor key={section.id} itemId={item.id} section={section} {...sectionEditorProps} />
                        ))}
                      </div>

                      {/* Add section spanning both cols */}
                      <div className="col-span-2">
                        {addingSection === item.id ? (
                          <div className="space-y-1.5 rounded-xl border border-brand/20 bg-brand/5 p-3">
                            <input autoFocus value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
                              placeholder="Tên section" onKeyDown={e => { if (e.key === 'Enter') addSection(item.id); if (e.key === 'Escape') setAddingSection(null) }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand" />
                            <div className="flex gap-1.5">
                              <button onClick={() => addSection(item.id)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">Thêm</button>
                              <button onClick={() => { setAddingSection(null); setNewSectionTitle('') }} className="rounded-lg border px-3 py-1.5 text-xs text-gray-500">Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setAddingSection(item.id)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-2 text-xs text-gray-400 transition hover:border-brand hover:text-brand">
                            <PlusIcon className="h-3.5 w-3.5" /> Thêm section
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Generic mega: flat list */
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sections</p>
                      {(item.sections ?? []).map(section => (
                        <SectionEditor key={section.id} itemId={item.id} section={section} {...sectionEditorProps} />
                      ))}
                      {addingSection === item.id ? (
                        <div className="space-y-1.5 rounded-xl border border-brand/20 bg-brand/5 p-3">
                          <input autoFocus value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
                            placeholder="Tên section" onKeyDown={e => { if (e.key === 'Enter') addSection(item.id); if (e.key === 'Escape') setAddingSection(null) }}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand" />
                          <div className="flex gap-1.5">
                            <button onClick={() => addSection(item.id)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">Thêm</button>
                            <button onClick={() => { setAddingSection(null); setNewSectionTitle('') }} className="rounded-lg border px-3 py-1.5 text-xs text-gray-500">Hủy</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAddingSection(item.id)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-2 text-xs text-gray-400 transition hover:border-brand hover:text-brand">
                          <PlusIcon className="h-3.5 w-3.5" /> Thêm section
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add main item */}
      {addingMain ? (
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Thêm mục menu chính</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Tên hiển thị <span className="text-red-500">*</span></label>
              <input autoFocus value={newMainLabel} onChange={e => setNewMainLabel(e.target.value)} placeholder="Ví dụ: Việc làm nước ngoài"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Loại</label>
              <select value={newMainType} onChange={e => setNewMainType(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
                <option value="simple">Simple (dropdown đơn)</option>
                <option value="mega">Mega menu</option>
              </select>
            </div>
            {newMainType === 'simple' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Đường dẫn (tùy chọn)</label>
                <input value={newMainHref} onChange={e => setNewMainHref(e.target.value)} placeholder="/jobs?type=abroad"
                  onKeyDown={e => { if (e.key === 'Enter') addMainItem() }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={addMainItem} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90">Thêm vào menu</button>
            <button onClick={() => { setAddingMain(false); setNewMainLabel(''); setNewMainHref('') }}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-white">Hủy</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingMain(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 transition hover:border-brand hover:text-brand">
          <PlusIcon className="h-4 w-4" /> Thêm mục menu chính
        </button>
      )}

      {/* Notes */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500 space-y-1.5">
        <p className="font-semibold text-gray-700 mb-2">Hướng dẫn:</p>
        <p>• <strong>Kéo thả</strong> biểu tượng ⠿ để thay đổi thứ tự hiển thị</p>
        <p>• <span className="rounded bg-brand/10 px-1 text-brand font-semibold">MEGA</span> — click "X section" để mở editor dạng cột, phản ánh đúng layout thực tế trên menu</p>
        <p>• Cột 2–3 của menu <strong>Việc làm</strong> lấy từ database, chỉnh tại <Link href="/admin/job-categories" className="text-brand underline">Phân loại việc làm</Link></p>
        <p>• Nhấn <strong>Lưu thay đổi</strong> để áp dụng cho tất cả người dùng</p>
      </div>
    </div>
  )
}
