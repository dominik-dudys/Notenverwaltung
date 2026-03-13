"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Module } from "@/types"
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
  name: z.string().min(1, "Name ist erforderlich"),
  ects: z.number().int().min(1).max(30),
  semester: z.number().int().min(1).max(12),
})

type FormValues = z.infer<typeof schema>

interface ModuleFormDialogProps {
  module?: Module
  trigger?: React.ReactElement
}

export function ModuleFormDialog({ module, trigger }: ModuleFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: module?.name ?? "",
      ects: module?.ects ?? 5,
      semester: module?.semester ?? 1,
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (module) {
      await supabase
        .from("modules")
        .update({ name: values.name, ects: values.ects, semester: values.semester })
        .eq("id", module.id)
    } else {
      await supabase.from("modules").insert({
        name: values.name,
        ects: values.ects,
        semester: values.semester,
        user_id: user.id,
      })
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const triggerEl = trigger ?? (
    <Button variant="outline" size="sm">
      {module ? "Bearbeiten" : "Modul erstellen"}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerEl} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? "Modul bearbeiten" : "Neues Modul"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modulname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Mathematik 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
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
            </div>
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
