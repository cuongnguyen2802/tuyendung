'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import {
  BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon,
  Heading2Icon, Heading3Icon, UndoIcon, RedoIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  error?: boolean
}

export function RichEditor({ value, onChange, placeholder, minHeight = 180, error }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { HTMLAttributes: { class: 'list-disc pl-5' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal pl-5' } },
        listItem: { HTMLAttributes: { class: 'my-0.5' } },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Nhập nội dung...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: {
        class: 'outline-none',
      },
    },
    immediatelyRender: false,
  })

  // Sync external value changes (e.g. form.reset())
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== value && value !== undefined) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  const ToolBtn = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-gray-600 transition hover:bg-gray-100',
        active && 'bg-gray-100 text-brand',
      )}
    >
      {children}
    </button>
  )

  return (
    <div className={cn(
      'overflow-hidden rounded-xl border bg-white transition',
      error ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand',
    )}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolBtn title="In đậm" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <BoldIcon className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="In nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <ItalicIcon className="h-3.5 w-3.5" />
        </ToolBtn>

        <div className="mx-1 h-4 w-px bg-gray-300" />

        <ToolBtn title="Tiêu đề lớn" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2Icon className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Tiêu đề nhỏ" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3Icon className="h-3.5 w-3.5" />
        </ToolBtn>

        <div className="mx-1 h-4 w-px bg-gray-300" />

        <ToolBtn title="Danh sách" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <ListIcon className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Danh sách số" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrderedIcon className="h-3.5 w-3.5" />
        </ToolBtn>

        <div className="mx-1 h-4 w-px bg-gray-300" />

        <ToolBtn title="Hoàn tác" onClick={() => editor.chain().focus().undo().run()}>
          <UndoIcon className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Làm lại" onClick={() => editor.chain().focus().redo().run()}>
          <RedoIcon className="h-3.5 w-3.5" />
        </ToolBtn>
      </div>

      {/* Content area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3
          prose-headings:font-semibold prose-headings:text-gray-900
          prose-h2:text-base prose-h3:text-sm
          prose-ul:my-1 prose-li:my-0
          prose-p:my-1 prose-p:text-gray-700
          [&_.is-editor-empty:first-child::before]:text-gray-400
          [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.is-editor-empty:first-child::before]:float-left
          [&_.is-editor-empty:first-child::before]:pointer-events-none
          [&_.is-editor-empty:first-child::before]:h-0"
        style={{ minHeight }}
      />
    </div>
  )
}
