import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  calculateModuleAverage,
  formatGrade,
  getGradeLabel,
} from "@/lib/utils/grade-calculations"
import { getGradeColor } from "@/lib/utils/grade-colors"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GradeFormDialog } from "@/components/grades/grade-form-dialog"
import { ModuleFormDialog } from "@/components/grades/module-form-dialog"

interface Props {
  params: Promise<{ moduleId: string }>
}

export default async function ModuleDetailPage({ params }: Props) {
  const { moduleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: module } = await supabase
    .from("modules")
    .select("*, grades(*)")
    .eq("id", moduleId)
    .eq("user_id", user!.id)
    .single()

  if (!module) notFound()

  const grades = (module.grades ?? []).sort(
    (a, b) => (b.date ?? "").localeCompare(a.date ?? "")
  )
  const avg = calculateModuleAverage(grades)
  const passed = grades.filter((g) => g.grade <= 4.0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/grades">← Zurück</Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{module.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">Semester {module.semester ?? "–"}</Badge>
            <Badge variant="secondary">{module.ects} ECTS</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <ModuleFormDialog
            module={module}
            trigger={<Button variant="outline" size="sm">Modul bearbeiten</Button>}
          />
          <GradeFormDialog
            moduleId={module.id}
            trigger={<Button size="sm">+ Note hinzufügen</Button>}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Modul-Durchschnitt</p>
            <p className={`text-3xl font-bold mt-1 ${getGradeColor(avg)}`}>
              {formatGrade(avg)}
            </p>
            {avg !== null && (
              <p className="text-xs text-muted-foreground mt-1">{getGradeLabel(avg)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Noten</p>
            <p className="text-3xl font-bold mt-1">{grades.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Bestanden</p>
            <p className="text-3xl font-bold mt-1">{passed.length}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Noten</h2>
        {grades.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Noten für dieses Modul eingetragen.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Note</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <span className={`font-semibold text-lg ${getGradeColor(grade.grade)}`}>
                        {grade.grade.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>{grade.date ?? "–"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {grade.description ?? "–"}
                    </TableCell>
                    <TableCell>
                      <GradeFormDialog
                        moduleId={module.id}
                        grade={grade}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            ✎
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
