import { Tables } from "./database"

export type Klausur = Tables<"modules">
export type Grade = Tables<"grades">
export type Modul = Tables<"subjects">
export type Profile = Tables<"profiles">
export type Semester = Tables<"semesters">

export const STUDY_PROGRAMS = ['Wirtschaftsinformatik', 'IT-Security'] as const
export type StudyProgram = typeof STUDY_PROGRAMS[number]

export const VERTIEFUNGEN = ['Softwaretechnik', 'Verwaltung', 'Entwicklung'] as const
export type Vertiefung = typeof VERTIEFUNGEN[number]

export type GradeValue = 0 | 1.0 | 1.3 | 1.7 | 2.0 | 2.3 | 2.7 | 3.0 | 3.3 | 3.7 | 4.0 | 5.0

export const VALID_GRADES: GradeValue[] = [0, 1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 5.0]

export interface KlausurWithGrades extends Klausur {
  grades: Grade[]
}

export interface KlausurWithStats extends Klausur {
  grades: Grade[]
  average: number | null
}

export interface SemesterStats {
  semester: number
  klausuren: KlausurWithStats[]
  weightedAverage: number | null
  totalEcts: number
}
