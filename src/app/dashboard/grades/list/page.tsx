import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ModuleWithStats } from "@/types"
import { calculateModuleAverage } from "@/lib/utils/grade-calculations"
import { GradesTable } from "@/components/grades/grades-table"
import { Button } from "@/components/ui/button"

export default async function GradesListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: allModules }, { data: userGrades }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, name, ects, semester, user_id")
      .order("semester", { ascending: true }),
    supabase
      .from("grades")
      .select("*")
      .eq("user_id", user!.id),
  ])

  const modules: ModuleWithStats[] = (allModules ?? [])
    .map((m) => {
      const grades = (userGrades ?? []).filter((g) => g.module_id === m.id)
      return {
        ...m,
        grades,
        average: calculateModuleAverage(grades),
      }
    })
    .filter((m) => m.grades.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/grades">← Zurück</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Alle Noten</h1>
          <p className="text-sm text-muted-foreground">Gruppiert nach Semester</p>
        </div>
      </div>

      <div className="rounded-md border">
        <GradesTable modules={modules} />
      </div>
    </div>
  )
}
