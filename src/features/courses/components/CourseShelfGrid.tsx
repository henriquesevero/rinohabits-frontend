import { motion } from 'framer-motion'
import type { Course, CourseStatus } from '../types/course.types'

interface CourseShelfGridProps {
  courses: Course[]
  onSelect: (courseId: string) => void
}

const STATUS_TAG: Record<CourseStatus, { label: string; className: string }> = {
  fazendo:     { label: 'Fazendo',    className: 'bg-amber-500/90 text-white' },
  quero_fazer: { label: 'Quero Fazer', className: 'bg-blue-500/90 text-white' },
  concluido:   { label: 'Concluído',  className: 'bg-emerald-500/90 text-white' },
}

export function CourseShelfGrid({ courses, onSelect }: CourseShelfGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {courses.map((course) => (
        <CoursePoster key={course.id} course={course} onSelect={onSelect} />
      ))}
    </div>
  )
}

function CoursePoster({ course, onSelect }: { course: Course; onSelect: (courseId: string) => void }) {
  const coverLetter = course.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(course.title)
  const tag = STATUS_TAG[course.status]

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={() => onSelect(course.id)}
      className="flex flex-col text-left"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md">
        {course.coverUrl ? (
          <img src={course.coverUrl} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: coverColor }}
          >
            {coverLetter}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm ${tag.className}`}>
            {tag.label}
          </span>
        </div>
      </div>

    </motion.button>
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
