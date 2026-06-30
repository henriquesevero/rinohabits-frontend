import { useEffect, useState } from 'react'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { CourseDetailModal } from '../features/courses/components/CourseDetailModal'
import { CourseShelfGrid } from '../features/courses/components/CourseShelfGrid'
import { CreateCourseForm } from '../features/courses/components/CreateCourseForm'
import { useCourses } from '../features/courses/hooks/useCourses'
import type { CourseStatus } from '../features/courses/types/course.types'

type ShelfFilter = 'all' | CourseStatus

const TABS: { status: ShelfFilter; label: string; emoji: string }[] = [
  { status: 'all', label: 'Todos', emoji: '🎓' },
  { status: 'fazendo', label: 'Fazendo', emoji: '▶️' },
  { status: 'quero_fazer', label: 'Quero Fazer', emoji: '📌' },
  { status: 'concluido', label: 'Concluído', emoji: '✅' },
]

const SHELF_ORDER: Record<CourseStatus, number> = { fazendo: 0, quero_fazer: 1, concluido: 2 }

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

  const filtered =
    activeStatus === 'all'
      ? [...courses].sort((a, b) => SHELF_ORDER[a.status] - SHELF_ORDER[b.status])
      : courses.filter((c) => c.status === activeStatus)

  const counts: Record<ShelfFilter, number> = {
    all: courses.length,
    fazendo: courses.filter((c) => c.status === 'fazendo').length,
    quero_fazer: courses.filter((c) => c.status === 'quero_fazer').length,
    concluido: courses.filter((c) => c.status === 'concluido').length,
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
    <div className="flex h-full flex-col gap-4">
      <CourseDetailModal
        course={selectedCourse}
        onRegisterStudy={registerStudy}
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

      <div className="flex gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            onClick={() => setActiveStatus(tab.status)}
            className={`relative flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[11px] font-medium transition-colors ${
              activeStatus === tab.status
                ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                : 'text-black/50 dark:text-white/50'
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {counts[tab.status] > 0 && (
              <span
                className={`rounded-full px-1 py-0.5 text-[10px] font-bold ${
                  activeStatus === tab.status
                    ? 'bg-indigo-500 text-white'
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

      <CourseShelfGrid courses={filtered} onSelect={setSelectedCourseId} />

      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-sm text-black/40 dark:text-white/40">
          {activeStatus === 'all' && 'Nenhum curso cadastrado. Adicione um para começar.'}
          {activeStatus === 'fazendo' && 'Nenhum curso em andamento.'}
          {activeStatus === 'quero_fazer' && 'Nenhum curso na lista de desejo.'}
          {activeStatus === 'concluido' && 'Nenhum curso concluído ainda.'}
        </p>
      )}

      <CreateCourseForm onCreate={createCourse} />
    </div>
  )
}
