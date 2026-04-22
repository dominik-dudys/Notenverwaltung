"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Klausur, VALID_GRADES, GradeValue } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GradeImportDialogProps {
  klausuren: Klausur[]
}

interface GradeRow {
  moduleId: string
  grade: GradeValue
  date: string
  enabled: boolean
}

export function GradeImportDialog({ klausuren }: GradeImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<GradeRow[]>([])
  const router = useRouter()

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setRows(
        klausuren.map((k) => ({
          moduleId: k.id,
          grade: 1.0,
          date: new Date().toISOString().split("T")[0],
          enabled: false,
        }))
      )
    }
  }

  function updateRow(index: number, patch: Partial<GradeRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function handleSave() {
    const selected = rows.filter((r) => r.enabled)
    if (selected.length === 0) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from("grades").insert(
      selected.map((r) => {
        const klausur = klausuren.find((k) => k.id === r.moduleId)
        return {
          module_id: r.moduleId,
          grade: r.grade,
          date: r.date,
          user_id: user?.id,
          is_retake: false,
          ...(klausur?.ects != null && { ects: klausur.ects }),
        }
      })
    )

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const selectedCount = rows.filter((r) => r.enabled).length

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Schnelleingabe</Button>} />
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Noten schnell eintragen</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Aktiviere eine Klausur, um eine Note dafür einzutragen.
        </p>

        <div className="space-y-2">
          {rows.map((row, i) => {
            const klausur = klausuren[i]
            return (
              <div
                key={klausur.id}
                className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                  row.enabled ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <input
                  type="checkbox"
                  id={`check-${klausur.id}`}
                  checked={row.enabled}
                  onChange={(e) => updateRow(i, { enabled: e.target.checked })}
                  className="h-4 w-4 cursor-pointer shrink-0"
                />
                <label
                  htmlFor={`check-${klausur.id}`}
                  className="text-sm font-medium cursor-pointer flex-1 min-w-0 truncate"
                >
                  {klausur.name}
                  {klausur.semester && (
                    <span className="ml-1 text-muted-foreground font-normal">
                      (Sem. {klausur.semester})
                    </span>
                  )}
                </label>
                {row.enabled && (
                  <>
                    <Select
                      value={String(row.grade)}
                      onValueChange={(v) => updateRow(i, { grade: Number(v) as GradeValue })}
                    >
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VALID_GRADES.map((g) => (
                          <SelectItem key={g} value={String(g)}>
                            {g === 0 ? "BE" : g.toFixed(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(i, { date: e.target.value })}
                      className="w-36 h-8 text-sm"
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={loading || selectedCount === 0}>
            {loading ? "Speichern..." : `${selectedCount} Note${selectedCount !== 1 ? "n" : ""} speichern`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
