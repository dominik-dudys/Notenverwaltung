"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { KlausurWithStats, Modul } from "@/types"
import { KlausurFormDialog } from "@/components/grades/module-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface KlausurWithTotalGrades extends KlausurWithStats {
  totalGradeCount: number
}

interface KlausurManagementProps {
  klausuren: KlausurWithTotalGrades[]
  module: Modul[]
}

export function KlausurManagement({ klausuren, module }: KlausurManagementProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<KlausurWithTotalGrades | null>(null)

  const sortedKlausuren = [...klausuren].sort((a, b) => {
    const semA = a.semester ?? 0
    const semB = b.semester ?? 0
    if (semA !== semB) return semA - semB
    return a.name.localeCompare(b.name)
  })

  const grouped = new Map<number, KlausurWithTotalGrades[]>()
  for (const kl of sortedKlausuren) {
    const sem = kl.semester ?? 0
    if (!grouped.has(sem)) grouped.set(sem, [])
    grouped.get(sem)!.push(kl)
  }
  const semesterKeys = [...grouped.keys()].sort((a, b) => a - b)

  const modulMap = new Map(module.map((m) => [m.id, m.name]))

  async function handleDelete(klausurId: string) {
    const supabase = createClient()
    await supabase.from("modules").delete().eq("id", klausurId)
    setDeleteTarget(null)
    router.refresh()
  }

  function requestDelete(kl: KlausurWithTotalGrades) {
    if (kl.totalGradeCount > 0) {
      setDeleteTarget(kl)
    } else {
      handleDelete(kl.id)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <KlausurFormDialog
          isAdmin
          module={module}
          trigger={<Button size="sm">+ Klausur erstellen</Button>}
        />
      </div>

      {sortedKlausuren.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Noch keine Klausuren vorhanden.</p>
      ) : (
        <div className="space-y-6">
          {semesterKeys.map((sem) => (
            <div key={sem} className="bg-muted/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Semester {sem === 0 ? "—" : sem}</h3>
              <div className="rounded-md border divide-y bg-background">
                {grouped.get(sem)!.map((kl) => (
                  <div key={kl.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium">{kl.name}</span>
                      {kl.subject_id && modulMap.has(kl.subject_id) && (
                        <Badge variant="secondary" className="text-xs">
                          {modulMap.get(kl.subject_id)}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {kl.totalGradeCount} {kl.totalGradeCount === 1 ? "Note" : "Noten"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <KlausurFormDialog
                        klausur={kl}
                        isAdmin
                        module={module}
                        trigger={<Button variant="outline" size="sm">Bearbeiten</Button>}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => requestDelete(kl)}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={deleteTarget !== null} onOpenChange={(open: boolean) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Klausur löschen?</DialogTitle>
            <DialogDescription>
              Diese Klausur hat {deleteTarget?.totalGradeCount} eingetragene{" "}
              {deleteTarget?.totalGradeCount === 1 ? "Note" : "Noten"}. Beim Löschen werden alle Noten
              unwiderruflich entfernt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Abbrechen</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Trotzdem löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
