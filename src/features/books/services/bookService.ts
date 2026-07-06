import { apiClient } from '../../../services/apiClient'
import type { Book, BookStatus, BookSearchResult, CreateBookPayload, ReadingStats, UpdateBookPayload } from '../types/book.types'

interface BookApiDto {
  id: string
  title: string
  author: string
  status: string
  total_pages: number | null
  current_page: number
  percentage: number
  cover_url: string | null
  started_at: string | null
  finished_at: string | null
}

interface ReadingStatsApiDto {
  period_type: string
  offset: number
  start_date: string
  end_date: string
  pages_read: number
  books_finished: number
}

function mapBook(dto: BookApiDto): Book {
  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    status: dto.status as BookStatus,
    totalPages: dto.total_pages,
    currentPage: dto.current_page,
    percentage: dto.percentage,
    coverUrl: dto.cover_url,
    startedAt: dto.started_at,
    finishedAt: dto.finished_at,
  }
}

export const bookService = {
  async list(status?: BookStatus): Promise<Book[]> {
    const { data } = await apiClient.get<BookApiDto[]>('/books', {
      params: status ? { status } : undefined,
    })
    return data.map(mapBook)
  },

  async create(payload: CreateBookPayload): Promise<Book> {
    const { data } = await apiClient.post<BookApiDto>('/books', {
      title: payload.title,
      author: payload.author,
      total_pages: payload.totalPages,
      status: payload.status,
      cover_url: payload.coverUrl ?? null,
    })
    return mapBook(data)
  },

  async search(
    q: string,
    type: 'title' | 'author' | 'general' = 'general',
    source: 'openlib' | 'google' = 'openlib',
    signal?: AbortSignal,
  ): Promise<BookSearchResult[]> {
    const params: Record<string, string> = { q }
    if (type !== 'general') params.type = type
    if (source === 'google') params.source = 'google'
    const { data } = await apiClient.get<BookSearchResult[]>('/books/search', { params, signal })
    return data
  },

  async update(bookId: string, payload: UpdateBookPayload): Promise<Book> {
    const { data } = await apiClient.patch<BookApiDto>(`/books/${bookId}`, {
      title: payload.title,
      author: payload.author,
      total_pages: payload.totalPages,
      status: payload.status,
      current_page: payload.currentPage,
    })
    return mapBook(data)
  },

  async registerReading(bookId: string, pagesReadNow: number): Promise<Book> {
    const { data } = await apiClient.post<BookApiDto>(`/books/${bookId}/reading`, {
      pages_read_now: pagesReadNow,
    })
    return mapBook(data)
  },

  async uploadCover(bookId: string, file: File): Promise<string> {
    const form = new FormData()
    form.append('cover', file)
    const { data } = await apiClient.post<{ cover_url: string }>(`/books/${bookId}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.cover_url
  },

  async remove(bookId: string): Promise<void> {
    await apiClient.delete(`/books/${bookId}`)
  },

  async reorderBooks(ids: string[]): Promise<void> {
    await apiClient.patch('/books/reorder', { ids })
  },

  async getReadingStats(periodType: string, offset: number): Promise<ReadingStats> {
    const { data } = await apiClient.get<ReadingStatsApiDto>('/books/reading-stats', {
      params: { period: periodType, offset },
    })
    return {
      periodType: data.period_type,
      offset: data.offset,
      startDate: data.start_date,
      endDate: data.end_date,
      pagesRead: data.pages_read,
      booksFinished: data.books_finished,
    }
  },
}
