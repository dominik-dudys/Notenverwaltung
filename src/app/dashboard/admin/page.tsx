import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimetableUpload } from "@/components/timetable/timetable-upload"
import { UserManagement } from "@/components/admin/user-management"
import { ModuleManagement } from "@/components/admin/module-management"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/dashboard/grades")

  const [{ data: profiles }, { data: modulesRaw }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, role")
      .order("email", { ascending: true }),
    supabase
      .from("modules")
      .select("*, grades(user_id)")
      .order("semester", { ascending: true })
      .order("name", { ascending: true }),
  ])

  const modules = (modulesRaw ?? []).map((m) => ({
    ...m,
    grades: [],
    average: null,
    totalGradeCount: (m.grades ?? []).length,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Nutzerverwaltung und Stundenplan-Upload
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Stundenplan hochladen</h2>
        <TimetableUpload />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Module verwalten</h2>
        <ModuleManagement modules={modules} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Registrierte Nutzer</h2>
          <span className="text-sm text-muted-foreground">({profiles?.length ?? 0})</span>
        </div>
        <UserManagement profiles={profiles ?? []} currentUserId={user.id} />
      </div>
    </div>
  )
}
