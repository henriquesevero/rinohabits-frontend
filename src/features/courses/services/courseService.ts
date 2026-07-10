import { apiClient } from '../../../services/apiClient'
import type { Course, CourseStatus, CreateCoursePayload, StudyStats, UpdateCoursePayload } from '../types/course.types'

interface CourseApiDto {
  id: string
  title: string
  description: string
  link: string
  status: string
  total_hours: number | null
  current_hours: number
  percentage: number
  collection: string | null
  cover_url: string | null
  started_at: string | null
  finished_at: string | null
}

interface StudyStatsApiDto {
  period_type: string
  offset: number
  start_date: string
  end_date: string
  hours_studied: number
  courses_finished: number
}

function mapCourse(dto: CourseApiDto): Course {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    link: dto.link,
    status: dto.status as CourseStatus,
    totalHours: dto.total_hours,
    currentHours: dto.current_hours,
    percentage: dto.percentage,
    collection: dto.collection,
    coverUrl: dto.cover_url,
    startedAt: dto.started_at,
    finishedAt: dto.finished_at,
  }
}

export const courseService = {
  async list(status?: CourseStatus): Promise<Course[]> {
    const { data } = await apiClient.get<CourseApiDto[]>('/courses', {
      params: status ? { status } : undefined,
    })
    return data.map(mapCourse)
  },

  async create(payload: CreateCoursePayload): Promise<Course> {
    const { data } = await apiClient.post<CourseApiDto>('/courses', {
      title: payload.title,
      description: payload.description,
      link: payload.link,
      total_hours: payload.totalHours,
      status: payload.status,
      collection: payload.collection ?? null,
    })
    return mapCourse(data)
  },

  async update(courseId: string, payload: UpdateCoursePayload): Promise<Course> {
    const body: Record<string, unknown> = {
      title: payload.title,
      description: payload.description,
      link: payload.link,
      total_hours: payload.totalHours,
      status: payload.status,
    }
    if ('collection' in payload) {
      body.collection = payload.collection === null ? '' : (payload.collection ?? undefined)
    }
    const { data } = await apiClient.patch<CourseApiDto>(`/courses/${courseId}`, body)
    return mapCourse(data)
  },

  async registerStudy(courseId: string, hoursLoggedNow: number): Promise<Course> {
    const { data } = await apiClient.post<CourseApiDto>(`/courses/${courseId}/study`, {
      hours_logged_now: hoursLoggedNow,
    })
    return mapCourse(data)
  },

  async uploadCover(courseId: string, file: File): Promise<string> {
    const form = new FormData()
    form.append('cover', file)
    const { data } = await apiClient.post<{ cover_url: string }>(`/courses/${courseId}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.cover_url
  },

  async remove(courseId: string): Promise<void> {
    await apiClient.delete(`/courses/${courseId}`)
  },

  async reorderCourses(ids: string[]): Promise<void> {
    await apiClient.patch('/courses/reorder', { ids })
  },

  async getStudyStats(periodType: string, offset: number): Promise<StudyStats> {
    const { data } = await apiClient.get<StudyStatsApiDto>('/courses/study-stats', {
      params: { period: periodType, offset },
    })
    return {
      periodType: data.period_type,
      offset: data.offset,
      startDate: data.start_date,
      endDate: data.end_date,
      hoursStudied: data.hours_studied,
      coursesFinished: data.courses_finished,
    }
  },
}
