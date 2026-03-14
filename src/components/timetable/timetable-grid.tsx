import { TimetableEntry, DAY_ORDER } from "@/types"

interface TimetableGridProps {
  entries: TimetableEntry[]
}

const SUBJECT_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-rose-100 border-rose-300 text-rose-900",
  "bg-teal-100 border-teal-300 text-teal-900",
  "bg-yellow-100 border-yellow-300 text-yellow-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
]

function getSubjectColor(subject: string): string {
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) & 0xffffffff
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

export function TimetableGrid({ entries }: TimetableGridProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 border rounded-lg text-muted-foreground">
        <p>Noch kein Stundenplan hochgeladen.</p>
      </div>
    )
  }

  // Collect all unique time slots, sorted
  const timeSlots = [...new Set(entries.map((e) => e.time_slot))].sort()

  // Filter days that actually have entries
  const activeDays = DAY_ORDER.filter((day) =>
    entries.some((e) => e.day === day)
  )

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[600px]"
        style={{
          gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)`,
        }}
      >
        {/* Header row */}
        <div className="h-10" />
        {activeDays.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-semibold border-b border-border px-2"
          >
            {day}
          </div>
        ))}

        {/* Time slot rows */}
        {timeSlots.map((slot) => (
          <>
            {/* Time label */}
            <div
              key={`time-${slot}`}
              className="flex items-start justify-end pr-3 pt-2 text-xs text-muted-foreground border-t border-border"
              style={{ minHeight: "80px" }}
            >
              {slot}
            </div>

            {/* Day cells */}
            {activeDays.map((day) => {
              const entry = entries.find(
                (e) => e.day === day && e.time_slot === slot
              )
              return (
                <div
                  key={`${day}-${slot}`}
                  className="border-t border-l border-border p-1"
                  style={{ minHeight: "80px" }}
                >
                  {entry && (
                    <div
                      className={`h-full rounded-md border p-2 text-xs ${getSubjectColor(entry.subject)}`}
                    >
                      <p className="font-semibold leading-tight">{entry.subject}</p>
                      {entry.room && (
                        <p className="mt-1 opacity-75">{entry.room}</p>
                      )}
                      {entry.lecturer && (
                        <p className="opacity-75">{entry.lecturer}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
