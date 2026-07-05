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
import { GripVertical } from 'lucide-react'
import type { TodayHabit } from '../types/habit.types'
import { HabitCard } from './HabitCard'

interface HabitListProps {
  habits: TodayHabit[]
  onToggle: (habitId: string) => void
  onEdit: (habitId: string) => void
  onDelete: (habitId: string) => void
  onReorder: (reorderedIds: string[]) => void
}

export function HabitList({ habits, onToggle, onEdit, onDelete, onReorder }: HabitListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = habits.findIndex((h) => h.habit.id === active.id)
    const newIndex = habits.findIndex((h) => h.habit.id === over.id)
    onReorder(arrayMove(habits, oldIndex, newIndex).map((h) => h.habit.id))
  }

  if (habits.length === 0) {
    return (
      <p className="text-center text-sm text-black/50 dark:text-white/50">
        Nenhum hábito obrigatório hoje. Adicione um para começar.
      </p>
    )
  }

  return (
    <div data-no-swipe>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={habits.map((h) => h.habit.id)} strategy={verticalListSortingStrategy}>
          <div className="flex w-full flex-col gap-2">
            {habits.map((item) => (
              <SortableHabitRow
                key={item.habit.id}
                item={item}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableHabitRow({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: TodayHabit
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.habit.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-stretch gap-1"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex touch-none cursor-grab items-center px-1 active:cursor-grabbing"
        aria-label="Arraste para reordenar"
      >
        <GripVertical className="h-4 w-4 text-black/20 dark:text-white/20" />
      </button>
      <div className="min-w-0 flex-1">
        <HabitCard item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}
