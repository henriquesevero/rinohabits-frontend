export type CourseStatus = 'na_prateleira' | 'quero_fazer' | 'fazendo' | 'concluido'

export interface Course {
  id: string
  title: string
  description: string
  link: string
  status: CourseStatus
  totalHours: number | null
  currentHours: number
  percentage: number
  collection: string | null
  coverUrl: string | null
  startedAt: string | null
  finishedAt: string | null
}

export interface CreateCoursePayload {
  title: string
  description: string
  link: string
  totalHours: number | null
  status: CourseStatus
  collection?: string | null
}

export interface UpdateCoursePayload {
  title?: string
  description?: string
  link?: string
  totalHours?: number | null
  status?: CourseStatus
  collection?: string | null
}

export interface StudyStats {
  periodType: string
  offset: number
  startDate: string
  endDate: string
  hoursStudied: number
  coursesFinished: number
}
