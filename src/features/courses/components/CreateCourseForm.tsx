import { useEffect, useState, type FormEvent } from 'react'
import { CollectionAutocomplete } from '../../../components/ui/CollectionAutocomplete'
import type { CreateCoursePayload } from '../types/course.types'

interface CreateCourseFormProps {
  onCreate: (payload: CreateCoursePayload) => Promise<void>
  open: boolean
  onClose: () => void
  existingCollections?: string[]
}

export function CreateCourseForm({ onCreate, open, onClose, existingCollections = [] }: CreateCourseFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [totalHours, setTotalHours] = useState('')
  const [collection, setCollection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form state when closed externally
  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setLink('')
      setTotalHours('')
      setCollection('')
    }
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title) return
    const hours = Number.parseFloat(totalHours)
    setIsSubmitting(true)
    try {
      await onCreate({
        title,
        description,
        link,
        totalHours: Number.isFinite(hours) && hours > 0 ? hours : null,
        status: 'na_prateleira',
        collection: collection.trim() || null,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nome do curso*"
        className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
        rows={2}
        className="resize-none rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
      />
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Link de acesso (https://...)"
        className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
      />
      <input
        type="number"
        min={0.5}
        step={0.5}
        value={totalHours}
        onChange={(e) => setTotalHours(e.target.value)}
        placeholder="Total de horas"
        className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
      />
      <CollectionAutocomplete
        value={collection}
        onChange={setCollection}
        suggestions={existingCollections}
        placeholder="Coleção / série (opcional)"
        className="w-full rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
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
