import { useCallback, useEffect, useState } from 'react'
import { bookService } from '../services/bookService'
import type { Book, BookStatus, CreateBookPayload } from '../types/book.types'

export function useBooks(statusFilter?: BookStatus) {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [justCompletedBook, setJustCompletedBook] = useState<Book | null>(null)

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

  function detectCompletion(previous: Book | undefined, updated: Book) {
    if (previous && previous.status !== 'lido' && updated.status === 'lido') {
      setJustCompletedBook(updated)
    }
  }

  const registerReading = useCallback(
    async (bookId: string, pagesReadNow: number) => {
      const updated = await bookService.registerReading(bookId, pagesReadNow)
      setBooks((current) => {
        detectCompletion(current.find((b) => b.id === bookId), updated)
        return current.map((b) => (b.id === updated.id ? updated : b))
      })
      return updated
    },
    [],
  )

  const changeStatus = useCallback(
    async (bookId: string, status: BookStatus, currentPage?: number) => {
      const updated = await bookService.update(bookId, { status, currentPage })
      setBooks((current) => {
        detectCompletion(current.find((b) => b.id === bookId), updated)
        return current.map((b) => (b.id === updated.id ? updated : b))
      })
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

  const clearJustCompleted = useCallback(() => setJustCompletedBook(null), [])

  const reorderBooks = useCallback(async (reorderedSubsetIds: string[]) => {
    let allOrderedIds: string[] = []

    setBooks((current) => {
      const byId = new Map(current.map((b) => [b.id, b]))
      const reorderedSet = new Set(reorderedSubsetIds)

      // Positions (indices) in global array occupied by the reordered subset
      const positions: number[] = []
      current.forEach((b, i) => { if (reorderedSet.has(b.id)) positions.push(i) })

      // Slot the reordered items back into those same positions
      const result = [...current]
      reorderedSubsetIds.forEach((id, i) => { result[positions[i]] = byId.get(id)! })

      allOrderedIds = result.map((b) => b.id)
      return result
    })

    await bookService.reorderBooks(allOrderedIds)
  }, [])

  return {
    books,
    isLoading,
    createBook,
    registerReading,
    changeStatus,
    deleteBook,
    updateCover,
    refresh,
    reorderBooks,
    justCompletedBook,
    clearJustCompleted,
  }
}
