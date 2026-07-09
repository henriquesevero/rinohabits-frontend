import { Check, ChevronDown, ChevronRight, ChevronUp, Layers, Pencil, Trash2, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { Course, CourseStatus } from '../types/course.types'

interface CourseShelfGridProps {
  courses: Course[]
  onSelect: (courseId: string) => void
  onRenameCollection?: (oldName: string, newName: string) => Promise<void>
  onDeleteCollection?: (name: string) => Promise<void>
}

const STATUS_BOOKMARK: Record<CourseStatus, string> = {
  na_prateleira: '#9ca3af',
  fazendo:       '#f59e0b',
  quero_fazer:   '#3b82f6',
  concluido:     '#10b981',
}

export const COURSE_COLLECTION_STORAGE_KEY = 'courses-collection-order'
const COLLAPSED_KEY = 'courses-collapsed-collections'

function loadSavedOrder(): string[] {
  try { return JSON.parse(localStorage.getItem(COURSE_COLLECTION_STORAGE_KEY) ?? '[]') } catch { return [] }
}
function persistOrder(order: string[]) {
  try { localStorage.setItem(COURSE_COLLECTION_STORAGE_KEY, JSON.stringify(order)) } catch {}
}
function loadCollapsed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? '[]')) } catch { return new Set() }
}
function persistCollapsed(s: Set<string>) {
  try { localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...s])) } catch {}
}

export function CourseShelfGrid({ courses, onSelect, onRenameCollection, onDeleteCollection }: CourseShelfGridProps) {
  const [savedOrder, setSavedOrder] = useState<string[]>(loadSavedOrder)
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  const sortedCollectionNames = useMemo(() => {
    const fromCourses = [...new Set(courses.filter((c) => c.collection).map((c) => c.collection!))]
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

  function toggleCollapsed(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      persistCollapsed(next)
      return next
    })
  }

  function moveCollection(name: string, dir: 'up' | 'down') {
    const idx = sortedCollectionNames.indexOf(name)
    const newOrder = [...sortedCollectionNames]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newOrder.length) return
    ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
    setSavedOrder(newOrder)
    persistOrder(newOrder)
  }

  function startEditing(name: string) {
    setConfirmDelete(null)
    setEditingName(name)
    setEditingValue(name)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  function cancelEditing() {
    setEditingName(null)
    setEditingValue('')
  }

  async function saveRename(oldName: string) {
    const newName = editingValue.trim()
    if (!newName || newName === oldName) { cancelEditing(); return }
    setIsSaving(true)
    try {
      await onRenameCollection?.(oldName, newName)
      setSavedOrder((prev) => {
        const next = prev.map((n) => (n === oldName ? newName : n))
        persistOrder(next)
        return next
      })
      setCollapsed((prev) => {
        const next = new Set(prev)
        if (next.has(oldName)) { next.delete(oldName); next.add(newName) }
        persistCollapsed(next)
        return next
      })
    } finally {
      setIsSaving(false)
      setEditingName(null)
    }
  }

  async function handleDelete(name: string) {
    setIsSaving(true)
    try {
      await onDeleteCollection?.(name)
      setSavedOrder((prev) => {
        const next = prev.filter((n) => n !== name)
        persistOrder(next)
        return next
      })
      setCollapsed((prev) => {
        const next = new Set(prev)
        next.delete(name)
        persistCollapsed(next)
        return next
      })
    } finally {
      setIsSaving(false)
      setConfirmDelete(null)
    }
  }

  const iconBtn = 'flex h-6 w-6 shrink-0 items-center justify-center rounded text-black/30 transition-colors hover:bg-black/5 hover:text-black/60 disabled:opacity-20 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white/60'

  if (sortedCollectionNames.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {ungrouped.map((course) => <CoursePoster key={course.id} course={course} onSelect={onSelect} />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {sortedCollectionNames.map((name, idx) => {
        const collectionCourses = collectionMap.get(name) ?? []
        const isFirst = idx === 0
        const isLast = idx === sortedCollectionNames.length - 1
        const isCollapsed = collapsed.has(name)
        const isEditing = editingName === name
        const isConfirming = confirmDelete === name

        return (
          <div key={name} className="flex flex-col gap-2">
            {isConfirming ? (
              <div className="flex items-center gap-1">
                <Trash2 className="h-3 w-3 shrink-0 text-red-400" />
                <span className="flex-1 truncate text-xs text-black/50 dark:text-white/50">
                  Excluir &ldquo;{name}&rdquo;?
                </span>
                <button type="button" disabled={isSaving} onClick={() => handleDelete(name)} className={`${iconBtn} text-red-400 hover:text-red-500 dark:text-red-400`} aria-label="Confirmar exclusão">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setConfirmDelete(null)} className={iconBtn} aria-label="Cancelar">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : isEditing ? (
              <div className="flex items-center gap-1">
                <Layers className="h-3 w-3 shrink-0 text-black/40 dark:text-white/40" />
                <input
                  ref={editInputRef}
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename(name)
                    if (e.key === 'Escape') cancelEditing()
                  }}
                  disabled={isSaving}
                  className="flex-1 rounded border border-black/15 bg-white/60 px-2 py-0.5 text-xs font-semibold text-black/70 outline-none dark:border-white/15 dark:bg-white/8 dark:text-white/70"
                />
                <button type="button" disabled={isSaving} onClick={() => saveRename(name)} className={`${iconBtn} text-emerald-500 hover:text-emerald-600 dark:text-emerald-400`} aria-label="Salvar">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={cancelEditing} className={iconBtn} aria-label="Cancelar">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => toggleCollapsed(name)} className="flex min-w-0 flex-1 items-center gap-1 text-left">
                  <Layers className="h-3 w-3 shrink-0 text-black/40 dark:text-white/40" />
                  <span className="flex-1 truncate text-xs font-semibold text-black/50 dark:text-white/50">{name}</span>
                  {isCollapsed
                    ? <ChevronRight className="h-3 w-3 shrink-0 text-black/30 dark:text-white/30" />
                    : <ChevronDown className="h-3 w-3 shrink-0 text-black/30 dark:text-white/30" />
                  }
                </button>
                <button type="button" onClick={() => startEditing(name)} className={iconBtn} aria-label="Renomear coleção">
                  <Pencil className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => { setEditingName(null); setConfirmDelete(name) }} className={`${iconBtn} hover:text-red-500 dark:hover:text-red-400`} aria-label="Excluir coleção">
                  <Trash2 className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => moveCollection(name, 'up')} disabled={isFirst} className={iconBtn} aria-label="Mover coleção para cima">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => moveCollection(name, 'down')} disabled={isLast} className={iconBtn} aria-label="Mover coleção para baixo">
                  <ChevronUp className="h-3.5 w-3.5 rotate-180" />
                </button>
              </div>
            )}

            {!isCollapsed && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {collectionCourses.map((course) => <CoursePoster key={course.id} course={course} onSelect={onSelect} />)}
              </div>
            )}
          </div>
        )
      })}

      {ungrouped.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ungrouped.map((course) => <CoursePoster key={course.id} course={course} onSelect={onSelect} />)}
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
          <img src={course.coverUrl} alt={course.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full select-none items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: coverColor }}>
            {coverLetter}
          </div>
        )}
        <div className="absolute left-2 top-0 w-3 shadow-sm" style={{ height: 20, backgroundColor: bookmarkColor, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)' }} />
      </div>
    </button>
  )
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']
  return colors[Math.abs(hash) % colors.length]
}
