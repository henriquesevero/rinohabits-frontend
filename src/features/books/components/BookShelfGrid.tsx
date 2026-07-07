import { Layers } from 'lucide-react'
import type { Book, BookStatus } from '../types/book.types'

interface BookShelfGridProps {
  books: Book[]
  onSelect: (bookId: string) => void
}

const STATUS_BOOKMARK: Partial<Record<BookStatus, string>> = {
  quero_ler: '#3b82f6',
  lendo:     '#f59e0b',
  lido:      '#10b981',
}

export function BookShelfGrid({ books, onSelect }: BookShelfGridProps) {
  const grouped = groupByCollection(books)

  if (grouped.collections.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {grouped.ungrouped.map((book) => (
          <BookPoster key={book.id} book={book} onSelect={onSelect} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {grouped.collections.map(({ name, books: collectionBooks }) => (
        <div key={name} className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-black/40 dark:text-white/40" />
            <span className="text-xs font-semibold text-black/50 dark:text-white/50">{name}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {collectionBooks.map((book) => (
              <BookPoster key={book.id} book={book} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}

      {grouped.ungrouped.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {grouped.ungrouped.map((book) => (
            <BookPoster key={book.id} book={book} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

function groupByCollection(books: Book[]) {
  const collectionMap = new Map<string, Book[]>()
  const ungrouped: Book[] = []

  for (const book of books) {
    if (book.collection) {
      const existing = collectionMap.get(book.collection)
      if (existing) {
        existing.push(book)
      } else {
        collectionMap.set(book.collection, [book])
      }
    } else {
      ungrouped.push(book)
    }
  }

  const collections = Array.from(collectionMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, books]) => ({ name, books }))

  return { collections, ungrouped }
}

function BookPoster({ book, onSelect }: { book: Book; onSelect: (id: string) => void }) {
  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)
  const bookmarkColor = STATUS_BOOKMARK[book.status]

  return (
    <button type="button" onClick={() => onSelect(book.id)} className="flex flex-col text-left">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full select-none items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: coverColor }}
          >
            {coverLetter}
          </div>
        )}
        {bookmarkColor && (
          <div
            className="absolute left-2 top-0 w-3 shadow-sm"
            style={{
              height: 20,
              backgroundColor: bookmarkColor,
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
            }}
          />
        )}
      </div>
    </button>
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
