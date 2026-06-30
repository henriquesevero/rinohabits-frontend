import { useEffect, useState } from 'react'
import { statsService } from '../services/statsService'
import type { CalendarSummary } from '../types/stats.types'

export function useCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [summary, setSummary] = useState<CalendarSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    statsService
      .getCalendar(year, month)
      .then(setSummary)
      .finally(() => setIsLoading(false))
  }, [year, month])

  function goToPrevious() {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function goToNext() {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return { year, month, summary, isLoading, goToPrevious, goToNext }
}
