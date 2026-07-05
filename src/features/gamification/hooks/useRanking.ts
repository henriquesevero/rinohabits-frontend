import { useEffect, useState } from 'react'
import type { RankEntry } from '../types/gamification.types'
import { gamificationService } from '../services/gamificationService'

export function useRanking() {
  const [ranking, setRanking] = useState<RankEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    gamificationService.getRanking().then(setRanking).finally(() => setIsLoading(false))
  }, [])

  return { ranking, isLoading }
}
