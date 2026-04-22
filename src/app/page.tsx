import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard/grades")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Studentenverwaltung</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte deine Noten an einem Ort.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 w-full max-w-2xl mb-10">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Notenverwaltung</CardTitle>
            <CardDescription>
              Noten eintragen, Durchschnitte berechnen, ECTS verfolgen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Gewichteter Gesamtdurchschnitt</li>
              <li>Semester- und Modulübersicht</li>
              <li>Charts & Statistiken</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/auth/login">Anmelden</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/register">Registrieren</Link>
        </Button>
      </div>
    </div>
  )
}
