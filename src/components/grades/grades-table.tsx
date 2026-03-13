import { ModuleWithStats } from "@/types"
import { calculateModuleAverage, calculateWeightedAverage, formatGrade } from "@/lib/utils/grade-calculations"
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
  modules: ModuleWithStats[]
}

export function GradesTable({ modules }: GradesTableProps) {
  const allGradesWithModule = modules.flatMap((m) =>
    m.grades.map((g) => ({ ...g, module: m }))
  )

  if (allGradesWithModule.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Noch keine Noten vorhanden.
      </p>
    )
  }

  const weightedAverage = calculateWeightedAverage(modules)

  // Group by semester
  const bySemester = new Map<number, typeof allGradesWithModule>()
  for (const entry of allGradesWithModule) {
    const sem = entry.module.semester ?? 0
    if (!bySemester.has(sem)) bySemester.set(sem, [])
    bySemester.get(sem)!.push(entry)
  }

  const sortedSemesters = Array.from(bySemester.entries()).sort(([a], [b]) => a - b)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modul</TableHead>
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
          const semModules = modules.filter((m) => (m.semester ?? 0) === semester)
          const semAvg = calculateWeightedAverage(semModules)
          return (
            <>
              {entries
                .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
                .map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.module.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Sem. {semester || "–"}</Badge>
                    </TableCell>
                    <TableCell>{entry.module.ects}</TableCell>
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
                <TableCell colSpan={3}>
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
          <TableCell colSpan={3} className="font-bold">
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
