import { useEffect, useState } from 'react'
import { courseService } from '../services/courseService'
import type { StudyStats } from '../types/course.types'

export function useStudyStats(periodType: string, offset: number) {
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    courseService
      .getStudyStats(periodType, offset)
      .then(setStats)
      .finally(() => setIsLoading(false))
  }, [periodType, offset])

  return { stats, isLoading }
}
