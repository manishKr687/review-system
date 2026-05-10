import { apiFetch, apiPost } from './client'

export interface AuthUser {
  id: number
  email: string
  display_name: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export function register(payload: { email: string; display_name: string; password: string }): Promise<TokenResponse> {
  return apiPost<TokenResponse>('/api/auth/register', payload)
}

export function login(payload: { email: string; password: string }): Promise<TokenResponse> {
  return apiPost<TokenResponse>('/api/auth/login', payload)
}

export function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/me')
}
