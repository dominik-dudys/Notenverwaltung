interface StatsOverviewProps {
  weightedAverage: number | null
  totalEcts: number | null
  moduleCount: number
}

export function StatsOverview({ weightedAverage, totalEcts, moduleCount }: StatsOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Gesamtdurchschnitt</p>
          <p className="text-2xl font-bold mt-1">
            {weightedAverage != null ? weightedAverage.toFixed(2) : "–"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Gesamt-ECTS</p>
          <p className="text-2xl font-bold mt-1">{totalEcts ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Module</p>
          <p className="text-2xl font-bold mt-1">{moduleCount}</p>
        </div>
      </div>
    </div>
  )
}
