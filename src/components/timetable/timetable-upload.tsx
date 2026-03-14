"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function TimetableUpload() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/timetable/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      setMessage({ type: "success", text: `${data.count} Einträge erfolgreich importiert.` })
      router.refresh()
    } else {
      setMessage({ type: "error", text: data.error ?? "Fehler beim Upload." })
    }

    setLoading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {loading ? "Wird hochgeladen..." : "Excel hochladen (.xlsx)"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Excel-Format: Spalten A–E = Tag, Uhrzeit, Fach, Raum, Dozent. Bestehender Stundenplan wird überschrieben.
      </p>
    </div>
  )
}
