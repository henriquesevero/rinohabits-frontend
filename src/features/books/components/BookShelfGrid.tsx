import { motion } from 'framer-motion'
import type { Book, BookStatus } from '../types/book.types'

interface BookShelfGridProps {
  books: Book[]
  onSelect: (bookId: string) => void
}

const STATUS_TAG: Record<BookStatus, { label: string; className: string }> = {
  lendo:     { label: 'Lendo',     className: 'bg-amber-500/90 text-white' },
  quero_ler: { label: 'Quero Ler', className: 'bg-blue-500/90 text-white' },
  lido:      { label: 'Lido',      className: 'bg-emerald-500/90 text-white' },
}

export function BookShelfGrid({ books, onSelect }: BookShelfGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {books.map((book) => (
        <BookPoster key={book.id} book={book} onSelect={onSelect} />
      ))}
    </div>
  )
}

function BookPoster({ book, onSelect }: { book: Book; onSelect: (bookId: string) => void }) {
  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)
  const tag = STATUS_TAG[book.status]

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={() => onSelect(book.id)}
      className="flex flex-col text-left"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: coverColor }}
          >
            {coverLetter}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm ${tag.className}`}>
            {tag.label}
          </span>
        </div>
      </div>

    </motion.button>
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
