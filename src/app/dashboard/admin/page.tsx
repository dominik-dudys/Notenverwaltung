import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimetableUpload } from "@/components/timetable/timetable-upload"

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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role")
    .order("email", { ascending: true })

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
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Registrierte Nutzer</h2>
          <span className="text-sm text-muted-foreground">({profiles?.length ?? 0})</span>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-2 font-medium">E-Mail</th>
                <th className="text-left px-4 py-2 font-medium">Rolle</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
