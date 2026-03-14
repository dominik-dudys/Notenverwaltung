import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { StatsOverview } from "@/components/profile/stats-overview"
import { Separator } from "@/components/ui/separator"

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName[0].toUpperCase()
  return email[0].toUpperCase()
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [{ data: profile }, { data: stats }, { data: modules }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, first_name, last_name, study_program, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase.from("overall_average").select("*").single(),
    supabase.from("modules").select("id").eq("user_id", user.id),
  ])

  const initials = getInitials(profile?.first_name ?? null, profile?.last_name ?? null, user.email ?? "?")
  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user.email ?? ""

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground text-sm mt-1">Persönliche Daten und Einstellungen</p>
      </div>

      {/* Header */}
      <div className="flex items-center gap-6">
        <AvatarUpload
          userId={user.id}
          avatarUrl={profile?.avatar_url ?? null}
          initials={initials}
        />
        <div>
          <p className="text-xl font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground capitalize">{profile?.role ?? "student"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Separator />

      {/* Persönliche Daten + Statistiken */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-lg font-semibold">Persönliche Daten</h2>
          <ProfileForm
            userId={user.id}
            initialValues={{
              first_name: profile?.first_name ?? null,
              last_name: profile?.last_name ?? null,
              study_program: profile?.study_program ?? null,
            }}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Statistiken</h2>
          <StatsOverview
            weightedAverage={stats?.weighted_average ?? null}
            totalEcts={stats?.total_ects ?? null}
            moduleCount={modules?.length ?? 0}
          />
        </div>
      </div>

      <Separator />

      {/* Passwort */}
      <div className="max-w-sm space-y-2">
        <h2 className="text-lg font-semibold">Passwort ändern</h2>
        <PasswordChangeForm />
      </div>
    </div>
  )
}
