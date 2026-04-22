import { getGradeColor } from "@/lib/utils/grade-colors"
import { formatGrade, getGradeLabel } from "@/lib/utils/grade-calculations"

interface AverageDisplayProps {
  weightedAverage: number | null
  totalKlausuren: number
  totalEcts: number
  totalGrades: number
}

export function AverageDisplay({
  weightedAverage,
  totalKlausuren,
  totalEcts,
  totalGrades,
}: AverageDisplayProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-6 px-4 py-3 rounded-lg border bg-card flex-wrap">
      <div className="flex items-center gap-3">
        <span className={`text-3xl font-bold ${getGradeColor(weightedAverage)}`}>
          {formatGrade(weightedAverage)}
        </span>
        {weightedAverage !== null && (
          <span className="text-sm text-muted-foreground">{getGradeLabel(weightedAverage)}</span>
        )}
      </div>
      <div className="h-5 w-px bg-border hidden sm:block" />
      <span className="text-sm text-muted-foreground">{totalKlausuren} Klausuren</span>
      <div className="h-5 w-px bg-border hidden sm:block" />
      <span className="text-sm text-muted-foreground">{totalEcts} ECTS</span>
      <div className="h-5 w-px bg-border hidden sm:block" />
      <span className="text-sm text-muted-foreground">{totalGrades} Noten</span>
    </div>
  )
}
