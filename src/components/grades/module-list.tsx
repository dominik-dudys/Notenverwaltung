"use client"

import { useState } from "react"
import { RefreshCw, Plus } from "lucide-react"
import { Grade, KlausurWithStats, SemesterStats } from "@/types"
import { formatGrade, calculateWeightedAverage } from "@/lib/utils/grade-calculations"
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

export function KlausurList({ semesters }: KlausurListProps) {
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

  const allKlausuren = semesters.flatMap((s) => s.klausuren)
  const totalEarnedEcts = semesters.reduce((sum, s) => sum + s.totalEcts, 0)
  const overallAverage = calculateWeightedAverage(allKlausuren)
  const passedCount = allKlausuren.filter(
    (k) => k.grades.length > 0 && (k.average === null || k.average <= 4.0)
  ).length
  const ectsProgress = Math.min(100, (totalEarnedEcts / 180) * 100)

  return (
    <>
      {/* Summary Card */}
      <div className="rounded-lg border bg-card p-4 mb-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="shrink-0">
            <div className="text-xs text-muted-foreground mb-0.5">Gesamt-Ø</div>
            <div className={`text-2xl font-bold ${getGradeColor(overallAverage)}`}>
              {formatGrade(overallAverage)}
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div className="flex-1 min-w-[140px]">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>ECTS-Fortschritt</span>
              <span className="font-medium">{totalEarnedEcts} / 180</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${ectsProgress}%` }}
              />
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div className="shrink-0">
            <div className="text-xs text-muted-foreground mb-0.5">Bestanden</div>
            <div className="text-2xl font-bold">{passedCount}</div>
          </div>
        </div>
      </div>

      <div className="rounded-md border divide-y">
        {semesters.map((sem) => {
          const isOpen = openSemesters.has(sem.semester)
          const klausurenWithGrades = sem.klausuren.filter((k) => k.grades.length > 0)
          const semTotalEcts = sem.klausuren.reduce((sum, k) => sum + (k.ects ?? 0), 0)
          const semEctsProgress = semTotalEcts > 0 ? Math.min(100, (sem.totalEcts / semTotalEcts) * 100) : 0
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
                  <span className={`hidden sm:inline ${klausurenWithGrades.length === 0 ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                    {klausurenWithGrades.length}/{sem.klausuren.length} benotet
                  </span>
                </div>
              </button>

              {/* Semester ECTS progress bar */}
              <div className="h-0.5 bg-muted">
                <div
                  className="h-full bg-primary/50 transition-all"
                  style={{ width: `${semEctsProgress}%` }}
                />
              </div>

              {/* Klausur table */}
              {isOpen && (
                <div className="border-t bg-muted/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Klausur</th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground w-[60px] hidden sm:table-cell">
                          <span className="flex items-center justify-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Versuche
                          </span>
                        </th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground w-[60px]">ECTS</th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground w-[90px]">Note</th>
                        <th className="px-3 py-2 w-[40px]" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sem.klausuren.map((kl) => {
                        const ects = kl.ects ?? 0
                        const isFailed = kl.average === 5.0
                        const hasNoGrade = kl.grades.length === 0
                        const rowClass = isFailed
                          ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                          : hasNoGrade
                          ? "opacity-60 transition-colors"
                          : "hover:bg-muted/40 transition-colors"
                        const noteColorClass = kl.average !== null
                          ? `${getGradeColor(kl.average)}${isFailed ? " line-through" : ""}`
                          : kl.grades.length > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                        return (
                          <tr key={kl.id} className={rowClass}>
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() => setSelectedKlausur(kl)}
                                className="font-medium hover:underline underline-offset-4 text-left"
                              >
                                {kl.name}
                              </button>
                            </td>
                            <td className="px-3 py-2.5 text-center text-muted-foreground w-[60px] hidden sm:table-cell">
                              {kl.grades.length}
                            </td>
                            <td className="px-3 py-2.5 text-center text-muted-foreground w-[60px]">
                              {ects > 0 ? ects : "–"}
                            </td>
                            <td className={`px-3 py-2.5 text-center font-semibold w-[90px] ${noteColorClass}`}>
                              {kl.average !== null ? formatGrade(kl.average) : kl.grades.length > 0 ? "BE" : "–"}
                            </td>
                            <td className="px-3 py-2.5 text-right w-[40px]">
                              <GradeFormDialog
                                moduleId={kl.id}
                                moduleEcts={kl.ects}
                                trigger={
                                  <Button variant="ghost" size="icon-sm" title="Note eintragen">
                                    <Plus className="h-4 w-4" />
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
                  {selectedKlausur.ects != null && selectedKlausur.ects > 0 && (
                    <Badge variant="secondary">
                      {selectedKlausur.ects} ECTS
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="py-2">
                <div className={`text-4xl font-bold ${selectedKlausur.average !== null ? getGradeColor(selectedKlausur.average) : selectedKlausur.grades.length > 0 ? "text-green-600" : ""}`}>
                  {selectedKlausur.average !== null ? formatGrade(selectedKlausur.average) : selectedKlausur.grades.length > 0 ? "BE" : "–"}
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
                                moduleEcts={selectedKlausur.ects}
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
                  moduleId={selectedKlausur.id}
                  moduleEcts={selectedKlausur.ects}
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
