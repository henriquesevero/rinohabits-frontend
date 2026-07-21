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
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import type { TodayHabit } from '../types/habit.types'

interface TodayHabitsGridProps {
  habits: TodayHabit[]
  onToggle: (habitId: string) => void
  onReorder: (reorderedIds: string[]) => void
}

const BURST_ANGLES = Array.from({ length: 8 }, (_, i) => (i * 360) / 8)

function HabitBurst({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="absolute rounded-full border-2"
        style={{ borderColor: color }}
        initial={{ width: 24, height: 24, opacity: 0.9 }}
        animate={{ width: 72, height: 72, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {BURST_ANGLES.map((angle) => {
        const rad = (angle * Math.PI) / 180
        return (
          <motion.div
            key={angle}
            className="absolute h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(rad) * 30, y: Math.sin(rad) * 30, scale: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

export function TodayHabitsGrid({ habits, onToggle, onReorder }: TodayHabitsGridProps) {
  const [burstId, setBurstId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const overlayWidth = useRef<number>(0)
  const justDragged = useRef(false)

  const completed = habits.filter((h) => h.isCompleted).length
  const total = habits.length
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 6 } }),
  )

  const activeHabit = habits.find((h) => h.habit.id === activeId) ?? null

  function handleDragStart({ active }: DragStartEvent) {
    const rect = active.rect.current.initial
    overlayWidth.current = rect ? Math.round(rect.width) : 80
    setActiveId(active.id as string)
    justDragged.current = false
    if (navigator.vibrate) navigator.vibrate(25)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.habit.id === active.id)
      const newIndex = habits.findIndex((h) => h.habit.id === over.id)
      onReorder(arrayMove(habits, oldIndex, newIndex).map((h) => h.habit.id))
      justDragged.current = true
    }
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function handleTap(habitId: string, isCompleted: boolean) {
    if (justDragged.current) { justDragged.current = false; return }
    if (!isCompleted) {
      setBurstId(habitId)
      setTimeout(() => setBurstId(null), 550)
    }
    onToggle(habitId)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-black/80 dark:text-white/80">Hábitos de Hoje</p>
          <p className="text-xs text-black/50 dark:text-white/50">{completed}/{total} completados</p>
        </div>
        <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-bold text-black/70 dark:bg-white/10 dark:text-white/70">
          {percentage}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {total === 0 ? (
        <p className="text-center text-xs text-black/40 dark:text-white/40">Nenhum hábito para hoje.</p>
      ) : (
        <div data-no-swipe>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={habits.map((h) => h.habit.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {habits.map(({ habit, isCompleted }) => (
                  <SortableHabitCell
                    key={habit.id}
                    habitId={habit.id}
                    icon={habit.icon}
                    name={habit.name}
                    color={habit.color}
                    isCompleted={isCompleted}
                    isDragging={activeId === habit.id}
                    hasBurst={burstId === habit.id}
                    onTap={handleTap}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
              {activeHabit && overlayWidth.current > 0 && (
                <div
                  style={{
                    width: overlayWidth.current,
                    transform: 'scale(1.1)',
                    transformOrigin: 'center top',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))',
                  }}
                >
                  <HabitCell
                    icon={activeHabit.habit.icon}
                    name={activeHabit.habit.name}
                    color={activeHabit.habit.color}
                    isCompleted={activeHabit.isCompleted}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      <p className="text-center text-[11px] text-black/40 dark:text-white/40">
        Toque para registrar · Segure para reordenar
      </p>
    </div>
  )
}

interface SortableHabitCellProps {
  habitId: string
  icon: string
  name: string
  color: string
  isCompleted: boolean
  isDragging: boolean
  hasBurst: boolean
  onTap: (habitId: string, isCompleted: boolean) => void
}

function SortableHabitCell({
  habitId,
  icon,
  name,
  color,
  isCompleted,
  isDragging,
  hasBurst,
  onTap,
}: SortableHabitCellProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: habitId })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0 : 1,
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      className="touch-none"
      onClick={() => onTap(habitId, isCompleted)}
    >
      <HabitCell icon={icon} name={name} color={color} isCompleted={isCompleted} hasBurst={hasBurst} />
    </div>
  )
}

function HabitCell({
  icon,
  name,
  color,
  isCompleted,
  hasBurst,
}: {
  icon: string
  name: string
  color: string
  isCompleted: boolean
  hasBurst?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <motion.span
          whileTap={{ scale: 0.82 }}
          animate={
            isCompleted
              ? { scale: [1, 1.25, 0.95, 1.08, 1], rotate: [0, -8, 8, -4, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors ${
            isCompleted ? '' : 'bg-black/5 dark:bg-white/10'
          }`}
          style={
            isCompleted
              ? {
                  backgroundColor: `${color}33`,
                  boxShadow: `0 0 0 2.5px ${color}, 0 0 16px ${color}55`,
                }
              : undefined
          }
        >
          {icon}
        </motion.span>
        {hasBurst && <HabitBurst color={color} />}
      </div>
      <span className="line-clamp-2 max-w-[5rem] break-words text-center text-[11px] leading-tight text-black/60 dark:text-white/60">
        {name}
      </span>
    </div>
  )
}
