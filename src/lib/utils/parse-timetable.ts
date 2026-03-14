import * as XLSX from "xlsx"

export interface ParsedTimetableRow {
  day: string
  time_slot: string
  subject: string
  room: string | null
  lecturer: string | null
}

export function parseTimetableBuffer(buffer: Buffer): ParsedTimetableRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" })

  const results: ParsedTimetableRow[] = []

  for (const row of rows) {
    const day = String(row[0] ?? "").trim()
    const time_slot = String(row[1] ?? "").trim()
    const subject = String(row[2] ?? "").trim()
    const room = String(row[3] ?? "").trim() || null
    const lecturer = String(row[4] ?? "").trim() || null

    // Skip rows without required fields
    if (!day || !time_slot || !subject) continue

    results.push({ day, time_slot, subject, room, lecturer })
  }

  return results
}
