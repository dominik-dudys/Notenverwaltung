"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    password: z.string().min(8, "Mindestens 8 Zeichen"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirm"],
  })

type FormValues = z.infer<typeof schema>

export function PasswordChangeForm() {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setSuccess(false)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    })

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">Neues Passwort</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="Mindestens 8 Zeichen"
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">Passwort bestätigen</Label>
        <Input
          id="confirm"
          type="password"
          {...register("confirm")}
          placeholder="Passwort wiederholen"
          autoComplete="new-password"
        />
        {errors.confirm && (
          <p className="text-xs text-destructive">{errors.confirm.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Ändern..." : "Passwort ändern"}
        </Button>
        {success && <span className="text-sm text-green-600">Passwort geändert!</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  )
}
