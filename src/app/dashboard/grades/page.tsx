import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { KlausurWithStats } from "@/types"
import {
  calculateKlausurAverage,
  calculateWeightedAverage,
  getEffectiveGrades,
  groupBySemester,
} from "@/lib/utils/grade-calculations"
import { AverageDisplay } from "@/components/grades/average-display"
import { CollapsibleCharts } from "@/components/grades/collapsible-charts"
import { KlausurList } from "@/components/grades/module-list"
import { Button } from "@/components/ui/button"
import { GradeImportDialog } from "@/components/grades/grade-import-dialog"

export default async function GradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single()
  const isAdmin = profile?.role === "admin"

  const [{ data: allKlausuren }, { data: userGrades }] = await Promise.all([
    supabase
      .from("modules")
      .select("*")
      .order("semester", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("grades")
      .select("*")
      .eq("user_id", user!.id),
  ])

  const klausuren: KlausurWithStats[] = (allKlausuren ?? []).map((m) => {
    const grades = (userGrades ?? []).filter((g) => g.module_id === m.id)
    return {
      ...m,
      grades,
      average: calculateKlausurAverage(grades),
    }
  })

  const allGrades = klausuren.flatMap((k) => k.grades)
  const weightedAverage = calculateWeightedAverage(klausuren)
  const totalEcts = klausuren.flatMap((k) => getEffectiveGrades(k.grades)).reduce((sum, g) => sum + (g.ects ?? 0), 0)
  const semesters = groupBySemester(klausuren)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Noten</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Übersicht deiner Klausuren und Noten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GradeImportDialog klausuren={allKlausuren ?? []} />
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/grades/list">Alle Noten</Link>
          </Button>
        </div>
      </div>

      <AverageDisplay
        weightedAverage={weightedAverage}
        totalKlausuren={klausuren.length}
        totalEcts={totalEcts}
        totalGrades={allGrades.length}
      />

      <CollapsibleCharts grades={allGrades} semesters={semesters} />

      {klausuren.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Noch keine Klausuren vorhanden.</p>
          <p className="text-sm mt-1">Ein Admin muss zuerst Klausuren anlegen.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-3">Klausuren</h2>
          <KlausurList semesters={semesters} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  )
}
