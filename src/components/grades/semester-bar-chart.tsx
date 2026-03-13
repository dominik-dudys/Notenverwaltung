"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { SemesterStats } from "@/types"
import { formatGrade } from "@/lib/utils/grade-calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SemesterBarChartProps {
  semesters: SemesterStats[]
}

export function SemesterBarChart({ semesters }: SemesterBarChartProps) {
  const data = semesters
    .filter((s) => s.weightedAverage !== null)
    .map((s) => ({
      name: `Sem. ${s.semester}`,
      average: s.weightedAverage!,
      color: s.weightedAverage! <= 2.5 ? "#2563eb" : s.weightedAverage! <= 4.0 ? "#ca8a04" : "#dc2626",
    }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ø pro Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Daten vorhanden
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ø pro Semester</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[1, 5]}
              reversed
              tickCount={5}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v.toFixed(1)}
            />
            <Tooltip
              formatter={(value: number) => [formatGrade(value), "Durchschnitt"]}
            />
            <Bar dataKey="average" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
