import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical, X } from 'lucide-react'
import { useState } from 'react'
import type { Book, BookStatus } from '../types/book.types'

interface BookReorderPanelProps {
  books: Book[]
  onConfirm: (orderedIds: string[]) => void
  onCancel: () => void
}

const STATUS_COLOR: Record<BookStatus, string> = {
  na_estante: '#94a3b8',
  quero_ler:  '#3b82f6',
  lendo:      '#f59e0b',
  lido:       '#10b981',
}

const STATUS_LABEL: Record<BookStatus, string> = {
  na_estante: 'Estante',
  quero_ler:  'Quero Ler',
  lendo:      'Lendo',
  lido:       'Lido',
}

export function BookReorderPanel({ books: initialBooks, onConfirm, onCancel }: BookReorderPanelProps) {
  const [order, setOrder] = useState<Book[]>(initialBooks)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = order.findIndex((b) => b.id === active.id)
    const newIndex = order.findIndex((b) => b.id === over.id)
    setOrder((prev) => arrayMove(prev, oldIndex, newIndex))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-black/70 dark:text-white/70">Reordenar estante</p>
        <p className="text-xs text-black/40 dark:text-white/40">Segure e arraste</p>
      </div>

      {/* Sortable list */}
      <div data-no-swipe>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {order.map((book) => (
                <SortableBookRow key={book.id} book={book} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-medium text-black/60 dark:border-white/20 dark:text-white/60"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onConfirm(order.map((b) => b.id))}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#007a4c] px-4 py-2.5 text-sm font-semibold text-white dark:bg-[#00E08A] dark:text-black"
        >
          <Check className="h-4 w-4" />
          Concluído
        </button>
      </div>
    </div>
  )
}

function SortableBookRow({ book }: { book: Book }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id })

  const coverLetter = book.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(book.title)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/40 px-3 py-2.5 backdrop-blur-md dark:bg-black/30"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab p-0.5 active:cursor-grabbing"
        aria-label="Arraste para reordenar"
      >
        <GripVertical className="h-4 w-4 text-black/25 dark:text-white/25" />
      </button>

      {/* Mini cover */}
      <div className="flex-shrink-0 overflow-hidden rounded-md shadow-sm" style={{ width: 28, height: 42 }}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: coverColor }}
          >
            {coverLetter}
          </div>
        )}
      </div>

      {/* Title */}
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-black/80 dark:text-white/80">
        {book.title}
      </p>

      {/* Status dot */}
      {book.status !== 'na_estante' && (
        <span
          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: STATUS_COLOR[book.status] }}
        >
          {STATUS_LABEL[book.status]}
        </span>
      )}
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
