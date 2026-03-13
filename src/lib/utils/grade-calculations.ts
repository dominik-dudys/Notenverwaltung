import { Grade, ModuleWithStats, SemesterStats } from "@/types"

export function calculateModuleAverage(grades: Grade[]): number | null {
  if (grades.length === 0) return null
  const sum = grades.reduce((acc, g) => acc + g.grade, 0)
  return Math.round((sum / grades.length) * 10) / 10
}

export function calculateWeightedAverage(
  modules: Array<{ ects: number; grades: Grade[] }>
): number | null {
  const modulesWithGrades = modules.filter((m) => m.grades.length > 0)
  if (modulesWithGrades.length === 0) return null

  let weightedSum = 0
  let totalEcts = 0

  for (const mod of modulesWithGrades) {
    const avg = calculateModuleAverage(mod.grades)
    if (avg !== null) {
      weightedSum += avg * mod.ects
      totalEcts += mod.ects
    }
  }

  if (totalEcts === 0) return null
  return Math.round((weightedSum / totalEcts) * 100) / 100
}

export function groupBySemester(modules: ModuleWithStats[]): SemesterStats[] {
  const semesterMap = new Map<number, ModuleWithStats[]>()

  for (const mod of modules) {
    const sem = mod.semester ?? 0
    if (!semesterMap.has(sem)) {
      semesterMap.set(sem, [])
    }
    semesterMap.get(sem)!.push(mod)
  }

  const result: SemesterStats[] = []
  for (const [semester, mods] of semesterMap.entries()) {
    result.push({
      semester,
      modules: mods,
      weightedAverage: calculateWeightedAverage(mods),
      totalEcts: mods.reduce((sum, m) => sum + m.ects, 0),
    })
  }

  return result.sort((a, b) => a.semester - b.semester)
}

export function getGradeLabel(grade: number): string {
  if (grade <= 1.5) return "Sehr gut"
  if (grade <= 2.5) return "Gut"
  if (grade <= 3.5) return "Befriedigend"
  if (grade <= 4.0) return "Ausreichend"
  return "Nicht bestanden"
}

export function formatGrade(grade: number | null): string {
  if (grade === null) return "–"
  return grade.toFixed(1)
}
