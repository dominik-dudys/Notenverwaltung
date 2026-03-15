"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Klausur, Modul } from "@/types"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"

const schema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  semester: z.number().int().min(1).max(12),
  subject_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface KlausurFormDialogProps {
  klausur?: Klausur
  trigger?: React.ReactElement
  isAdmin?: boolean
  module?: Modul[]
}

export function KlausurFormDialog({ klausur, trigger, isAdmin, module }: KlausurFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: klausur?.name ?? "",
      semester: klausur?.semester ?? 1,
      subject_id: klausur?.subject_id ?? undefined,
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()

    const payload = {
      name: values.name,
      semester: values.semester,
      ...(isAdmin && { subject_id: values.subject_id || null }),
    }

    if (klausur) {
      await supabase.from("modules").update(payload).eq("id", klausur.id)
    } else {
      await supabase.from("modules").insert(payload)
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const triggerEl = trigger ?? (
    <Button variant="outline" size="sm">
      {klausur ? "Bearbeiten" : "Klausur erstellen"}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerEl} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{klausur ? "Klausur bearbeiten" : "Neue Klausur"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klausurname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Statistik 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
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
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}. Semester
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isAdmin && module && module.length > 0 && (
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modul (optional)</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kein Modul" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Kein Modul</SelectItem>
                        {module.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end gap-2">
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
