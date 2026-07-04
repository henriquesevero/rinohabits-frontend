export type BookStatus = 'quero_ler' | 'lendo' | 'lido'

export interface Book {
  id: string
  title: string
  author: string
  status: BookStatus
  totalPages: number | null
  currentPage: number
  percentage: number
  coverUrl: string | null
  startedAt: string | null
  finishedAt: string | null
}

export interface CreateBookPayload {
  title: string
  author: string
  totalPages: number | null
  status: BookStatus
  coverUrl?: string | null
}

export interface GoogleBook {
  google_id: string
  title: string
  author: string
  page_count: number
  description: string
  cover_url: string
}

export interface UpdateBookPayload {
  title?: string
  author?: string
  totalPages?: number | null
  status?: BookStatus
}

export interface ReadingStats {
  periodType: string
  offset: number
  startDate: string
  endDate: string
  pagesRead: number
  booksFinished: number
}
