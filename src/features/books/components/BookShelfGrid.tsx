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
  // Track whether a drag just ended so we can cancel the next click
  const justDragged = useRef(false)

  const sensors = useSensors(
    // Desktop mouse: small distance threshold feels snappy
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Mobile touch: long-press (350 ms) prevents conflict with horizontal swipe
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 6 } }),
  )

  const activeBook = books.find((b) => b.id === activeId) ?? null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
    justDragged.current = false
    // Haptic feedback on devices that support it
    if (navigator.vibrate) navigator.vibrate(30)
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
    if (justDragged.current) {
      justDragged.current = false
      return
    }
    onSelect(bookId)
  }

  return (
    // data-no-swipe tells AppShell to skip swipe-tab detection in this zone
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
                onSelect={handleSelect}
                isDragging={activeId === book.id}
                anyDragging={activeId !== null}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeBook && (
            <div
              className="pointer-events-none"
              style={{
                transform: 'scale(1.08)',
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.35))',
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

interface SortableBookPosterProps {
  book: Book
  onSelect: (bookId: string) => void
  isDragging: boolean
  anyDragging: boolean
}

function SortableBookPoster({ book, onSelect, isDragging, anyDragging }: SortableBookPosterProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: book.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    // Hide original item while dragging (overlay takes its place)
    opacity: isSortableDragging ? 0 : 1,
    // Prevent text selection during drag
    userSelect: 'none' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // touch-action: none is required for dnd-kit touch sensor to work correctly
      className="touch-none"
      onClick={() => { if (!anyDragging) onSelect(book.id) }}
    >
      <BookPoster book={book} dimmed={anyDragging && !isDragging} />
    </div>
  )
}

function BookPoster({ book, dimmed }: { book: Book; dimmed?: boolean }) {
  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)
  const bookmarkColor = STATUS_BOOKMARK[book.status]

  return (
    <div
      className="flex flex-col"
      style={{
        transition: 'opacity 0.15s ease',
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xl font-bold text-white select-none"
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
