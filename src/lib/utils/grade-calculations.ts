import { Grade, KlausurWithStats, SemesterStats } from "@/types"

export function getEffectiveGrades(grades: Grade[]): Grade[] {
  const hasRetake = grades.some((g) => g.is_retake)
  const filtered = hasRetake ? grades.filter((g) => g.is_retake) : grades
  return filtered.filter((g) => g.grade !== 0)
}

export function calculateKlausurAverage(grades: Grade[]): number | null {
  const scoredGrades = getEffectiveGrades(grades)
  if (scoredGrades.length === 0) return null

  const gradesWithEcts = scoredGrades.filter((g) => g.ects != null && g.ects > 0)
  if (gradesWithEcts.length > 0) {
    const weightedSum = gradesWithEcts.reduce((acc, g) => acc + g.grade * g.ects!, 0)
    const totalEcts = gradesWithEcts.reduce((acc, g) => acc + g.ects!, 0)
    return Math.round((weightedSum / totalEcts) * 10) / 10
  }

  const sum = scoredGrades.reduce((acc, g) => acc + g.grade, 0)
  return Math.round((sum / scoredGrades.length) * 10) / 10
}

export function calculateWeightedAverage(
  klausuren: Array<{ grades: Grade[] }>
): number | null {
  const klausurenWithGrades = klausuren.filter((k) => k.grades.length > 0)
  if (klausurenWithGrades.length === 0) return null

  const allGrades = klausurenWithGrades.flatMap((k) => getEffectiveGrades(k.grades))
  const gradesWithEcts = allGrades.filter((g) => g.ects != null && g.ects > 0)

  if (gradesWithEcts.length > 0) {
    const weightedSum = gradesWithEcts.reduce((acc, g) => acc + g.grade * g.ects!, 0)
    const totalEcts = gradesWithEcts.reduce((acc, g) => acc + g.ects!, 0)
    if (totalEcts === 0) return null
    return Math.round((weightedSum / totalEcts) * 100) / 100
  }

  if (allGrades.length === 0) return null
  const sum = allGrades.reduce((acc, g) => acc + g.grade, 0)
  return Math.round((sum / allGrades.length) * 100) / 100
}

export function groupBySemester(klausuren: KlausurWithStats[]): SemesterStats[] {
  const semesterMap = new Map<number, KlausurWithStats[]>()

  for (const kl of klausuren) {
    const sem = kl.semester ?? 0
    if (!semesterMap.has(sem)) {
      semesterMap.set(sem, [])
    }
    semesterMap.get(sem)!.push(kl)
  }

  const result: SemesterStats[] = []
  for (const [semester, kls] of semesterMap.entries()) {
    const totalEcts = kls.flatMap((k) => getEffectiveGrades(k.grades)).reduce((sum, g) => sum + (g.ects ?? 0), 0)
    result.push({
      semester,
      klausuren: kls,
      weightedAverage: calculateWeightedAverage(kls),
      totalEcts,
    })
  }

  return result.sort((a, b) => a.semester - b.semester)
}

export function getGradeLabel(grade: number): string {
  if (grade === 0) return "Bestanden"
  if (grade <= 1.5) return "Sehr gut"
  if (grade <= 2.5) return "Gut"
  if (grade <= 3.5) return "Befriedigend"
  if (grade <= 4.0) return "Ausreichend"
  return "Nicht bestanden"
}

export function formatGrade(grade: number | null): string {
  if (grade === null) return "–"
  if (grade === 0) return "BE"
  return grade.toFixed(1)
}
