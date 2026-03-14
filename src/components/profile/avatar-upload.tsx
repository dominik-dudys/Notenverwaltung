"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  initials: string
}

export function AvatarUpload({ userId, avatarUrl, initials }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Nur Bilder erlaubt.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Datei zu groß (max. 2 MB).")
      return
    }

    setError(null)
    setUploading(true)

    try {
      const supabase = createClient()
      const path = `${userId}/avatar`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId)

      if (updateError) throw updateError

      setPreview(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-24 h-24 rounded-full overflow-hidden bg-muted hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        aria-label="Avatar hochladen"
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-2xl font-semibold text-muted-foreground">
            {initials}
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-xs">...</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs text-muted-foreground">Klicken zum Ändern (max. 2 MB)</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
