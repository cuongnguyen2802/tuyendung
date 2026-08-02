'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useCallback, useState } from 'react'
import {
  BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
  Heading1Icon, Heading2Icon, Heading3Icon, ListIcon, ListOrderedIcon,
  QuoteIcon, CodeIcon, LinkIcon, ImageIcon, AlignLeftIcon,
  AlignCenterIcon, AlignRightIcon, Undo2Icon, Redo2Icon,
  SeparatorHorizontalIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const MediaPickerModal = dynamic(() => import('./MediaPickerModal'), { ssr: false })

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung bài viết...', minHeight = 400 }: Props) {
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
      Image.configure({ inline: false, HTMLAttributes: { class: 'max-w-full rounded-lg my-4' } }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-6 py-4',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href ?? ''
    const url = window.prompt('URL liên kết:', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertImages = useCallback((urls: string[]) => {
    if (!editor) return
    urls.forEach((src) => editor.chain().focus().setImage({ src }).run())
  }, [editor])

  if (!editor) return null

  const btnCls = (active?: boolean) =>
    cn('rounded p-1.5 transition', active ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100')

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-brand transition">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
          {/* Undo/Redo */}
          <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={btnCls()} title="Hoàn tác">
            <Undo2Icon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={btnCls()} title="Làm lại">
            <Redo2Icon className="h-4 w-4" />
          </button>

          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          {/* Headings */}
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnCls(editor.isActive('heading', { level: 1 }))} title="Tiêu đề 1">
            <Heading1Icon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive('heading', { level: 2 }))} title="Tiêu đề 2">
            <Heading2Icon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnCls(editor.isActive('heading', { level: 3 }))} title="Tiêu đề 3">
            <Heading3Icon className="h-4 w-4" />
          </button>

          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          {/* Text formatting */}
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive('bold'))} title="In đậm">
            <BoldIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive('italic'))} title="In nghiêng">
            <ItalicIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnCls(editor.isActive('underline'))} title="Gạch chân">
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnCls(editor.isActive('strike'))} title="Gạch ngang">
            <StrikethroughIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btnCls(editor.isActive('code'))} title="Inline code">
            <CodeIcon className="h-4 w-4" />
          </button>

          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          {/* Lists */}
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive('bulletList'))} title="Danh sách">
            <ListIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive('orderedList'))} title="Danh sách có số">
            <ListOrderedIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnCls(editor.isActive('blockquote'))} title="Trích dẫn">
            <QuoteIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnCls(editor.isActive('codeBlock'))} title="Khối code">
            <span className="rounded p-1 font-mono text-xs font-bold text-gray-600">&lt;/&gt;</span>
          </button>

          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          {/* Alignment */}
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnCls(editor.isActive({ textAlign: 'left' }))} title="Căn trái">
            <AlignLeftIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnCls(editor.isActive({ textAlign: 'center' }))} title="Căn giữa">
            <AlignCenterIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnCls(editor.isActive({ textAlign: 'right' }))} title="Căn phải">
            <AlignRightIcon className="h-4 w-4" />
          </button>

          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          {/* Media */}
          <button type="button" onClick={setLink} className={btnCls(editor.isActive('link'))} title="Chèn liên kết">
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowMediaPicker(true)}
            className={cn(btnCls(), 'flex items-center gap-1 px-2 text-xs font-medium')}
            title="Chèn hình ảnh từ thư viện"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Ảnh</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnCls()} title="Đường kẻ ngang">
            <SeparatorHorizontalIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />

        {/* Footer */}
        <div className="border-t border-gray-50 px-4 py-1.5 text-right text-xs text-gray-300">
          {editor.storage.characterCount?.characters() ?? 0} ký tự
        </div>
      </div>

      {/* Media picker */}
      {showMediaPicker && (
        <MediaPickerModal
          multiple
          onSelect={(url) => { insertImages([url]); setShowMediaPicker(false) }}
          onSelectMultiple={(urls) => { insertImages(urls); setShowMediaPicker(false) }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  )
}
