import { createClient } from "@/lib/supabase/server"
import { UserManagement } from "@/components/admin/user-management"

export default async function BenutzerverwaltungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role")
    .order("email", { ascending: true })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Registrierte Nutzer</h2>
        <span className="text-sm text-muted-foreground">({profiles?.length ?? 0})</span>
      </div>
      <UserManagement profiles={profiles ?? []} currentUserId={user!.id} />
    </div>
  )
}
