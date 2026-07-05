import { motion } from 'framer-motion'
import type { Course, CourseStatus } from '../types/course.types'

interface CourseShelfGridProps {
  courses: Course[]
  onSelect: (courseId: string) => void
}

const STATUS_BOOKMARK: Record<CourseStatus, string> = {
  fazendo:     '#f59e0b',
  quero_fazer: '#3b82f6',
  concluido:   '#10b981',
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
  const bookmarkColor = STATUS_BOOKMARK[course.status]

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
        <div
          className="absolute left-2 top-0 w-3 shadow-sm"
          style={{
            height: 20,
            backgroundColor: bookmarkColor,
            clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
          }}
        />
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
