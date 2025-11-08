export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
