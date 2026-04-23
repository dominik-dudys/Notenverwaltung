import { createClient } from "@/lib/supabase/server"
import { KlausurManagement } from "@/components/admin/module-management"
import { ModulManagement } from "@/components/admin/subject-management"

export default async function KlausurenPage() {
  const supabase = await createClient()

  const [{ data: klausurenRaw }, { data: module }] = await Promise.all([
    supabase
      .from("modules")
      .select("*, grades(user_id)")
      .order("semester", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("subjects")
      .select("*")
      .order("sort_order", { ascending: true }),
  ])

  const klausuren = (klausurenRaw ?? []).map((m) => ({
    ...m,
    grades: [],
    average: null,
    totalGradeCount: (m.grades ?? []).length,
  }))

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Klausuren verwalten</h2>
        <KlausurManagement klausuren={klausuren} module={module ?? []} />
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Module verwalten</h2>
        <p className="text-sm text-muted-foreground">
          Module gruppieren Klausuren, die über mehrere Semester gehen (z.B. &quot;Mathe 3&quot; → Statistik 1 + Statistik 2).
        </p>
        <ModulManagement module={module ?? []} />
      </div>
    </div>
  )
}
