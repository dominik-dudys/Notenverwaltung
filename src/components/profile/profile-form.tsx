"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { STUDY_PROGRAMS, VERTIEFUNGEN } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  first_name: z.string().max(100).optional().or(z.literal("")),
  last_name: z.string().max(100).optional().or(z.literal("")),
  study_program: z.enum(STUDY_PROGRAMS).optional(),
  vertiefung: z.enum(VERTIEFUNGEN).optional(),
})

type FormValues = z.infer<typeof schema>

interface ProfileFormProps {
  userId: string
  initialValues: {
    first_name: string | null
    last_name: string | null
    study_program: string | null
    vertiefung: string | null
  }
}

export function ProfileForm({ userId, initialValues }: ProfileFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: initialValues.first_name ?? "",
      last_name: initialValues.last_name ?? "",
      study_program: (initialValues.study_program as typeof STUDY_PROGRAMS[number]) ?? undefined,
      vertiefung: (initialValues.vertiefung as typeof VERTIEFUNGEN[number]) ?? undefined,
    },
  })

  const studyProgramValue = watch("study_program")
  const vertiefungValue = watch("vertiefung")

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setSuccess(false)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        study_program: values.study_program ?? null,
        vertiefung: values.vertiefung ?? null,
      })
      .eq("id", userId)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">Vorname</Label>
          <Input id="first_name" {...register("first_name")} placeholder="Max" />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Nachname</Label>
          <Input id="last_name" {...register("last_name")} placeholder="Mustermann" />
          {errors.last_name && (
            <p className="text-xs text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="study_program">Studiengang</Label>
        <Select
          value={studyProgramValue ?? ""}
          onValueChange={(val) =>
            setValue("study_program", val as typeof STUDY_PROGRAMS[number])
          }
        >
          <SelectTrigger id="study_program">
            <SelectValue placeholder="Studiengang wählen" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_PROGRAMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="vertiefung">Vertiefung (ab Semester 4)</Label>
        <Select
          value={vertiefungValue ?? ""}
          onValueChange={(val) =>
            setValue("vertiefung", val as typeof VERTIEFUNGEN[number])
          }
        >
          <SelectTrigger id="vertiefung">
            <SelectValue placeholder="Vertiefung wählen" />
          </SelectTrigger>
          <SelectContent>
            {VERTIEFUNGEN.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          In der Notenübersicht werden nur Klausuren deiner Vertiefung angezeigt.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Speichern..." : "Speichern"}
        </Button>
        {success && <span className="text-sm text-green-600">Gespeichert!</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  )
}
