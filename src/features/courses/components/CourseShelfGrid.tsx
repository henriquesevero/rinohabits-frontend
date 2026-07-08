import { ChevronDown, ChevronUp, Layers } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Course, CourseStatus } from '../types/course.types'

interface CourseShelfGridProps {
  courses: Course[]
  onSelect: (courseId: string) => void
}

const STATUS_BOOKMARK: Record<CourseStatus, string> = {
  na_prateleira: '#9ca3af',
  fazendo:       '#f59e0b',
  quero_fazer:   '#3b82f6',
  concluido:     '#10b981',
}

export const COURSE_COLLECTION_STORAGE_KEY = 'courses-collection-order'

function loadSavedOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(COURSE_COLLECTION_STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persistOrder(order: string[]) {
  try {
    localStorage.setItem(COURSE_COLLECTION_STORAGE_KEY, JSON.stringify(order))
  } catch {}
}

export function CourseShelfGrid({ courses, onSelect }: CourseShelfGridProps) {
  const [savedOrder, setSavedOrder] = useState<string[]>(loadSavedOrder)

  const sortedCollectionNames = useMemo(() => {
    const fromCourses = [...new Set(
      courses.filter((c) => c.collection).map((c) => c.collection!)
    )]
    const inOrder = savedOrder.filter((c) => fromCourses.includes(c))
    const notInOrder = fromCourses.filter((c) => !savedOrder.includes(c)).sort((a, b) => a.localeCompare(b))
    return [...inOrder, ...notInOrder]
  }, [courses, savedOrder])

  const collectionMap = useMemo(() => {
    const map = new Map<string, Course[]>()
    for (const course of courses) {
      if (course.collection) {
        const arr = map.get(course.collection)
        if (arr) arr.push(course)
        else map.set(course.collection, [course])
      }
    }
    return map
  }, [courses])

  const ungrouped = useMemo(() => courses.filter((c) => !c.collection), [courses])

  function moveCollection(name: string, dir: 'up' | 'down') {
    const idx = sortedCollectionNames.indexOf(name)
    const newOrder = [...sortedCollectionNames]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newOrder.length) return
    ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
    setSavedOrder(newOrder)
    persistOrder(newOrder)
  }

  if (sortedCollectionNames.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {ungrouped.map((course) => (
          <CoursePoster key={course.id} course={course} onSelect={onSelect} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {sortedCollectionNames.map((name, idx) => {
        const collectionCourses = collectionMap.get(name) ?? []
        const isFirst = idx === 0
        const isLast = idx === sortedCollectionNames.length - 1

        return (
          <div key={name} className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 shrink-0 text-black/40 dark:text-white/40" />
              <span className="flex-1 text-xs font-semibold text-black/50 dark:text-white/50">{name}</span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveCollection(name, 'up')}
                  disabled={isFirst}
                  className="flex h-5 w-5 items-center justify-center rounded text-black/30 transition-colors hover:bg-black/5 hover:text-black/60 disabled:opacity-20 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white/60"
                  aria-label="Mover coleção para cima"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCollection(name, 'down')}
                  disabled={isLast}
                  className="flex h-5 w-5 items-center justify-center rounded text-black/30 transition-colors hover:bg-black/5 hover:text-black/60 disabled:opacity-20 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white/60"
                  aria-label="Mover coleção para baixo"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {collectionCourses.map((course) => (
                <CoursePoster key={course.id} course={course} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )
      })}

      {ungrouped.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ungrouped.map((course) => (
            <CoursePoster key={course.id} course={course} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

function CoursePoster({ course, onSelect }: { course: Course; onSelect: (id: string) => void }) {
  const coverLetter = course.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(course.title)
  const bookmarkColor = STATUS_BOOKMARK[course.status]

  return (
    <button type="button" onClick={() => onSelect(course.id)} className="flex flex-col text-left">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md">
        {course.coverUrl ? (
          <img src={course.coverUrl} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full select-none items-center justify-center text-xl font-bold text-white"
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
    </button>
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
