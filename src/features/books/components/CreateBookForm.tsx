import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { BookStatus, CreateBookPayload } from '../types/book.types'

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'quero_ler', label: 'Quero Ler' },
  { value: 'lendo', label: 'Lendo' },
  { value: 'lido', label: 'Lido' },
]

interface CreateBookFormProps {
  onCreate: (payload: CreateBookPayload) => Promise<void>
}

export function CreateBookForm({ onCreate }: CreateBookFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [status, setStatus] = useState<BookStatus>('quero_ler')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title) return
    const pages = Number.parseInt(totalPages, 10)
    setIsSubmitting(true)
    try {
      await onCreate({
        title,
        author,
        totalPages: Number.isFinite(pages) && pages > 0 ? pages : null,
        status,
      })
      setTitle('')
      setAuthor('')
      setTotalPages('')
      setStatus('quero_ler')
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 px-4 py-3 text-sm text-black/50 hover:bg-white/20 dark:text-white/50"
      >
        <Plus className="h-4 w-4" />
        Adicionar livro
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título do livro*"
        className="rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
        required
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Autor"
        className="rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
      />
      <input
        type="number"
        min={1}
        value={totalPages}
        onChange={(e) => setTotalPages(e.target.value)}
        placeholder="Total de páginas"
        className="rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
      />
      <div className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatus(opt.value)}
            className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              status === opt.value
                ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                : 'text-black/50 dark:text-white/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-xs text-black/60 dark:text-white/60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title}
          className="flex-1 rounded-lg bg-black/80 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/80"
        >
          Adicionar
        </button>
      </div>
    </form>
  )
}
