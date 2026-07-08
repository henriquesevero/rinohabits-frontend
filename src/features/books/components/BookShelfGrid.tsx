import { ChevronDown, ChevronUp, Layers } from 'lucide-react'
import { useMemo, useState } from 'react'
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

const STORAGE_KEY = 'books-collection-order'

function loadSavedOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persistOrder(order: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {}
}

export function BookShelfGrid({ books, onSelect }: BookShelfGridProps) {
  const [savedOrder, setSavedOrder] = useState<string[]>(loadSavedOrder)

  // Derive the ordered list of collection names from current books + user's saved order
  const sortedCollectionNames = useMemo(() => {
    const fromBooks = [...new Set(
      books.filter((b) => b.collection).map((b) => b.collection!)
    )]
    // Keep saved-order ones first; append new collections alphabetically at the end
    const inOrder = savedOrder.filter((c) => fromBooks.includes(c))
    const notInOrder = fromBooks.filter((c) => !savedOrder.includes(c)).sort((a, b) => a.localeCompare(b))
    return [...inOrder, ...notInOrder]
  }, [books, savedOrder])

  // Build collection → books map
  const collectionMap = useMemo(() => {
    const map = new Map<string, Book[]>()
    for (const book of books) {
      if (book.collection) {
        const arr = map.get(book.collection)
        if (arr) arr.push(book)
        else map.set(book.collection, [book])
      }
    }
    return map
  }, [books])

  const ungrouped = useMemo(() => books.filter((b) => !b.collection), [books])

  function moveCollection(name: string, dir: 'up' | 'down') {
    const idx = sortedCollectionNames.indexOf(name)
    const newOrder = [...sortedCollectionNames]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newOrder.length) return
    ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
    setSavedOrder(newOrder)
    persistOrder(newOrder)
  }

  if (sortedCollectionNames.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {ungrouped.map((book) => (
          <BookPoster key={book.id} book={book} onSelect={onSelect} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {sortedCollectionNames.map((name, idx) => {
        const collectionBooks = collectionMap.get(name) ?? []
        const isFirst = idx === 0
        const isLast = idx === sortedCollectionNames.length - 1

        return (
          <div key={name} className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 shrink-0 text-black/40 dark:text-white/40" />
              <span className="flex-1 text-xs font-semibold text-black/50 dark:text-white/50">{name}</span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveCollection(name, 'up')}
                  disabled={isFirst}
                  className="flex h-5 w-5 items-center justify-center rounded text-black/30 transition-colors hover:bg-black/5 hover:text-black/60 disabled:opacity-20 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white/60"
                  aria-label="Mover coleção para cima"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCollection(name, 'down')}
                  disabled={isLast}
                  className="flex h-5 w-5 items-center justify-center rounded text-black/30 transition-colors hover:bg-black/5 hover:text-black/60 disabled:opacity-20 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white/60"
                  aria-label="Mover coleção para baixo"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {collectionBooks.map((book) => (
                <BookPoster key={book.id} book={book} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )
      })}

      {ungrouped.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ungrouped.map((book) => (
            <BookPoster key={book.id} book={book} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
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
