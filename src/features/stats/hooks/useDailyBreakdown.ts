import { useEffect, useState } from 'react'
import { statsService } from '../services/statsService'
import type { DailyStatus, PeriodType } from '../types/stats.types'

export function useDailyBreakdown(periodType: PeriodType, offset: number) {
  const [days, setDays] = useState<DailyStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    statsService
      .getDailyBreakdown(periodType, offset)
      .then(setDays)
      .finally(() => setIsLoading(false))
  }, [periodType, offset])

  return { days, isLoading }
}
