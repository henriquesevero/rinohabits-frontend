import { ReadingStatsCard } from '../features/books/components/ReadingStatsCard'
import { StudyStatsCard } from '../features/courses/components/StudyStatsCard'
import { EvolutionSection } from '../features/stats/components/EvolutionSection'
import { MonthlyCalendar } from '../features/stats/components/MonthlyCalendar'
import { useCalendar } from '../features/stats/hooks/useCalendar'

export function StatsPage() {
  const { year, month, summary, goToPrevious, goToNext } = useCalendar()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Estatísticas</h1>

      <EvolutionSection />

      <MonthlyCalendar year={year} month={month} summary={summary} onPrevious={goToPrevious} onNext={goToNext} />

      <ReadingStatsCard />

      <StudyStatsCard />
    </div>
  )
}
