import { useEffect, useState } from 'react'
import { bookService } from '../services/bookService'
import type { ReadingStats } from '../types/book.types'

export function useReadingStats(periodType: string, offset: number) {
  const [stats, setStats] = useState<ReadingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    bookService
      .getReadingStats(periodType, offset)
      .then(setStats)
      .finally(() => setIsLoading(false))
  }, [periodType, offset])

  return { stats, isLoading }
}
