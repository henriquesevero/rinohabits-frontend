export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  timezone: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  timezone: string
}

export interface AuthResponse {
  token: string
}
