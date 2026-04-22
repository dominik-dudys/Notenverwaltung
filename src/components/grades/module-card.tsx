import Link from "next/link"
import { KlausurWithStats } from "@/types"
import { calculateKlausurAverage, formatGrade } from "@/lib/utils/grade-calculations"
import { getGradeColor } from "@/lib/utils/grade-colors"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GradeFormDialog } from "./grade-form-dialog"
import { KlausurFormDialog } from "./module-form-dialog"

interface KlausurCardProps {
  klausur: KlausurWithStats
}

export function KlausurCard({ klausur }: KlausurCardProps) {
  const avg = calculateKlausurAverage(klausur.grades)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            <Link
              href={`/dashboard/grades/${klausur.id}`}
              className="hover:underline underline-offset-4"
            >
              {klausur.name}
            </Link>
          </CardTitle>
          <KlausurFormDialog
            klausur={klausur}
            trigger={
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">
                ✎
              </Button>
            }
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">Sem. {klausur.semester ?? "–"}</Badge>
          {klausur.ects != null && klausur.ects > 0 && (
            <Badge variant="secondary">
              {klausur.ects} ECTS
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Durchschnitt</span>
          <span className={`text-2xl font-bold ${getGradeColor(avg)}`}>
            {formatGrade(avg)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {klausur.grades.length} {klausur.grades.length === 1 ? "Note" : "Noten"}
        </p>
        <div className="mt-auto">
          <GradeFormDialog
            moduleId={klausur.id}
            moduleEcts={klausur.ects}
            trigger={
              <Button variant="outline" size="sm" className="w-full">
                + Note hinzufügen
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
