import { KlausurWithStats } from "@/types"
import { calculateWeightedAverage, formatGrade } from "@/lib/utils/grade-calculations"
import { getGradeColor } from "@/lib/utils/grade-colors"
import { Badge } from "@/components/ui/badge"
import { GradeFormDialog } from "./grade-form-dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface GradesTableProps {
  klausuren: KlausurWithStats[]
}

export function GradesTable({ klausuren }: GradesTableProps) {
  const allGradesWithKlausur = klausuren.flatMap((k) =>
    k.grades.map((g) => ({ ...g, klausur: k }))
  )

  if (allGradesWithKlausur.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Noch keine Noten vorhanden.
      </p>
    )
  }

  const weightedAverage = calculateWeightedAverage(klausuren)

  const bySemester = new Map<number, typeof allGradesWithKlausur>()
  for (const entry of allGradesWithKlausur) {
    const sem = entry.klausur.semester ?? 0
    if (!bySemester.has(sem)) bySemester.set(sem, [])
    bySemester.get(sem)!.push(entry)
  }

  const sortedSemesters = Array.from(bySemester.entries()).sort(([a], [b]) => a - b)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Klausur</TableHead>
          <TableHead>Klausur</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead>ECTS</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Datum</TableHead>
          <TableHead>Beschreibung</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedSemesters.map(([semester, entries]) => {
          const semKlausuren = klausuren.filter((k) => (k.semester ?? 0) === semester)
          const semAvg = calculateWeightedAverage(semKlausuren)
          return (
            <>
              {entries
                .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
                .map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {entry.klausur.name}
                        {entry.is_retake && (
                          <Badge className="text-xs bg-amber-500 hover:bg-amber-500 text-white">NKL</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.exam_name ?? "–"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Sem. {semester || "–"}</Badge>
                    </TableCell>
                    <TableCell>{entry.ects ?? "–"}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getGradeColor(entry.grade)}`}>
                        {entry.grade.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>{entry.date ?? "–"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.description ?? "–"}
                    </TableCell>
                    <TableCell>
                      <GradeFormDialog
                        moduleId={entry.module_id}
                        grade={entry}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            ✎
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={4}>
                  Ø Semester {semester || "–"}
                </TableCell>
                <TableCell>
                  <span className={getGradeColor(semAvg)}>
                    {formatGrade(semAvg)}
                  </span>
                </TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </>
          )
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4} className="font-bold">
            Gewichteter Gesamtdurchschnitt
          </TableCell>
          <TableCell className={`font-bold ${getGradeColor(weightedAverage)}`}>
            {formatGrade(weightedAverage)}
          </TableCell>
          <TableCell colSpan={3} />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
