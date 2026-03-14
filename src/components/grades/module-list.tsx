"use client"

import { useState } from "react"
import { ModuleWithStats, Grade } from "@/types"
import { formatGrade } from "@/lib/utils/grade-calculations"
import { getGradeColor } from "@/lib/utils/grade-colors"
import { GradeFormDialog } from "@/components/grades/grade-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ModuleListProps {
  modules: ModuleWithStats[]
}

export function ModuleList({ modules }: ModuleListProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleWithStats | null>(null)

  // Group modules by semester
  const semesterMap = new Map<number, ModuleWithStats[]>()
  for (const mod of modules) {
    const sem = mod.semester ?? 0
    if (!semesterMap.has(sem)) semesterMap.set(sem, [])
    semesterMap.get(sem)!.push(mod)
  }
  const semesters = Array.from(semesterMap.entries()).sort(([a], [b]) => a - b)

  return (
    <>
      <div className="space-y-6">
        {semesters.map(([semester, semModules]) => (
          <div key={semester}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {semester}. Semester
            </h3>
            <div className="rounded-md border divide-y">
              {semModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{mod.name}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Sem. {mod.semester}</span>
                    <span>{mod.ects} ECTS</span>
                    <span className={`font-semibold ${getGradeColor(mod.average)}`}>
                      {mod.average !== null ? `Ø ${formatGrade(mod.average)}` : "–"}
                    </span>
                    <span>{mod.grades.length} {mod.grades.length === 1 ? "Note" : "Noten"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedModule !== null} onOpenChange={(open) => { if (!open) setSelectedModule(null) }}>
        <DialogContent className="sm:max-w-2xl">
          {selectedModule && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedModule.name}</DialogTitle>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{selectedModule.semester}. Semester</Badge>
                  <Badge variant="secondary">{selectedModule.ects} ECTS</Badge>
                </div>
              </DialogHeader>

              <div className="py-2">
                <div className={`text-4xl font-bold ${getGradeColor(selectedModule.average)}`}>
                  {selectedModule.average !== null ? formatGrade(selectedModule.average) : "–"}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Durchschnitt</p>
              </div>

              {selectedModule.grades.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-3 py-2 font-medium">Note</th>
                        <th className="text-left px-3 py-2 font-medium">Datum</th>
                        <th className="text-left px-3 py-2 font-medium">Beschreibung</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedModule.grades.map((grade: Grade) => (
                        <tr key={grade.id} className="hover:bg-muted/30">
                          <td className={`px-3 py-2 font-semibold ${getGradeColor(grade.grade)}`}>
                            {formatGrade(grade.grade)}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {grade.date ? new Date(grade.date).toLocaleDateString("de-DE") : "–"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {grade.description ?? "–"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <GradeFormDialog
                              moduleId={selectedModule.id}
                              grade={grade}
                              trigger={
                                <Button variant="ghost" size="sm">Bearbeiten</Button>
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">Noch keine Noten eingetragen.</p>
              )}

              <div className="flex justify-between pt-2">
                <GradeFormDialog
                  moduleId={selectedModule.id}
                  trigger={
                    <Button size="sm">+ Note hinzufügen</Button>
                  }
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
