import { AnimatePresence, motion } from 'framer-motion'
import { Camera, CheckCircle, Clock, ExternalLink, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { courseService } from '../services/courseService'
import type { Course, CourseStatus } from '../types/course.types'

interface CourseDetailModalProps {
  course: Course | null
  onRegisterStudy: (courseId: string, hours: number) => Promise<void>
  onChangeStatus: (courseId: string, status: CourseStatus) => Promise<void>
  onCoverUpdated: (courseId: string, url: string) => void
  onRequestDelete: (courseId: string) => void
  onClose: () => void
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'na_prateleira', label: 'Prateleira'  },
  { value: 'quero_fazer',   label: 'Quero Fazer' },
  { value: 'fazendo',       label: 'Fazendo'     },
  { value: 'concluido',     label: 'Feito'       },
]

const STATUS_BADGE: Record<CourseStatus, { label: string; classes: string }> = {
  na_prateleira: { label: 'Prateleira', classes: 'bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50' },
  concluido:     { label: 'Concluído',  classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  fazendo:       { label: 'Fazendo',    classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  quero_fazer:   { label: 'Pendente',   classes: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
}

export function CourseDetailModal({
  course,
  onRegisterStudy,
  onChangeStatus,
  onCoverUpdated,
  onRequestDelete,
  onClose,
}: CourseDetailModalProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [hoursInput, setHoursInput] = useState('')
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleRegister() {
    if (!course) return
    const hours = Number.parseFloat(hoursInput)
    if (!hours || hours <= 0) return
    setIsLogging(false)
    setHoursInput('')
    await onRegisterStudy(course.id, hours)
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!course) return
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingCover(true)
    try {
      const url = await courseService.uploadCover(course.id, file)
      onCoverUpdated(course.id, url)
    } finally {
      setIsUploadingCover(false)
      e.target.value = ''
    }
  }

  function handleClose() {
    setIsLogging(false)
    setHoursInput('')
    onClose()
  }

  if (!course) return null

  const isDone = course.status === 'concluido'
  const coverLetter = course.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(course.title)
  const badge = STATUS_BADGE[course.status]

  return (
    <AnimatePresence>
      {course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-xl dark:bg-black/85"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                {course.coverUrl ? (
                  <img
                    src={course.coverUrl}
                    alt={course.title}
                    className="h-32 rounded-lg object-cover shadow"
                    style={{ width: '5.5rem' }}
                  />
                ) : (
                  <div
                    className="flex h-32 items-center justify-center rounded-lg text-3xl font-bold text-white shadow"
                    style={{ backgroundColor: coverColor, width: '5.5rem' }}
                  >
                    {coverLetter}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute -bottom-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                  title="Alterar capa"
                >
                  {isUploadingCover ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
                {course.status !== 'na_prateleira' && (
                  <span
                    className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                )}
                <p className="text-base font-semibold leading-tight text-black/90 dark:text-white/90">
                  {course.title}
                </p>
                {course.description && (
                  <p className="line-clamp-2 text-xs text-black/50 dark:text-white/50">{course.description}</p>
                )}
                {course.link && (
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[11px] text-[#007a4c] hover:underline dark:text-[#00E08A]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Acessar curso
                  </a>
                )}
              </div>
            </div>

            {course.totalHours != null && (
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-[#00E08A]'}`}
                    animate={{ width: `${Math.min(course.percentage, 100)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                {isDone ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3 w-3" />
                    Concluído
                  </span>
                ) : (
                  <span className="text-[11px] text-black/50 dark:text-white/50">
                    {course.currentHours.toFixed(1)}h / {course.totalHours}h
                  </span>
                )}
              </div>
            )}

            {course.totalHours == null && course.currentHours > 0 && (
              <p className="mt-3 text-xs text-black/50 dark:text-white/50">
                {course.currentHours.toFixed(1)}h estudadas
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {/* Status selector */}
              <div className="flex gap-1 overflow-hidden rounded-lg bg-black/5 p-1 dark:bg-white/10">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeStatus(course.id, opt.value)}
                    className={`flex flex-1 items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors ${
                      course.status === opt.value
                        ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                        : 'text-black/50 dark:text-white/50'
                    }`}
                  >
                    {opt.value === 'concluido' && course.status === 'concluido' && (
                      <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Registrar horas + Excluir */}
              {isLogging ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0.1}
                    step={0.5}
                    autoFocus
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRegister()
                    }}
                    placeholder="Horas estudadas"
                    className="flex-1 rounded-lg border border-white/30 bg-white/40 px-2 py-1.5 text-xs text-black/80 outline-none dark:bg-black/30 dark:text-white/80"
                  />
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-amber-950"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogging(false)
                      setHoursInput('')
                    }}
                    className="rounded-lg border border-white/30 px-2 py-1.5 text-xs text-black/50 dark:text-white/50"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => setIsLogging(true)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Registrar horas
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRequestDelete(course.id)}
                    className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
