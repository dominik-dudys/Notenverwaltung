import { Grade, KlausurWithStats, Modul, ModulWithKlausuren, SemesterStats } from "@/types"

// Returns the grades that count for the final result:
// - If retakes exist, use only retakes
// - Exclude "Bestanden" (grade=0) entries – those count for ECTS but not the numeric average
export function getEffectiveGrades(grades: Grade[]): Grade[] {
  const hasRetake = grades.some((g) => g.is_retake)
  const filtered = hasRetake ? grades.filter((g) => g.is_retake) : grades
  return filtered.filter((g) => g.grade !== 0)
}

// Returns all effective attempts (including Bestanden) to determine if ECTS were earned
export function getEffectiveAttempts(grades: Grade[]): Grade[] {
  const hasRetake = grades.some((g) => g.is_retake)
  return hasRetake ? grades.filter((g) => g.is_retake) : grades
}

// Average grade for a single Klausur across multiple attempts.
// Simple average since all attempts belong to the same module with identical ECTS.
export function calculateKlausurAverage(grades: Grade[]): number | null {
  const scoredGrades = getEffectiveGrades(grades)
  if (scoredGrades.length === 0) return null

  const sum = scoredGrades.reduce((acc, g) => acc + g.grade, 0)
  return Math.round((sum / scoredGrades.length) * 10) / 10
}

// Weighted average across multiple Klausuren, weighted by module.ects.
// Falls back to simple average if no ECTS are set.
export function calculateWeightedAverage(
  klausuren: Array<{ grades: Grade[]; ects?: number | null }>
): number | null {
  const klausurenWithGrades = klausuren.filter((k) => getEffectiveGrades(k.grades).length > 0)
  if (klausurenWithGrades.length === 0) return null

  const klausurenWithEcts = klausurenWithGrades.filter((k) => k.ects != null && k.ects > 0)

  if (klausurenWithEcts.length > 0) {
    let weightedSum = 0
    let totalEcts = 0
    for (const k of klausurenWithEcts) {
      const avg = calculateKlausurAverage(k.grades)
      if (avg !== null) {
        weightedSum += avg * k.ects!
        totalEcts += k.ects!
      }
    }
    if (totalEcts === 0) return null
    return Math.round((weightedSum / totalEcts) * 100) / 100
  }

  // Fallback: simple average across all effective grades
  const allGrades = klausurenWithGrades.flatMap((k) => getEffectiveGrades(k.grades))
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
    // Total ECTS: sum module.ects for klausuren where student has at least one passing attempt
    const totalEcts = kls.reduce((sum, k) => {
      if (k.ects == null) return sum
      const effective = getEffectiveAttempts(k.grades)
      const hasPassing = effective.some((g) => g.grade === 0 || g.grade <= 4.0)
      return hasPassing ? sum + k.ects : sum
    }, 0)

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

// Gruppiert Klausuren nach ihrem übergeordneten Modul (subject_id).
// Das Modul gilt als bestanden, wenn der ECTS-gewichtete Durchschnitt aller Klausuren ≤ 4.0 ist.
// Klausuren ohne subject_id werden in eine Fallback-Gruppe "Einzelne Klausuren" einsortiert.
export function groupByModul(klausuren: KlausurWithStats[], subjects: Modul[]): ModulWithKlausuren[] {
  const grouped = new Map<string, KlausurWithStats[]>()
  const standalone: KlausurWithStats[] = []

  for (const kl of klausuren) {
    if (kl.subject_id) {
      if (!grouped.has(kl.subject_id)) grouped.set(kl.subject_id, [])
      grouped.get(kl.subject_id)!.push(kl)
    } else {
      standalone.push(kl)
    }
  }

  function buildModulEntry(subject: Modul, kls: KlausurWithStats[]): ModulWithKlausuren {
    const grade = calculateWeightedAverage(kls)
    const totalEcts = kls.reduce((sum, k) => sum + (k.ects ?? 0), 0)

    let isPassed: boolean | null = null
    const klausurenWithGrades = kls.filter((k) => k.grades.length > 0)
    if (klausurenWithGrades.length > 0) {
      if (grade !== null) {
        isPassed = grade <= 4.0
      } else {
        // Alle effektiven Noten sind "Bestanden" (grade=0) → Modul bestanden
        isPassed = true
      }
    }

    const earnedEcts = isPassed === true ? totalEcts : 0

    return { ...subject, klausuren: kls, grade, totalEcts, earnedEcts, isPassed }
  }

  const result: ModulWithKlausuren[] = subjects
    .filter((s) => grouped.has(s.id))
    .map((s) => buildModulEntry(s, grouped.get(s.id)!))

  if (standalone.length > 0) {
    const fallbackSubject: Modul = {
      id: "__standalone__",
      name: "Einzelne Klausuren",
      sort_order: 9999,
      created_at: null,
    }
    result.push(buildModulEntry(fallbackSubject, standalone))
  }

  return result
}
