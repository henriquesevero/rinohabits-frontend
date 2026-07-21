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
import { AnimatePresence } from 'framer-motion'
import { Archive, ArrowUpDown, BadgeCheck, CirclePlay, GripVertical, Pin, Plus, Search, X, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { CourseCard } from '../features/courses/components/CourseCard'
import { CourseDetailModal } from '../features/courses/components/CourseDetailModal'
import { CourseReorderPanel } from '../features/courses/components/CourseReorderPanel'
import { CourseShelfGrid } from '../features/courses/components/CourseShelfGrid'
import { CreateCourseForm } from '../features/courses/components/CreateCourseForm'
import { useCourses } from '../features/courses/hooks/useCourses'
import type { Course, CourseStatus } from '../features/courses/types/course.types'

type ShelfFilter = 'all' | CourseStatus

const TABS: { status: ShelfFilter; label: string; icon: LucideIcon }[] = [
  { status: 'all',         label: 'Prateleira',  icon: Archive    },
  { status: 'quero_fazer', label: 'Quero Fazer', icon: Pin        },
  { status: 'fazendo',     label: 'Fazendo',     icon: CirclePlay },
  { status: 'concluido',   label: 'Feito',       icon: BadgeCheck },
]

const SHELF_ORDER: Record<CourseStatus, number> = {
  quero_fazer:   0,
  fazendo:       1,
  concluido:     2,
  na_prateleira: 3,
}

function sortForShelf(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => SHELF_ORDER[a.status] - SHELF_ORDER[b.status])
}

export function CoursesPage() {
  const [activeStatus, setActiveStatus] = useState<ShelfFilter>('all')
  const [filterQuery, setFilterQuery] = useState('')
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const {
    courses,
    isLoading,
    createCourse,
    updateCourse,
    registerStudy,
    changeStatus,
    deleteCourse,
    updateCover,
    reorderCourses,
    justCompletedCourse,
    clearJustCompleted,
  } = useCourses()

  useEffect(() => {
    if (activeStatus !== 'all') setIsReordering(false)
    setIsAddingCourse(false)
    setFilterQuery('')
  }, [activeStatus])

  useEffect(() => {
    if (!justCompletedCourse) return
    const timeout = setTimeout(clearJustCompleted, 5500)
    return () => clearTimeout(timeout)
  }, [justCompletedCourse, clearJustCompleted])

  const base = activeStatus === 'all' ? sortForShelf(courses) : courses.filter((c) => c.status === activeStatus)
  const q = filterQuery.trim().toLowerCase()
  const filtered = q
    ? base.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q) ||
          (c.collection ?? '').toLowerCase().includes(q),
      )
    : base

  const existingCollections = [...new Set(courses.map((c) => c.collection).filter(Boolean) as string[])]

  const counts: Record<ShelfFilter, number> = {
    all:           courses.length,
    quero_fazer:   courses.filter((c) => c.status === 'quero_fazer').length,
    fazendo:       courses.filter((c) => c.status === 'fazendo').length,
    concluido:     courses.filter((c) => c.status === 'concluido').length,
    na_prateleira: courses.filter((c) => c.status === 'na_prateleira').length,
  }

  async function handleDeleteConfirm() {
    if (courseToDelete) {
      await deleteCourse(courseToDelete)
      setCourseToDelete(null)
      setSelectedCourseId(null)
    }
  }

  async function handleReorderConfirm(orderedIds: string[]) {
    await reorderCourses(orderedIds)
    setIsReordering(false)
  }

  async function handleRenameCollection(oldName: string, newName: string) {
    const targets = courses.filter((c) => c.collection === oldName)
    await Promise.all(targets.map((c) => updateCourse(c.id, { collection: newName })))
  }

  async function handleDeleteCollection(name: string) {
    const targets = courses.filter((c) => c.collection === name)
    await Promise.all(targets.map((c) => updateCourse(c.id, { collection: '' })))
  }

  const courseToDeleteTitle = courses.find((c) => c.id === courseToDelete)?.title
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null

  return (
    <div className="flex flex-col gap-4">
      <CourseDetailModal
        course={selectedCourse}
        onRegisterStudy={async (id, hours) => { await registerStudy(id, hours) }}
        onChangeStatus={changeStatus}
        onUpdateCourse={updateCourse}
        onCoverUpdated={updateCover}
        onRequestDelete={setCourseToDelete}
        onClose={() => setSelectedCourseId(null)}
        existingCollections={existingCollections}
      />

      <ConfirmModal
        isOpen={courseToDelete !== null}
        title="Excluir curso"
        description={`Tem certeza que deseja excluir "${courseToDeleteTitle ?? 'este curso'}"? Todo o histórico de estudo será perdido permanentemente.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCourseToDelete(null)}
      />

      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Cursos</h1>
        <span className="text-xs text-black/50 dark:text-white/50">{courses.length} cursos</span>
      </div>

      {!isReordering && (
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/5 p-1 dark:bg-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              onClick={() => setActiveStatus(tab.status)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeStatus === tab.status
                  ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                  : 'text-black/50 dark:text-white/50'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={activeStatus === tab.status ? 2.5 : 1.8} />
              {tab.label}
              {counts[tab.status] > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeStatus === tab.status
                      ? 'bg-[#007a4c] text-white dark:bg-[#00E08A] dark:text-black'
                      : 'bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50'
                  }`}
                >
                  {counts[tab.status]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {!isReordering && courses.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/30 dark:text-white/30" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar por título, descrição ou coleção…"
            className="w-full rounded-xl border border-black/10 bg-white/50 py-2 pl-8 pr-8 text-sm text-black/80 placeholder:text-black/30 focus:border-black/20 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/30"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-black/30 hover:text-black/60 dark:text-white/30 dark:hover:text-white/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {activeStatus === 'all' && !isReordering && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsAddingCourse((v) => !v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-colors ${
              isAddingCourse
                ? 'border-black/20 bg-black/80 text-white dark:border-white/20 dark:bg-white/90 dark:text-black/90'
                : 'border-black/15 bg-white/40 text-black/60 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
            }`}
          >
            <Plus className="h-4 w-4" />
            Adicionar curso
          </button>

          {courses.length > 1 && (
            <button
              type="button"
              onClick={() => { setIsAddingCourse(false); setIsReordering(true) }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/15 bg-white/40 py-2.5 text-xs font-medium text-black/60 transition-colors hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
            >
              <ArrowUpDown className="h-4 w-4" />
              Reordenar
            </button>
          )}
        </div>
      )}

      {activeStatus === 'all' && !isReordering && (
        <CreateCourseForm
          onCreate={createCourse}
          open={isAddingCourse}
          onClose={() => setIsAddingCourse(false)}
          existingCollections={existingCollections}
        />
      )}

      {isLoading && (
        <p className="text-center text-sm text-black/50 dark:text-white/50">Carregando…</p>
      )}

      {activeStatus === 'all' && !isReordering && (
        <>
          <CourseShelfGrid
            courses={filtered}
            onSelect={setSelectedCourseId}
            onRenameCollection={handleRenameCollection}
            onDeleteCollection={handleDeleteCollection}
          />
          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-black/40 dark:text-white/40">
              {q ? 'Nenhum curso encontrado.' : 'Sua prateleira está vazia. Adicione um curso para começar.'}
            </p>
          )}
        </>
      )}

      {activeStatus === 'all' && isReordering && (
        <CourseReorderPanel
          courses={courses}
          onConfirm={handleReorderConfirm}
          onCancel={() => setIsReordering(false)}
        />
      )}

      {activeStatus !== 'all' && (
        <SortableCourseList
          courses={filtered}
          onRegisterStudy={async (id, hours) => { await registerStudy(id, hours) }}
          onChangeStatus={changeStatus}
          onDelete={setCourseToDelete}
          onCoverUpdated={updateCover}
          onReorder={reorderCourses}
          isLoading={isLoading}
          activeStatus={activeStatus}
        />
      )}
    </div>
  )
}

interface SortableCourseListProps {
  courses: Course[]
  onRegisterStudy: (courseId: string, hours: number) => Promise<void>
  onChangeStatus: (courseId: string, status: CourseStatus) => Promise<void>
  onDelete: (courseId: string) => void
  onCoverUpdated: (courseId: string, url: string) => void
  onReorder: (reorderedIds: string[]) => void
  isLoading: boolean
  activeStatus: ShelfFilter
}

function SortableCourseList({
  courses,
  onRegisterStudy,
  onChangeStatus,
  onDelete,
  onCoverUpdated,
  onReorder,
  isLoading,
  activeStatus,
}: SortableCourseListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = courses.findIndex((c) => c.id === active.id)
    const newIndex = courses.findIndex((c) => c.id === over.id)
    onReorder(arrayMove(courses, oldIndex, newIndex).map((c) => c.id))
  }

  return (
    <div data-no-swipe>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {courses.map((course) => (
                <SortableCourseCardRow
                  key={course.id}
                  course={course}
                  onRegisterStudy={onRegisterStudy}
                  onChangeStatus={onChangeStatus}
                  onDelete={onDelete}
                  onCoverUpdated={onCoverUpdated}
                />
              ))}
            </AnimatePresence>

            {!isLoading && courses.length === 0 && (
              <p className="text-center text-sm text-black/40 dark:text-white/40">
                {activeStatus === 'quero_fazer' && 'Nenhum curso na lista de desejo.'}
                {activeStatus === 'fazendo'     && 'Nenhum curso em andamento.'}
                {activeStatus === 'concluido'   && 'Nenhum curso concluído ainda.'}
                {activeStatus === 'na_prateleira' && 'Nenhum curso na prateleira.'}
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableCourseCardRow({
  course,
  onRegisterStudy,
  onChangeStatus,
  onDelete,
  onCoverUpdated,
}: {
  course: Course
  onRegisterStudy: (courseId: string, hours: number) => Promise<void>
  onChangeStatus: (courseId: string, status: CourseStatus) => Promise<void>
  onDelete: (courseId: string) => void
  onCoverUpdated: (courseId: string, url: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: course.id })

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
        <CourseCard
          course={course}
          onRegisterStudy={onRegisterStudy}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
          onCoverUpdated={onCoverUpdated}
        />
      </div>
    </div>
  )
}
