import { useEffect, useState } from 'react'
import { statsService } from '../services/statsService'
import type { PeriodType, TrendPoint } from '../types/stats.types'

export function useTrend(periodType: PeriodType, count: number) {
  const [points, setPoints] = useState<TrendPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    statsService
      .getTrend(periodType, count)
      .then(setPoints)
      .finally(() => setIsLoading(false))
  }, [periodType, count])

  return { points, isLoading }
}
