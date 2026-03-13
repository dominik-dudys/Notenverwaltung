import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ModuleWithStats } from "@/types"
import { calculateModuleAverage } from "@/lib/utils/grade-calculations"
import { GradesTable } from "@/components/grades/grades-table"
import { Button } from "@/components/ui/button"

export default async function GradesListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: modulesRaw } = await supabase
    .from("modules")
    .select("*, grades(*)")
    .eq("user_id", user!.id)
    .order("semester", { ascending: true })

  const modules: ModuleWithStats[] = (modulesRaw ?? []).map((m) => ({
    ...m,
    grades: m.grades ?? [],
    average: calculateModuleAverage(m.grades ?? []),
  }))

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
