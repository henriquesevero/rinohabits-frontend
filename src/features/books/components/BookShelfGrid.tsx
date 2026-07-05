import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 5 } }),
  )

  const activeBook = books.find((b) => b.id === activeId) ?? null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = books.findIndex((b) => b.id === active.id)
    const newIndex = books.findIndex((b) => b.id === over.id)
    onReorder(arrayMove(books, oldIndex, newIndex).map((b) => b.id))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={books.map((b) => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {books.map((book) => (
            <SortableBookPoster key={book.id} book={book} onSelect={onSelect} isDraggingAny={activeId !== null} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeBook && <BookPoster book={activeBook} onSelect={() => {}} elevated />}
      </DragOverlay>
    </DndContext>
  )
}

function SortableBookPoster({
  book,
  onSelect,
  isDraggingAny,
}: {
  book: Book
  onSelect: (bookId: string) => void
  isDraggingAny: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => { if (!isDraggingAny) onSelect(book.id) }}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <BookPoster book={book} onSelect={() => {}} />
    </div>
  )
}

function BookPoster({
  book,
  onSelect,
  elevated,
}: {
  book: Book
  onSelect: (bookId: string) => void
  elevated?: boolean
}) {
  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)
  const bookmarkColor = STATUS_BOOKMARK[book.status]

  return (
    <div
      className={`flex flex-col text-left ${elevated ? 'shadow-2xl scale-105 rounded-lg' : ''}`}
      onClick={() => onSelect(book.id)}
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
