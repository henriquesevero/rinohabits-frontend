import { apiClient } from '../../../services/apiClient'
import type { Course, CourseStatus, CreateCoursePayload, UpdateCoursePayload } from '../types/course.types'

interface CourseApiDto {
  id: string
  title: string
  description: string
  link: string
  status: string
  total_hours: number | null
  current_hours: number
  percentage: number
  cover_url: string | null
  started_at: string | null
  finished_at: string | null
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
    })
    return mapCourse(data)
  },

  async update(courseId: string, payload: UpdateCoursePayload): Promise<Course> {
    const { data } = await apiClient.patch<CourseApiDto>(`/courses/${courseId}`, {
      title: payload.title,
      description: payload.description,
      link: payload.link,
      total_hours: payload.totalHours,
      status: payload.status,
    })
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
}
