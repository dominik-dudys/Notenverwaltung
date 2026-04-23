"use client"

import { useState } from "react"
import { GradesOverviewChart } from "@/components/grades/grades-overview-chart"
import { SemesterBarChart } from "@/components/grades/semester-bar-chart"
import { Grade, SemesterStats } from "@/types"

interface CollapsibleChartsProps {
  grades: Grade[]
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

export function CollapsibleCharts({ grades, semesters }: CollapsibleChartsProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors rounded-lg"
      >
        <ChevronIcon open={open} />
        Statistiken
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
          <GradesOverviewChart grades={grades} />
          <SemesterBarChart semesters={semesters} />
        </div>
      )}
    </div>
  )
}
