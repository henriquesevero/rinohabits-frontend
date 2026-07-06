import { AnimatePresence } from 'framer-motion'
import { Archive, BadgeCheck, CirclePlay, LayoutGrid, Pin, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { CourseCard } from '../features/courses/components/CourseCard'
import { CourseDetailModal } from '../features/courses/components/CourseDetailModal'
import { CourseShelfGrid } from '../features/courses/components/CourseShelfGrid'
import { CreateCourseForm } from '../features/courses/components/CreateCourseForm'
import { useCourses } from '../features/courses/hooks/useCourses'
import type { Course, CourseStatus } from '../features/courses/types/course.types'

type ShelfFilter = 'all' | CourseStatus

const TABS: { status: ShelfFilter; label: string; icon: LucideIcon }[] = [
  { status: 'all',           label: 'Todos',       icon: LayoutGrid },
  { status: 'quero_fazer',   label: 'Quero Fazer', icon: Pin        },
  { status: 'fazendo',       label: 'Fazendo',     icon: CirclePlay },
  { status: 'concluido',     label: 'Feito',       icon: BadgeCheck },
  { status: 'na_prateleira', label: 'Prateleira',  icon: Archive    },
]

const SHELF_ORDER: Record<CourseStatus, number> = {
  quero_fazer:   0,
  fazendo:       1,
  concluido:     2,
  na_prateleira: 3,
}

export function CoursesPage() {
  const [activeStatus, setActiveStatus] = useState<ShelfFilter>('all')
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const {
    courses,
    isLoading,
    createCourse,
    registerStudy,
    changeStatus,
    deleteCourse,
    updateCover,
    justCompletedCourse,
    clearJustCompleted,
  } = useCourses()

  useEffect(() => {
    if (!justCompletedCourse) return
    const timeout = setTimeout(clearJustCompleted, 5500)
    return () => clearTimeout(timeout)
  }, [justCompletedCourse, clearJustCompleted])

  const filtered = activeStatus === 'all' ? sortForShelf(courses) : courses.filter((c) => c.status === activeStatus)

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

  const courseToDeleteTitle = courses.find((c) => c.id === courseToDelete)?.title
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null

  return (
    <div className="flex flex-col gap-4">
      <CourseDetailModal
        course={selectedCourse}
        onRegisterStudy={async (id, hours) => { await registerStudy(id, hours) }}
        onChangeStatus={changeStatus}
        onCoverUpdated={updateCover}
        onRequestDelete={setCourseToDelete}
        onClose={() => setSelectedCourseId(null)}
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

      {isLoading && (
        <p className="text-center text-sm text-black/50 dark:text-white/50">Carregando…</p>
      )}

      {activeStatus === 'all' ? (
        <>
          <CourseShelfGrid courses={filtered} onSelect={setSelectedCourseId} />
          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-black/40 dark:text-white/40">
              Nenhum curso cadastrado. Adicione um para começar.
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onRegisterStudy={async (id, hours) => { await registerStudy(id, hours) }}
                onChangeStatus={changeStatus}
                onDelete={setCourseToDelete}
                onCoverUpdated={updateCover}
              />
            ))}
          </AnimatePresence>

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-black/40 dark:text-white/40">
              {activeStatus === 'fazendo' && 'Nenhum curso em andamento.'}
              {activeStatus === 'quero_fazer' && 'Nenhum curso na lista de desejo.'}
              {activeStatus === 'concluido' && 'Nenhum curso concluído ainda.'}
              {activeStatus === 'na_prateleira' && 'Nenhum curso na prateleira.'}
            </p>
          )}
        </div>
      )}

      <CreateCourseForm onCreate={createCourse} />
    </div>
  )
}
