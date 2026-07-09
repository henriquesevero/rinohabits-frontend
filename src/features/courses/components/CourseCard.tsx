import { motion } from 'framer-motion'
import { Camera, CheckCircle, Clock, ExternalLink, Layers, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { courseService } from '../services/courseService'
import type { Course, CourseStatus } from '../types/course.types'

interface CourseCardProps {
  course: Course
  onRegisterStudy: (courseId: string, hours: number) => Promise<void>
  onChangeStatus: (courseId: string, status: CourseStatus) => Promise<void>
  onDelete: (courseId: string) => void
  onCoverUpdated: (courseId: string, url: string) => void
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'na_prateleira', label: 'Prateleira'  },
  { value: 'quero_fazer',   label: 'Quero Fazer' },
  { value: 'fazendo',       label: 'Fazendo'     },
  { value: 'concluido',     label: 'Feito'       },
]

const STATUS_BADGE: Record<CourseStatus, { label: string; classes: string }> = {
  na_prateleira: { label: 'Prateleira', classes: 'bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50' },
  concluido:     { label: 'Feito',      classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  fazendo:       { label: 'Fazendo',    classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  quero_fazer:   { label: 'Quero Fazer', classes: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
}

export function CourseCard({ course, onRegisterStudy, onChangeStatus, onDelete, onCoverUpdated }: CourseCardProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [hoursInput, setHoursInput] = useState('')
  const [hoursError, setHoursError] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleRegister() {
    const hours = Number.parseFloat(hoursInput)
    if (!hours || hours <= 0) { setHoursError(true); return }
    setHoursError(false)
    setIsLogging(false)
    setHoursInput('')
    await onRegisterStudy(course.id, hours)
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  const isDone = course.status === 'concluido'
  const coverLetter = course.title.charAt(0).toUpperCase()
  const coverColor = stringToColor(course.title)
  const badge = STATUS_BADGE[course.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className={`relative flex gap-3 overflow-hidden rounded-xl border p-4 backdrop-blur-md transition-colors ${
        isDone
          ? 'border-emerald-400/60 bg-emerald-400/10 dark:bg-emerald-400/10'
          : 'border-white/20 bg-white/40 dark:bg-black/30'
      }`}
    >
      <div className="relative flex-shrink-0">
        {course.coverUrl ? (
          <img src={course.coverUrl} alt={course.title} loading="lazy" decoding="async" className="h-28 w-20 rounded-lg object-cover" />
        ) : (
          <div
            className="flex h-28 w-20 items-center justify-center rounded-lg text-2xl font-bold text-white"
            style={{ backgroundColor: coverColor }}
          >
            {coverLetter}
          </div>
        )}
        {isDone && (
          <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
            <CheckCircle className="h-3.5 w-3.5" />
          </span>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingCover}
          className="absolute -bottom-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
          title="Alterar capa"
        >
          {isUploadingCover ? (
            <span className="h-2.5 w-2.5 animate-spin rounded-full border border-white border-t-transparent" />
          ) : (
            <Camera className="h-2.5 w-2.5" />
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

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-black/80 dark:text-white/80">{course.title}</p>
              {course.status !== 'na_prateleira' && (
                <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badge.classes}`}>
                  {badge.label}
                </span>
              )}
            </div>
            {course.description && (
              <p className="line-clamp-1 text-xs text-black/50 dark:text-white/50">{course.description}</p>
            )}
            {course.collection && (
              <span className="flex items-center gap-1 text-[10px] text-black/40 dark:text-white/40">
                <Layers className="h-2.5 w-2.5 shrink-0" />
                {course.collection}
              </span>
            )}
            {course.link && (
              <a
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[11px] text-[#007a4c] hover:underline dark:text-[#00E08A]"
              >
                <ExternalLink className="h-3 w-3" />
                Acessar
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDelete(course.id)}
            className="flex-shrink-0 rounded-full p-1 text-black/30 hover:bg-red-400/20 hover:text-red-500 dark:text-white/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {course.totalHours != null && (
          <div className="flex items-center gap-2">
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

        {/* Status selector */}
        <div className="flex gap-1 overflow-hidden rounded-lg bg-black/5 p-0.5 dark:bg-white/10">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeStatus(course.id, opt.value)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1 py-1 text-[9px] font-medium transition-colors ${
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

        {/* Registrar horas */}
        {!isDone && (
          isLogging ? (
            <div className="flex flex-col gap-1">
              {hoursError && (
                <p className="text-[11px] text-red-500 dark:text-red-400">Insira um valor maior que 0.</p>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  autoFocus
                  value={hoursInput}
                  onChange={(e) => { setHoursInput(e.target.value); setHoursError(false) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRegister() }}
                  placeholder="Horas estudadas"
                  className={`flex-1 rounded-lg border bg-white/40 px-2 py-1.5 text-xs text-black/80 outline-none dark:bg-black/30 dark:text-white/80 ${hoursError ? 'border-red-400' : 'border-white/30'}`}
                />
                <button type="button" onClick={handleRegister} className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-amber-950">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogging(false); setHoursInput('') }}
                  className="rounded-lg border border-white/30 px-2 py-1.5 text-xs text-black/50 dark:text-white/50"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLogging(true)}
              className="flex items-center gap-1 self-start rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white"
            >
              <Clock className="h-3.5 w-3.5" />
              Registrar horas
            </button>
          )
        )}
      </div>
    </motion.div>
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
