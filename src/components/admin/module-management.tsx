"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ModuleWithStats } from "@/types"
import { ModuleFormDialog } from "@/components/grades/module-form-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ModuleWithTotalGrades extends ModuleWithStats {
  totalGradeCount: number
}

interface ModuleManagementProps {
  modules: ModuleWithTotalGrades[]
}

export function ModuleManagement({ modules }: ModuleManagementProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<ModuleWithTotalGrades | null>(null)

  const sortedModules = [...modules].sort((a, b) => {
    const semA = a.semester ?? 0
    const semB = b.semester ?? 0
    if (semA !== semB) return semA - semB
    return a.name.localeCompare(b.name)
  })

  const grouped = new Map<number, ModuleWithTotalGrades[]>()
  for (const mod of sortedModules) {
    const sem = mod.semester ?? 0
    if (!grouped.has(sem)) grouped.set(sem, [])
    grouped.get(sem)!.push(mod)
  }
  const semesterKeys = [...grouped.keys()].sort((a, b) => a - b)

  async function handleDelete(moduleId: string) {
    const supabase = createClient()
    await supabase.from("modules").delete().eq("id", moduleId)
    setDeleteTarget(null)
    router.refresh()
  }

  function requestDelete(mod: ModuleWithTotalGrades) {
    if (mod.totalGradeCount > 0) {
      setDeleteTarget(mod)
    } else {
      handleDelete(mod.id)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <ModuleFormDialog
          trigger={<Button size="sm">+ Modul erstellen</Button>}
        />
      </div>

      {sortedModules.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Noch keine Module vorhanden.</p>
      ) : (
        <div className="space-y-6">
          {semesterKeys.map((sem) => (
            <div key={sem} className="bg-muted/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Semester {sem === 0 ? "—" : sem}</h3>
              <div className="rounded-md border divide-y bg-background">
                {grouped.get(sem)!.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{mod.name}</span>
                      <span className="text-sm text-muted-foreground">{mod.ects} ECTS</span>
                      <span className="text-sm text-muted-foreground">
                        {mod.totalGradeCount} {mod.totalGradeCount === 1 ? "Note" : "Noten"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <ModuleFormDialog
                        module={mod}
                        trigger={<Button variant="outline" size="sm">Bearbeiten</Button>}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => requestDelete(mod)}
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
            <DialogTitle>Modul löschen?</DialogTitle>
            <DialogDescription>
              Dieses Modul hat {deleteTarget?.totalGradeCount} eingetragene{" "}
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
