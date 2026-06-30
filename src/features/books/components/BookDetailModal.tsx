import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Camera, CheckCircle, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { bookService } from '../services/bookService'
import type { Book, BookStatus } from '../types/book.types'

interface BookDetailModalProps {
  book: Book | null
  onRegisterReading: (bookId: string, pages: number) => Promise<void>
  onChangeStatus: (bookId: string, status: BookStatus) => Promise<void>
  onCoverUpdated: (bookId: string, url: string) => void
  onRequestDelete: (bookId: string) => void
  onClose: () => void
}

const STATUS_BADGE: Record<BookStatus, { label: string; classes: string }> = {
  lido: { label: 'Lido', classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  lendo: { label: 'Lendo', classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  quero_ler: { label: 'Pendente', classes: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
}

export function BookDetailModal({
  book,
  onRegisterReading,
  onChangeStatus,
  onCoverUpdated,
  onRequestDelete,
  onClose,
}: BookDetailModalProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [pagesInput, setPagesInput] = useState('')
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleRegister() {
    if (!book) return
    const pages = Number.parseInt(pagesInput, 10)
    if (!pages || pages <= 0) return
    setIsLogging(false)
    setPagesInput('')
    await onRegisterReading(book.id, pages)
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
    onClose()
  }

  if (!book) return null

  const isDone = book.status === 'lido'
  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)
  const badge = STATUS_BADGE[book.status]

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
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="h-32 w-22 rounded-lg object-cover shadow" />
                ) : (
                  <div
                    className="flex h-32 w-22 items-center justify-center rounded-lg text-3xl font-bold text-white shadow"
                    style={{ backgroundColor: coverColor, width: '5.5rem' }}
                  >
                    {coverLetter}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                  title="Alterar capa"
                >
                  {isUploadingCover ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.classes}`}
                >
                  {badge.label}
                </span>
                <p className="text-base font-semibold leading-tight text-black/90 dark:text-white/90">
                  {book.title}
                </p>
                {book.author && <p className="text-xs text-black/50 dark:text-white/50">{book.author}</p>}
              </div>
            </div>

            {book.totalPages && (
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-indigo-400'}`}
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

            <div className="mt-4">
              {isLogging ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    autoFocus
                    value={pagesInput}
                    onChange={(e) => setPagesInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRegister()
                    }}
                    placeholder="Páginas lidas hoje"
                    className="flex-1 rounded-lg border border-white/30 bg-white/40 px-2 py-1.5 text-xs text-black/80 outline-none dark:bg-black/30 dark:text-white/80"
                  />
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-amber-950"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogging(false)
                      setPagesInput('')
                    }}
                    className="rounded-lg border border-white/30 px-2 py-1.5 text-xs text-black/50 dark:text-white/50"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => setIsLogging(true)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Registrar
                    </button>
                  )}
                  {book.status === 'quero_ler' && (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(book.id, 'lendo')}
                      className="rounded-lg border border-white/30 px-2.5 py-1.5 text-xs text-black/60 dark:text-white/60"
                    >
                      Ler agora
                    </button>
                  )}
                  {book.status === 'lendo' && (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(book.id, 'lido')}
                      className="flex items-center gap-1 rounded-lg border border-white/30 px-2.5 py-1.5 text-xs text-black/60 dark:text-white/60"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Marcar lido
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
              )}
            </div>
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
