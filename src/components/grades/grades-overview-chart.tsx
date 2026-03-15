"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Grade } from "@/types"
import { getGradeLabel } from "@/lib/utils/grade-calculations"
import { getGradeChartColor } from "@/lib/utils/grade-colors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GradesOverviewChartProps {
  grades: Grade[]
}

export function GradesOverviewChart({ grades }: GradesOverviewChartProps) {
  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notenverteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Noten vorhanden
          </p>
        </CardContent>
      </Card>
    )
  }

  const distribution = new Map<string, number>()
  for (const g of grades) {
    const label = getGradeLabel(g.grade)
    distribution.set(label, (distribution.get(label) ?? 0) + 1)
  }

  const data = Array.from(distribution.entries()).map(([name, value]) => ({
    name,
    value,
    color: getGradeChartColor(name),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notenverteilung</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
