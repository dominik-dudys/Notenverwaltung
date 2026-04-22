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
  ects: z.number().int().min(1).max(30).optional(),
  is_retake: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface GradeFormDialogProps {
  moduleId: string
  grade?: Grade
  trigger?: React.ReactElement
  isAdmin?: boolean
}

export function GradeFormDialog({ moduleId, grade, trigger, isAdmin }: GradeFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      grade: grade?.grade ?? 1.0,
      date: grade?.date ?? new Date().toISOString().split("T")[0],
      description: grade?.description ?? "",
      ects: grade?.ects ?? undefined,
      is_retake: grade?.is_retake ?? false,
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
          is_retake: values.is_retake,
          ...(isAdmin && values.ects != null && { ects: values.ects }),
        })
        .eq("id", grade.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from("grades").insert({
        module_id: moduleId,
        grade: values.grade,
        date: values.date,
        description: values.description || null,
        is_retake: values.is_retake,
        user_id: user?.id,
        ...(isAdmin && values.ects != null && { ects: values.ects }),
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
                          {g === 0 ? "BE" : g.toFixed(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={isAdmin ? "grid grid-cols-2 gap-4" : ""}>
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
              {isAdmin && (
                <FormField
                  control={form.control}
                  name="ects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ECTS</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Hausarbeit, Mündliche Prüfung..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_retake"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="is_retake"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel htmlFor="is_retake" className="font-normal cursor-pointer">
                    Nachschreibklausur
                  </FormLabel>
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
