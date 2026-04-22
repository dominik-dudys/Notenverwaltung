export function getGradeColor(grade: number | null): string {
  if (grade === null) return "text-muted-foreground"
  if (grade <= 1.7) return "text-green-600"
  if (grade <= 2.5) return "text-blue-600"
  if (grade <= 3.5) return "text-yellow-600"
  if (grade <= 4.0) return "text-orange-600"
  return "text-red-600"
}

export function getGradeBadgeVariant(
  grade: number | null
): "default" | "secondary" | "destructive" | "outline" {
  if (grade === null) return "outline"
  if (grade <= 2.5) return "default"
  if (grade <= 4.0) return "secondary"
  return "destructive"
}

export function getGradeChartColor(label: string): string {
  const colors: Record<string, string> = {
    "Sehr gut": "#16a34a",
    Gut: "#2563eb",
    Befriedigend: "#ca8a04",
    Ausreichend: "#ea580c",
    "Nicht bestanden": "#dc2626",
  }
  return colors[label] ?? "#94a3b8"
}
