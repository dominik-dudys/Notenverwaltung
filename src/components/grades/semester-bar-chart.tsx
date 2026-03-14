"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { SemesterStats } from "@/types"
import { formatGrade } from "@/lib/utils/grade-calculations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SemesterBarChartProps {
  semesters: SemesterStats[]
}

function getDotColor(average: number): string {
  if (average <= 2.5) return "#2563eb"
  if (average <= 4.0) return "#ca8a04"
  return "#dc2626"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props
  const color = getDotColor(payload.average)
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const { average, ects } = payload[0].payload
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        Ø {formatGrade(average)} ({ects} ECTS)
      </p>
    </div>
  )
}

export function SemesterBarChart({ semesters }: SemesterBarChartProps) {
  const data = semesters
    .filter((s) => s.weightedAverage !== null)
    .map((s) => ({
      name: `${s.semester}. Sem.`,
      average: s.weightedAverage!,
      ects: s.totalEcts,
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
        <CardTitle className="text-base">Notentrend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[1, 5]}
              reversed
              tickCount={5}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => v.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={4.0}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{ value: "4,0", position: "right", fontSize: 11, fill: "#ef4444" }}
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#gradeGradient)"
              dot={<CustomDot />}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
