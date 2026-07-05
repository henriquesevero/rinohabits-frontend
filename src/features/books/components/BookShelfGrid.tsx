import { motion } from 'framer-motion'
import type { Book, BookStatus } from '../types/book.types'

interface BookShelfGridProps {
  books: Book[]
  onSelect: (bookId: string) => void
}

const STATUS_SEAL: Record<BookStatus, string> = {
  lido: 'bg-emerald-500',
  lendo: 'bg-amber-500',
  quero_ler: 'bg-blue-500',
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

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={() => onSelect(book.id)}
      className="flex flex-col gap-1.5 text-left"
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
        <span
          className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white/90 shadow ${STATUS_SEAL[book.status]}`}
        />
      </div>
      <span className="line-clamp-2 px-0.5 text-[11px] leading-tight text-black/70 dark:text-white/70">
        {book.title}
      </span>
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
