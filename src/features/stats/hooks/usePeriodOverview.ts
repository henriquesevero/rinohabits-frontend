import { useEffect, useState } from 'react'
import { statsService } from '../services/statsService'
import type { PeriodOverview, PeriodType } from '../types/stats.types'

export function usePeriodOverview(periodType: PeriodType) {
  const [offset, setOffset] = useState(0)
  const [overview, setOverview] = useState<PeriodOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setOffset(0)
  }, [periodType])

  useEffect(() => {
    setIsLoading(true)
    statsService
      .getOverview(periodType, offset)
      .then(setOverview)
      .finally(() => setIsLoading(false))
  }, [periodType, offset])

  return {
    overview,
    isLoading,
    offset,
    goToPrevious: () => setOffset((current) => current - 1),
    goToNext: () => setOffset((current) => Math.min(current + 1, 0)),
    canGoNext: offset < 0,
  }
}
