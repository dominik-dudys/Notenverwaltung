"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Semester } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const schema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SemesterFormDialogProps {
  semester?: Semester
  trigger: React.ReactElement
}

function SemesterFormDialog({ semester, trigger }: SemesterFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: semester?.name ?? "",
      start_date: semester?.start_date ?? "",
      end_date: semester?.end_date ?? "",
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()
    const payload = {
      name: values.name,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
    }
    if (semester) {
      await supabase.from("semesters").update(payload).eq("id", semester.id)
    } else {
      await supabase.from("semesters").insert(payload)
    }
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{semester ? "Semester bearbeiten" : "Neues Semester"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Wintersemester 2024/25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Startdatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enddatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function formatDateRange(start: string | null, end: string | null): string | null {
  const fmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
  if (start && end) return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`
  if (start) return `ab ${fmt.format(new Date(start))}`
  if (end) return `bis ${fmt.format(new Date(end))}`
  return null
}

interface SemesterManagementProps {
  semesters: Semester[]
}

export function SemesterManagement({ semesters }: SemesterManagementProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null)

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("semesters").delete().eq("id", id)
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <SemesterFormDialog
          trigger={<Button size="sm">+ Semester erstellen</Button>}
        />
      </div>

      {semesters.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Noch keine Semester vorhanden.
        </p>
      ) : (
        <div className="rounded-md border divide-y bg-background">
          {semesters.map((s) => {
            const dateRange = formatDateRange(s.start_date, s.end_date)
            return (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <SemesterFormDialog
                  semester={s}
                  trigger={
                    <button className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                      <span className="font-medium">{s.name}</span>
                      {dateRange && (
                        <span className="ml-2 text-sm text-muted-foreground">{dateRange}</span>
                      )}
                    </button>
                  }
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTarget(s)}
                >
                  Löschen
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open: boolean) => { if (!open) setDeleteTarget(null) }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Semester löschen?</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.name}&quot; wird unwiderruflich gelöscht.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
