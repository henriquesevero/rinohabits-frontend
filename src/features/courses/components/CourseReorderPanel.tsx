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
import type { Course, CourseStatus } from '../types/course.types'

interface CourseReorderPanelProps {
  courses: Course[]
  onConfirm: (orderedIds: string[]) => void
  onCancel: () => void
}

const STATUS_COLOR: Record<CourseStatus, string> = {
  na_prateleira: '#9ca3af',
  quero_fazer:   '#3b82f6',
  fazendo:       '#f59e0b',
  concluido:     '#10b981',
}

const STATUS_LABEL: Record<CourseStatus, string> = {
  na_prateleira: 'Prateleira',
  quero_fazer:   'Quero Fazer',
  fazendo:       'Fazendo',
  concluido:     'Feito',
}

const STORAGE_KEY = 'courses-collection-order'

function loadSavedOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function CourseReorderPanel({ courses: initialCourses, onConfirm, onCancel }: CourseReorderPanelProps) {
  const savedOrder = useMemo(loadSavedOrder, [])

  // Sorted collection names (mirrors CourseShelfGrid order)
  const sortedCollectionNames = useMemo(() => {
    const fromCourses = [...new Set(
      initialCourses.filter((c) => c.collection).map((c) => c.collection!)
    )]
    const inOrder = savedOrder.filter((c) => fromCourses.includes(c))
    const notInOrder = fromCourses.filter((c) => !savedOrder.includes(c)).sort((a, b) => a.localeCompare(b))
    return [...inOrder, ...notInOrder]
  }, [initialCourses, savedOrder])

  // Mutable per-section order: collection name → courses[]  |  null → ungrouped
  const [sections, setSections] = useState<Map<string | null, Course[]>>(() => {
    const map = new Map<string | null, Course[]>()
    for (const name of sortedCollectionNames) {
      map.set(name, initialCourses.filter((c) => c.collection === name))
    }
    map.set(null, initialCourses.filter((c) => !c.collection))
    return map
  })

  function reorderSection(key: string | null, activeId: string, overId: string) {
    setSections((prev) => {
      const current = prev.get(key) ?? []
      const oldIdx = current.findIndex((c) => c.id === activeId)
      const newIdx = current.findIndex((c) => c.id === overId)
      const next = new Map(prev)
      next.set(key, arrayMove(current, oldIdx, newIdx))
      return next
    })
  }

  function handleConfirm() {
    const ids: string[] = []
    for (const name of sortedCollectionNames) {
      ids.push(...(sections.get(name) ?? []).map((c) => c.id))
    }
    ids.push(...(sections.get(null) ?? []).map((c) => c.id))
    onConfirm(ids)
  }

  const ungrouped = sections.get(null) ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-black/70 dark:text-white/70">Reordenar prateleira</p>
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
        const courses = sections.get(name) ?? []
        return (
          <SortableSection
            key={name}
            sectionKey={name}
            label={name}
            courses={courses}
            onReorder={reorderSection}
          />
        )
      })}

      {/* Ungrouped courses */}
      {ungrouped.length > 0 && (
        <SortableSection
          sectionKey={null}
          label={null}
          courses={ungrouped}
          onReorder={reorderSection}
        />
      )}
    </div>
  )
}

function SortableSection({
  sectionKey,
  label,
  courses,
  onReorder,
}: {
  sectionKey: string | null
  label: string | null
  courses: Course[]
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
        <SortableContext items={courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {courses.map((course) => (
              <SortableCourseRow key={course.id} course={course} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableCourseRow({ course }: { course: Course }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: course.id })

  const coverLetter = course.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(course.title)

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
        {course.coverUrl ? (
          <img src={course.coverUrl} alt="" className="h-full w-full object-cover" draggable={false} />
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
        {course.title}
      </p>

      {course.status !== 'na_prateleira' && (
        <span
          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: STATUS_COLOR[course.status] }}
        >
          {STATUS_LABEL[course.status]}
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
