import { apiClient } from '../../../services/apiClient'
import type { AuthResponse, AuthUser, LoginCredentials, RegisterPayload } from '../types/auth.types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>('/me')
    return data
  },
}
