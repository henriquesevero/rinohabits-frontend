import { useCallback, useEffect, useState } from 'react'
import { bookService } from '../services/bookService'
import type { Book, BookStatus, CreateBookPayload } from '../types/book.types'

export function useBooks(statusFilter?: BookStatus) {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await bookService.list(statusFilter)
      setBooks(data)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createBook = useCallback(
    async (payload: CreateBookPayload) => {
      await bookService.create(payload)
      await refresh()
    },
    [refresh],
  )

  const registerReading = useCallback(
    async (bookId: string, pagesReadNow: number) => {
      const updated = await bookService.registerReading(bookId, pagesReadNow)
      setBooks((current) => current.map((b) => (b.id === updated.id ? updated : b)))
      return updated
    },
    [],
  )

  const changeStatus = useCallback(
    async (bookId: string, status: BookStatus) => {
      const updated = await bookService.update(bookId, { status })
      setBooks((current) => current.map((b) => (b.id === updated.id ? updated : b)))
      await refresh()
    },
    [refresh],
  )

  const deleteBook = useCallback(
    async (bookId: string) => {
      await bookService.remove(bookId)
      await refresh()
    },
    [refresh],
  )

  const updateCover = useCallback((bookId: string, coverUrl: string) => {
    setBooks((current) => current.map((b) => (b.id === bookId ? { ...b, coverUrl } : b)))
  }, [])

  return { books, isLoading, createBook, registerReading, changeStatus, deleteBook, updateCover, refresh }
}
