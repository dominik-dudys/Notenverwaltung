"use client"

import { useState } from "react"
import { Grade, KlausurWithStats, SemesterStats } from "@/types"
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
  semesters: SemesterStats[]
  isAdmin?: boolean
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function KlausurList({ semesters, isAdmin }: KlausurListProps) {
  const maxSemester = semesters.length > 0 ? Math.max(...semesters.map((s) => s.semester)) : -1
  const [openSemesters, setOpenSemesters] = useState<Set<number>>(new Set([maxSemester]))
  const [selectedKlausur, setSelectedKlausur] = useState<KlausurWithStats | null>(null)

  function toggleSemester(semester: number) {
    setOpenSemesters((prev) => {
      const next = new Set(prev)
      if (next.has(semester)) next.delete(semester)
      else next.add(semester)
      return next
    })
  }

  return (
    <>
      <div className="rounded-md border divide-y">
        {semesters.map((sem) => {
          const isOpen = openSemesters.has(sem.semester)
          const klausurenWithGrades = sem.klausuren.filter((k) => k.grades.length > 0)
          return (
            <div key={sem.semester}>
              {/* Semester header */}
              <button
                onClick={() => toggleSemester(sem.semester)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <ChevronIcon open={isOpen} />
                <span className="font-semibold text-sm flex-1">
                  {sem.semester}. Semester
                </span>
                <div className="flex items-center gap-4 text-sm">
                  {sem.weightedAverage !== null ? (
                    <span className={`font-semibold ${getGradeColor(sem.weightedAverage)}`}>
                      Ø {formatGrade(sem.weightedAverage)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Ø –</span>
                  )}
                  <span className="text-muted-foreground hidden sm:inline">
                    {sem.totalEcts} ECTS
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {klausurenWithGrades.length}/{sem.klausuren.length} benotet
                  </span>
                </div>
              </button>

              {/* Klausur table */}
              {isOpen && (
                <div className="border-t bg-muted/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Klausur</th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground">Note</th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground hidden sm:table-cell">ECTS</th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground hidden sm:table-cell">Noten</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sem.klausuren.map((kl) => {
                        const ects = getEffectiveGrades(kl.grades).reduce((sum, g) => sum + (g.ects ?? 0), 0)
                        return (
                          <tr key={kl.id} className="hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() => setSelectedKlausur(kl)}
                                className="font-medium hover:underline underline-offset-4 text-left"
                              >
                                {kl.name}
                              </button>
                            </td>
                            <td className={`px-3 py-2.5 text-right font-semibold ${getGradeColor(kl.average)}`}>
                              {kl.average !== null ? formatGrade(kl.average) : "–"}
                            </td>
                            <td className="px-3 py-2.5 text-right text-muted-foreground hidden sm:table-cell">
                              {ects > 0 ? ects : "–"}
                            </td>
                            <td className="px-3 py-2.5 text-right text-muted-foreground hidden sm:table-cell">
                              {kl.grades.length}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <GradeFormDialog
                                moduleId={kl.id}
                                isAdmin={isAdmin}
                                trigger={
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                    + Note
                                  </Button>
                                }
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail Dialog */}
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
