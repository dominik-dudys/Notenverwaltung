import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { KlausurWithStats } from "@/types"
import { calculateKlausurAverage } from "@/lib/utils/grade-calculations"
import { GradesTable } from "@/components/grades/grades-table"
import { Button } from "@/components/ui/button"

export default async function GradesListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: allKlausuren }, { data: userGrades }] = await Promise.all([
    supabase
      .from("modules")
      .select("*")
      .order("semester", { ascending: true }),
    supabase
      .from("grades")
      .select("*")
      .eq("user_id", user!.id),
  ])

  const klausuren: KlausurWithStats[] = (allKlausuren ?? [])
    .map((m) => {
      const grades = (userGrades ?? []).filter((g) => g.module_id === m.id)
      return {
        ...m,
        grades,
        average: calculateKlausurAverage(grades),
      }
    })
    .filter((k) => k.grades.length > 0)

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
        <GradesTable klausuren={klausuren} />
      </div>
    </div>
  )
}
