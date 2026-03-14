import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { Separator } from "@/components/ui/separator"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm">Studentenverwaltung</span>
            <Separator orientation="vertical" className="h-5" />
            <DashboardNav isAdmin={isAdmin} />
          </div>
          <UserMenu
            user={user}
            profile={{
              role: profile?.role ?? "student",
              first_name: profile?.first_name ?? null,
              last_name: profile?.last_name ?? null,
              avatar_url: profile?.avatar_url ?? null,
            }}
          />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
