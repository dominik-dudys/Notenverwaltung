import { getGradeColor } from "@/lib/utils/grade-colors"
import { formatGrade, getGradeLabel } from "@/lib/utils/grade-calculations"
import { Card, CardContent } from "@/components/ui/card"

interface AverageDisplayProps {
  weightedAverage: number | null
  totalModules: number
  totalEcts: number
  totalGrades: number
}

export function AverageDisplay({
  weightedAverage,
  totalModules,
  totalEcts,
  totalGrades,
}: AverageDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Gesamtdurchschnitt</p>
            <p className={`text-3xl font-bold mt-1 ${getGradeColor(weightedAverage)}`}>
              {formatGrade(weightedAverage)}
            </p>
            {weightedAverage !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                {getGradeLabel(weightedAverage)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Module</p>
            <p className="text-3xl font-bold mt-1">{totalModules}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Gesamt-ECTS</p>
            <p className="text-3xl font-bold mt-1">{totalEcts}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Noten</p>
            <p className="text-3xl font-bold mt-1">{totalGrades}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
