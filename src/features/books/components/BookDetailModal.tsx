import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Camera, CheckCircle, Layers, Pencil, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { bookService } from '../services/bookService'
import type { Book, BookStatus, UpdateBookPayload } from '../types/book.types'

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'na_estante', label: 'Estante'   },
  { value: 'quero_ler',  label: 'Quero Ler' },
  { value: 'lendo',      label: 'Lendo'     },
  { value: 'lido',       label: 'Lido'      },
]

interface BookDetailModalProps {
  book: Book | null
  onRegisterReading: (bookId: string, pages: number) => Promise<void>
  onChangeStatus: (bookId: string, status: BookStatus) => Promise<void>
  onUpdateBook: (bookId: string, payload: UpdateBookPayload) => Promise<unknown>
  onCoverUpdated: (bookId: string, url: string) => void
  onRequestDelete: (bookId: string) => void
  onClose: () => void
  existingCollections?: string[]
}

const STATUS_BADGE: Partial<Record<BookStatus, { label: string; classes: string }>> = {
  lido:      { label: 'Lido',      classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  lendo:     { label: 'Lendo',     classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  quero_ler: { label: 'Quero Ler', classes: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
}

export function BookDetailModal({
  book,
  onRegisterReading,
  onChangeStatus,
  onUpdateBook,
  onCoverUpdated,
  onRequestDelete,
  onClose,
  existingCollections = [],
}: BookDetailModalProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [pagesInput, setPagesInput] = useState('')
  const [pagesError, setPagesError] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')
  const [editPages, setEditPages] = useState('')
  const [editCollection, setEditCollection] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function startEditing() {
    if (!book) return
    setEditTitle(book.title)
    setEditAuthor(book.author ?? '')
    setEditPages(book.totalPages ? String(book.totalPages) : '')
    setEditCollection(book.collection ?? '')
    setIsEditing(true)
  }

  async function saveEdit() {
    if (!book || !editTitle.trim()) return
    setIsSavingEdit(true)
    try {
      const pages = parseInt(editPages, 10)
      const payload: UpdateBookPayload = {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        collection: editCollection.trim() || null,
      }
      if (Number.isFinite(pages) && pages > 0) {
        payload.totalPages = pages
      }
      await onUpdateBook(book.id, payload)
      setIsEditing(false)
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function handleRegister() {
    if (!book) return
    const currentPageInput = Number.parseInt(pagesInput, 10)
    if (!currentPageInput || currentPageInput <= book.currentPage) {
      setPagesError(true)
      return
    }
    if (book.totalPages && currentPageInput > book.totalPages) {
      setPagesError(true)
      return
    }
    setPagesError(false)
    setIsLogging(false)
    setPagesInput('')
    await onRegisterReading(book.id, currentPageInput - book.currentPage)
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!book) return
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingCover(true)
    try {
      const url = await bookService.uploadCover(book.id, file)
      onCoverUpdated(book.id, url)
    } finally {
      setIsUploadingCover(false)
      e.target.value = ''
    }
  }

  function handleClose() {
    setIsLogging(false)
    setPagesInput('')
    setPagesError(false)
    setIsEditing(false)
    onClose()
  }

  if (!book) return null

  const isDone = book.status === 'lido'
  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)
  const badge = STATUS_BADGE[book.status]

  const inputClass =
    'w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/30 focus:border-black/25 dark:border-white/10 dark:bg-white/8 dark:text-white/80 dark:placeholder:text-white/30 dark:focus:border-white/20'

  return (
    <AnimatePresence>
      {book && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-xl dark:bg-black/85"
          >
            {/* Header buttons */}
            <div className="absolute right-3 top-3 flex items-center gap-1">
              {!isEditing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
                  title="Editar livro"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cover + info row */}
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="h-32 rounded-lg object-cover shadow" style={{ width: '5.5rem' }} />
                ) : (
                  <div
                    className="flex h-32 items-center justify-center rounded-lg text-3xl font-bold text-white shadow"
                    style={{ backgroundColor: coverColor, width: '5.5rem' }}
                  >
                    {coverLetter}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute -bottom-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                  title="Alterar capa"
                >
                  {isUploadingCover ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
              </div>

              {/* Info / edit fields */}
              {isEditing ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Título*"
                    className={inputClass}
                  />
                  <input
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    placeholder="Autor"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={1}
                    value={editPages}
                    onChange={(e) => setEditPages(e.target.value)}
                    placeholder="Total de páginas"
                    className={inputClass}
                  />
                  <input
                    value={editCollection}
                    onChange={(e) => setEditCollection(e.target.value)}
                    list="edit-book-collections"
                    placeholder="Coleção / série"
                    className={inputClass}
                  />
                  {existingCollections.length > 0 && (
                    <datalist id="edit-book-collections">
                      {existingCollections.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  )}
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
                  {badge && (
                    <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.classes}`}>
                      {badge.label}
                    </span>
                  )}
                  <p className="text-base font-semibold leading-tight text-black/90 dark:text-white/90">
                    {book.title}
                  </p>
                  {book.author && <p className="text-xs text-black/50 dark:text-white/50">{book.author}</p>}
                  {book.collection && (
                    <span className="flex items-center gap-1 text-[10px] text-black/40 dark:text-white/40">
                      <Layers className="h-2.5 w-2.5 shrink-0" />
                      {book.collection}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Edit save/cancel */}
            {isEditing && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl border border-black/10 py-2 text-sm font-medium text-black/60 hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isSavingEdit || !editTitle.trim()}
                  className="flex-1 rounded-xl bg-black/80 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/90"
                >
                  {isSavingEdit ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            )}

            {/* Progress bar — only in view mode */}
            {!isEditing && book.totalPages && (
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-[#00E08A]'}`}
                    animate={{ width: `${book.percentage}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                {isDone ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3 w-3" />
                    100% lido
                  </span>
                ) : (
                  <span className="text-[11px] text-black/50 dark:text-white/50">
                    {book.currentPage}/{book.totalPages} pág.
                  </span>
                )}
              </div>
            )}

            {/* Actions — only in view mode */}
            {!isEditing && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex gap-1 overflow-hidden rounded-lg bg-black/5 p-1 dark:bg-white/10">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChangeStatus(book.id, opt.value)}
                      className={`flex flex-1 items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors ${
                        book.status === opt.value
                          ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                          : 'text-black/50 dark:text-white/50'
                      }`}
                    >
                      {opt.value === 'lido' && book.status === 'lido' && (
                        <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {book.status === 'lendo' && !isLogging && (
                    <button
                      type="button"
                      onClick={() => setIsLogging(true)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Registrar leitura
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRequestDelete(book.id)}
                    className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>

                {isLogging && (
                  <div className="flex flex-col gap-1.5">
                    {pagesError && (
                      <p className="text-[11px] text-red-500 dark:text-red-400">
                        {book.totalPages
                          ? `Insira uma página entre ${book.currentPage + 1} e ${book.totalPages}.`
                          : `Deve ser maior que a página atual (${book.currentPage}).`}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={book.currentPage + 1}
                        max={book.totalPages ?? undefined}
                        autoFocus
                        value={pagesInput}
                        onChange={(e) => { setPagesInput(e.target.value); setPagesError(false) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRegister() }}
                        placeholder={`Parei na página… (atual: ${book.currentPage})`}
                        className={`flex-1 rounded-lg border bg-white/40 px-2 py-1.5 text-xs text-black/80 outline-none dark:bg-black/30 dark:text-white/80 ${pagesError ? 'border-red-400' : 'border-white/30'}`}
                      />
                      <button type="button" onClick={handleRegister} className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-amber-950">
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsLogging(false); setPagesInput('') }}
                        className="rounded-lg border border-white/30 px-2 py-1.5 text-xs text-black/50 dark:text-white/50"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']
  return colors[Math.abs(hash) % colors.length]
}
