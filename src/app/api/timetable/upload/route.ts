import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseTimetableBuffer } from "@/lib/utils/parse-timetable"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!file.name.endsWith(".xlsx")) {
    return NextResponse.json({ error: "Only .xlsx files are allowed" }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const entries = parseTimetableBuffer(buffer)

  if (entries.length === 0) {
    return NextResponse.json({ error: "No valid entries found in file" }, { status: 400 })
  }

  // Delete existing entries
  await supabase.from("timetable_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  // Insert new entries
  const { error } = await supabase.from("timetable_entries").insert(entries)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: entries.length })
}
