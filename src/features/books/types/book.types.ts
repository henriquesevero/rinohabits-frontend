export type BookStatus = 'na_estante' | 'quero_ler' | 'lendo' | 'lido'

export interface Book {
  id: string
  title: string
  author: string
  status: BookStatus
  totalPages: number | null
  currentPage: number
  percentage: number
  collection: string | null
  coverUrl: string | null
  startedAt: string | null
  finishedAt: string | null
}

export interface CreateBookPayload {
  title: string
  author: string
  totalPages: number | null
  status: BookStatus
  collection?: string | null
  coverUrl?: string | null
}

export interface BookSearchResult {
  id: string
  title: string
  author: string
  page_count: number
  cover_url: string
}

export interface UpdateBookPayload {
  title?: string
  author?: string
  totalPages?: number | null
  status?: BookStatus
  currentPage?: number
  collection?: string | null
}

export interface ReadingStats {
  periodType: string
  offset: number
  startDate: string
  endDate: string
  pagesRead: number
  booksFinished: number
}
