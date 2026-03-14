"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Grade, VALID_GRADES } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  grade: z.number(),
  date: z.string().min(1, "Datum ist erforderlich"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface GradeFormDialogProps {
  moduleId: string
  grade?: Grade
  trigger?: React.ReactElement
}

export function GradeFormDialog({ moduleId, grade, trigger }: GradeFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      grade: grade?.grade ?? 1.0,
      date: grade?.date ?? new Date().toISOString().split("T")[0],
      description: grade?.description ?? "",
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()

    if (grade) {
      await supabase
        .from("grades")
        .update({
          grade: values.grade,
          date: values.date,
          description: values.description || null,
        })
        .eq("id", grade.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from("grades").insert({
        module_id: moduleId,
        grade: values.grade,
        date: values.date,
        description: values.description || null,
        user_id: user?.id,
      })
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!grade) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from("grades").delete().eq("id", grade.id)
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const triggerEl = trigger ?? (
    <Button variant="outline" size="sm">
      {grade ? "Bearbeiten" : "Note hinzufügen"}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerEl} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{grade ? "Note bearbeiten" : "Note hinzufügen"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VALID_GRADES.map((g) => (
                        <SelectItem key={g} value={String(g)}>
                          {g.toFixed(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Datum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Klausur, Hausarbeit..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              {grade && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Löschen
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
