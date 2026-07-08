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
import { Check, GripVertical, Layers, X } from 'lucide-react'
import { useMemo, useState } from 'react'
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

const STORAGE_KEY = 'books-collection-order'

function loadSavedOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function BookReorderPanel({ books: initialBooks, onConfirm, onCancel }: BookReorderPanelProps) {
  const savedOrder = useMemo(loadSavedOrder, [])

  // Sorted collection names (mirrors BookShelfGrid order)
  const sortedCollectionNames = useMemo(() => {
    const fromBooks = [...new Set(
      initialBooks.filter((b) => b.collection).map((b) => b.collection!)
    )]
    const inOrder = savedOrder.filter((c) => fromBooks.includes(c))
    const notInOrder = fromBooks.filter((c) => !savedOrder.includes(c)).sort((a, b) => a.localeCompare(b))
    return [...inOrder, ...notInOrder]
  }, [initialBooks, savedOrder])

  // Mutable per-section order: collection name → books[]  |  null → ungrouped
  const [sections, setSections] = useState<Map<string | null, Book[]>>(() => {
    const map = new Map<string | null, Book[]>()
    for (const name of sortedCollectionNames) {
      map.set(name, initialBooks.filter((b) => b.collection === name))
    }
    map.set(null, initialBooks.filter((b) => !b.collection))
    return map
  })

  function reorderSection(key: string | null, activeId: string, overId: string) {
    setSections((prev) => {
      const current = prev.get(key) ?? []
      const oldIdx = current.findIndex((b) => b.id === activeId)
      const newIdx = current.findIndex((b) => b.id === overId)
      const next = new Map(prev)
      next.set(key, arrayMove(current, oldIdx, newIdx))
      return next
    })
  }

  function handleConfirm() {
    const ids: string[] = []
    for (const name of sortedCollectionNames) {
      ids.push(...(sections.get(name) ?? []).map((b) => b.id))
    }
    ids.push(...(sections.get(null) ?? []).map((b) => b.id))
    onConfirm(ids)
  }

  const ungrouped = sections.get(null) ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-black/70 dark:text-white/70">Reordenar estante</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-xl border border-black/15 px-3 py-1.5 text-sm font-medium text-black/60 dark:border-white/20 dark:text-white/60"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1 rounded-xl bg-[#007a4c] px-3 py-1.5 text-sm font-semibold text-white dark:bg-[#00E08A] dark:text-black"
          >
            <Check className="h-3.5 w-3.5" />
            Concluído
          </button>
        </div>
      </div>

      {/* Collection sections */}
      {sortedCollectionNames.map((name) => {
        const books = sections.get(name) ?? []
        return (
          <SortableSection
            key={name}
            sectionKey={name}
            label={name}
            books={books}
            onReorder={reorderSection}
          />
        )
      })}

      {/* Ungrouped books */}
      {ungrouped.length > 0 && (
        <SortableSection
          sectionKey={null}
          label={null}
          books={ungrouped}
          onReorder={reorderSection}
        />
      )}
    </div>
  )
}

function SortableSection({
  sectionKey,
  label,
  books,
  onReorder,
}: {
  sectionKey: string | null
  label: string | null
  books: Book[]
  onReorder: (key: string | null, activeId: string, overId: string) => void
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onReorder(sectionKey, String(active.id), String(over.id))
  }

  return (
    <div className="flex flex-col gap-1.5" data-no-swipe>
      {label && (
        <div className="flex items-center gap-1.5 px-1">
          <Layers className="h-3 w-3 text-black/40 dark:text-white/40" />
          <span className="text-xs font-semibold text-black/50 dark:text-white/50">{label}</span>
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={books.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {books.map((book) => (
              <SortableBookRow key={book.id} book={book} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
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
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab p-0.5 active:cursor-grabbing"
        aria-label="Arraste para reordenar"
      >
        <GripVertical className="h-4 w-4 text-black/25 dark:text-white/25" />
      </button>

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

      <p className="min-w-0 flex-1 truncate text-sm font-medium text-black/80 dark:text-white/80">
        {book.title}
      </p>

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
