import { apiClient } from '../../../services/apiClient'
import type { AuthResponse, AuthUser, LoginCredentials, RegisterPayload } from '../types/auth.types'

interface MeApiDto {
  id: string
  name: string
  email: string
  avatar_url: string | null
  book_collection_order: string[]
  course_collection_order: string[]
}

function mapUser(dto: MeApiDto): AuthUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    avatarUrl: dto.avatar_url ?? null,
    bookCollectionOrder: dto.book_collection_order ?? [],
    courseCollectionOrder: dto.course_collection_order ?? [],
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      timezone: payload.timezone,
      invite_code: payload.inviteCode,
    })
    return data
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<MeApiDto>('/me')
    return mapUser(data)
  },

  async uploadAvatar(file: File): Promise<string> {
    const form = new FormData()
    form.append('avatar', file)
    const { data } = await apiClient.post<{ avatar_url: string }>('/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.avatar_url
  },

  async updateBookCollectionOrder(order: string[]): Promise<void> {
    await apiClient.patch('/me/book-collection-order', { order })
  },

  async updateCourseCollectionOrder(order: string[]): Promise<void> {
    await apiClient.patch('/me/course-collection-order', { order })
  },
}
