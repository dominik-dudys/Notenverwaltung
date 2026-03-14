import { Tables } from "./database"

export type Module = Tables<"modules">
export type Grade = Tables<"grades">
export type TimetableEntry = Tables<"timetable_entries">
export type Profile = Tables<"profiles">

export const DAY_ORDER = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"] as const
export type Day = typeof DAY_ORDER[number]

export type GradeValue = 1.0 | 1.3 | 1.7 | 2.0 | 2.3 | 2.7 | 3.0 | 3.3 | 3.7 | 4.0 | 5.0

export const VALID_GRADES: GradeValue[] = [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 5.0]

export interface ModuleWithGrades extends Module {
  grades: Grade[]
}

export interface ModuleWithStats extends Module {
  grades: Grade[]
  average: number | null
}

export interface SemesterStats {
  semester: number
  modules: ModuleWithStats[]
  weightedAverage: number | null
  totalEcts: number
}
