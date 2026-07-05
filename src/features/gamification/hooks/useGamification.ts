import { useCallback, useEffect, useState } from 'react'
import type { GamificationStats } from '../types/gamification.types'
import { gamificationService } from '../services/gamificationService'

export function useGamification() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(() => {
    gamificationService.getMyStats().then(setStats).finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats, isLoading, refetch: fetch }
}
