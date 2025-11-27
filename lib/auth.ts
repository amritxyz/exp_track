// lib/auth.ts
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
}
