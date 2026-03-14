import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ModuleWithStats } from "@/types"
import {
  calculateModuleAverage,
  calculateWeightedAverage,
  groupBySemester,
} from "@/lib/utils/grade-calculations"
import { AverageDisplay } from "@/components/grades/average-display"
import { GradesOverviewChart } from "@/components/grades/grades-overview-chart"
import { SemesterBarChart } from "@/components/grades/semester-bar-chart"
import { ModuleList } from "@/components/grades/module-list"
import { Button } from "@/components/ui/button"

export default async function GradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: modulesRaw } = await supabase
    .from("modules")
    .select("*, grades(*)")
    .eq("grades.user_id", user!.id)
    .order("semester", { ascending: true })
    .order("name", { ascending: true })

  const modules: ModuleWithStats[] = (modulesRaw ?? []).map((m) => ({
    ...m,
    grades: m.grades ?? [],
    average: calculateModuleAverage(m.grades ?? []),
  }))

  const allGrades = modules.flatMap((m) => m.grades)
  const weightedAverage = calculateWeightedAverage(modules)
  const totalEcts = modules.reduce((sum, m) => sum + m.ects, 0)
  const semesters = groupBySemester(modules)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Noten</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Übersicht deiner Module und Noten
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/grades/list">Alle Noten</Link>
        </Button>
      </div>

      <AverageDisplay
        weightedAverage={weightedAverage}
        totalModules={modules.length}
        totalEcts={totalEcts}
        totalGrades={allGrades.length}
      />

      {allGrades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GradesOverviewChart grades={allGrades} />
          <SemesterBarChart semesters={semesters} />
        </div>
      )}

      {modules.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Noch keine Module vorhanden.</p>
          <p className="text-sm mt-1">Ein Admin muss zuerst Module anlegen.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-3">Module</h2>
          <ModuleList modules={modules} />
        </div>
      )}
    </div>
  )
}
