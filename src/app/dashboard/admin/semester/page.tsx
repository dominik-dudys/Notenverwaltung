import { createClient } from "@/lib/supabase/server"
import { SemesterManagement } from "@/components/admin/semester-management"

export default async function SemesterPage() {
  const supabase = await createClient()
  const { data: semesters } = await supabase
    .from("semesters")
    .select("*")
    .order("start_date", { ascending: true })

  return <SemesterManagement semesters={semesters ?? []} />
}
