import Link from "next/link"
import { ModuleWithStats } from "@/types"
import { calculateModuleAverage, formatGrade } from "@/lib/utils/grade-calculations"
import { getGradeColor } from "@/lib/utils/grade-colors"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GradeFormDialog } from "./grade-form-dialog"
import { ModuleFormDialog } from "./module-form-dialog"

interface ModuleCardProps {
  module: ModuleWithStats
}

export function ModuleCard({ module }: ModuleCardProps) {
  const avg = calculateModuleAverage(module.grades)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            <Link
              href={`/dashboard/grades/${module.id}`}
              className="hover:underline underline-offset-4"
            >
              {module.name}
            </Link>
          </CardTitle>
          <ModuleFormDialog
            module={module}
            trigger={
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">
                ✎
              </Button>
            }
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">Sem. {module.semester ?? "–"}</Badge>
          <Badge variant="secondary">{module.ects} ECTS</Badge>
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
          {module.grades.length} {module.grades.length === 1 ? "Note" : "Noten"}
        </p>
        <div className="mt-auto">
          <GradeFormDialog
            moduleId={module.id}
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
