import { createClient } from "@/lib/supabase/server"
import { TimetableGrid } from "@/components/timetable/timetable-grid"
import { TimetableEntry } from "@/types"

export default async function TimetablePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("timetable_entries")
    .select("*")
    .order("time_slot", { ascending: true })

  const entries: TimetableEntry[] = data ?? []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Stundenplan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Wochenübersicht aller Lehrveranstaltungen
        </p>
      </div>
      <TimetableGrid entries={entries} />
    </div>
  )
}
