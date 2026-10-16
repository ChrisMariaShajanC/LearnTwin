const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  getUser: (id: string) => request<Record<string, unknown>>(`/user/${id}`),
  createUser: (user: unknown) => request('/user', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id: string, user: unknown) => request(`/user/${id}`, { method: 'PUT', body: JSON.stringify(user) }),

  getUploads: (userId?: string) => request<Record<string, unknown>[]>(`/uploads${userId ? `?userId=${userId}` : ''}`),
  createUpload: (upload: unknown) => request('/uploads', { method: 'POST', body: JSON.stringify(upload) }),
  deleteUpload: (id: string) => request(`/uploads/${id}`, { method: 'DELETE' }),

  getCustomSubjects: (userId?: string) => request<Record<string, unknown>[]>(`/custom-subjects${userId ? `?userId=${userId}` : ''}`),
  createCustomSubject: (subject: unknown) => request('/custom-subjects', { method: 'POST', body: JSON.stringify(subject) }),
  deleteCustomSubject: (id: string) => request(`/custom-subjects/${id}`, { method: 'DELETE' }),

  getProgress: (userId?: string) => request(`/progress${userId ? `?userId=${userId}` : ''}`),
  createProgress: (entry: unknown) => request('/progress', { method: 'POST', body: JSON.stringify(entry) }),

  getQuizResults: (userId?: string) => request(`/quiz-results${userId ? `?userId=${userId}` : ''}`),
  createQuizResult: (result: unknown) => request('/quiz-results', { method: 'POST', body: JSON.stringify(result) }),

  getStats: (userId: string) => request(`/stats/${userId}`)
}
