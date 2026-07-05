import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef, useState } from 'react'
import type { Book, BookStatus } from '../types/book.types'

interface BookShelfGridProps {
  books: Book[]
  onSelect: (bookId: string) => void
  onReorder: (reorderedIds: string[]) => void
}

const STATUS_BOOKMARK: Record<BookStatus, string> = {
  na_estante: '#94a3b8',
  quero_ler:  '#3b82f6',
  lendo:      '#f59e0b',
  lido:       '#10b981',
}

export function BookShelfGrid({ books, onSelect, onReorder }: BookShelfGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  // Width of the actual grid cell, captured on drag start so the overlay matches
  const overlayWidth = useRef<number>(0)
  // Prevents the click handler from opening the modal right after a drag ends
  const justDragged = useRef(false)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Long-press on mobile: distinguishes drag from tap and from app swipe gesture
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 6 } }),
  )

  const activeBook = books.find((b) => b.id === activeId) ?? null

  function handleDragStart({ active }: DragStartEvent) {
    const rect = active.rect.current.initial
    overlayWidth.current = rect ? Math.round(rect.width) : 0
    setActiveId(active.id as string)
    justDragged.current = false
    if (navigator.vibrate) navigator.vibrate(25)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (over && active.id !== over.id) {
      const oldIndex = books.findIndex((b) => b.id === active.id)
      const newIndex = books.findIndex((b) => b.id === over.id)
      onReorder(arrayMove(books, oldIndex, newIndex).map((b) => b.id))
      justDragged.current = true
    }
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function handleSelect(bookId: string) {
    if (justDragged.current) { justDragged.current = false; return }
    onSelect(bookId)
  }

  return (
    // data-no-swipe: tells AppShell to skip swipe-tab detection inside this zone
    <div data-no-swipe>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={books.map((b) => b.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {books.map((book) => (
              <SortableBookPoster
                key={book.id}
                book={book}
                isDragging={activeId === book.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeBook && overlayWidth.current > 0 && (
            // Explicit width so BookPoster's w-full resolves to the grid cell size, not the viewport
            <div
              style={{
                width: overlayWidth.current,
                transform: 'scale(1.06)',
                transformOrigin: 'center top',
                filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.4))',
              }}
            >
              <BookPoster book={activeBook} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function SortableBookPoster({
  book,
  isDragging,
  onSelect,
}: {
  book: Book
  isDragging: boolean
  onSelect: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: book.id })

  return (
    <div
      ref={setNodeRef}
      // CSS.Translate (not CSS.Transform) — translate only, no scale
      // Scale from CSS.Transform breaks aspect-ratio containers in grids
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0 : 1,
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      className="touch-none cursor-grab active:cursor-grabbing"
      onClick={() => { if (!isDragging) onSelect(book.id) }}
    >
      <BookPoster book={book} />
    </div>
  )
}

function BookPoster({ book }: { book: Book }) {
  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)
  const bookmarkColor = STATUS_BOOKMARK[book.status]

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="flex h-full w-full select-none items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: coverColor }}
          >
            {coverLetter}
          </div>
        )}
        <div
          className="absolute left-2 top-0 w-3 shadow-sm"
          style={{
            height: 20,
            backgroundColor: bookmarkColor,
            clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
          }}
        />
      </div>
    </div>
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
