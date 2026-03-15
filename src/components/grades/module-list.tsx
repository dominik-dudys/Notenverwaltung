"use client"

import { useState } from "react"
import { KlausurWithStats, Grade } from "@/types"
import { formatGrade, getEffectiveGrades } from "@/lib/utils/grade-calculations"
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

interface KlausurListProps {
  klausuren: KlausurWithStats[]
  isAdmin?: boolean
}

export function KlausurList({ klausuren, isAdmin }: KlausurListProps) {
  const [selectedKlausur, setSelectedKlausur] = useState<KlausurWithStats | null>(null)

  // Group klausuren by semester
  const semesterMap = new Map<number, KlausurWithStats[]>()
  for (const kl of klausuren) {
    const sem = kl.semester ?? 0
    if (!semesterMap.has(sem)) semesterMap.set(sem, [])
    semesterMap.get(sem)!.push(kl)
  }
  const semesters = Array.from(semesterMap.entries()).sort(([a], [b]) => a - b)

  return (
    <>
      <div className="space-y-6">
        {semesters.map(([semester, semKlausuren]) => (
          <div key={semester}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {semester}. Semester
            </h3>
            <div className="rounded-md border divide-y">
              {semKlausuren.map((kl) => (
                <button
                  key={kl.id}
                  onClick={() => setSelectedKlausur(kl)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{kl.name}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Sem. {kl.semester}</span>
                    {getEffectiveGrades(kl.grades).reduce((sum, g) => sum + (g.ects ?? 0), 0) > 0 && (
                      <span>{getEffectiveGrades(kl.grades).reduce((sum, g) => sum + (g.ects ?? 0), 0)} ECTS</span>
                    )}
                    <span className={`font-semibold ${getGradeColor(kl.average)}`}>
                      {kl.average !== null ? `Ø ${formatGrade(kl.average)}` : "–"}
                    </span>
                    <span>{kl.grades.length} {kl.grades.length === 1 ? "Note" : "Noten"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedKlausur !== null} onOpenChange={(open) => { if (!open) setSelectedKlausur(null) }}>
        <DialogContent className="sm:max-w-2xl">
          {selectedKlausur && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedKlausur.name}</DialogTitle>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{selectedKlausur.semester}. Semester</Badge>
                  {getEffectiveGrades(selectedKlausur.grades).reduce((sum, g) => sum + (g.ects ?? 0), 0) > 0 && (
                    <Badge variant="secondary">
                      {getEffectiveGrades(selectedKlausur.grades).reduce((sum, g) => sum + (g.ects ?? 0), 0)} ECTS
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="py-2">
                <div className={`text-4xl font-bold ${getGradeColor(selectedKlausur.average)}`}>
                  {selectedKlausur.average !== null ? formatGrade(selectedKlausur.average) : "–"}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Durchschnitt</p>
              </div>

              {selectedKlausur.grades.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-3 py-2 font-medium">Klausur</th>
                        <th className="text-left px-3 py-2 font-medium">Note</th>
                        <th className="text-left px-3 py-2 font-medium">Datum</th>
                        <th className="text-left px-3 py-2 font-medium">Beschreibung</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[...selectedKlausur.grades]
                        .sort((a, b) => {
                          if (a.is_retake !== b.is_retake) return a.is_retake ? -1 : 1
                          return (b.date ?? "").localeCompare(a.date ?? "")
                        })
                        .map((grade: Grade) => (
                        <tr key={grade.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 text-muted-foreground text-sm">
                            {grade.exam_name ?? "–"}
                          </td>
                          <td className={`px-3 py-2 font-semibold ${getGradeColor(grade.grade)}`}>
                            <div className="flex items-center gap-2">
                              {formatGrade(grade.grade)}
                              {grade.is_retake && (
                                <Badge className="text-xs bg-amber-500 hover:bg-amber-500 text-white">NKL</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {grade.date ? new Date(grade.date).toLocaleDateString("de-DE") : "–"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {grade.description ?? "–"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <GradeFormDialog
                              moduleId={selectedKlausur.id}
                              grade={grade}
                              isAdmin={isAdmin}
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
                  moduleId={selectedKlausur.id}
                  isAdmin={isAdmin}
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
