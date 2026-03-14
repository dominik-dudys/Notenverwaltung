"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"

interface ProfileData {
  role: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

interface UserMenuProps {
  user: User
  profile: ProfileData
}

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName[0].toUpperCase()
  return email[0].toUpperCase()
}

export function UserMenu({ user, profile }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = getInitials(profile.first_name, profile.last_name, user.email ?? "?")
  const displayName =
    profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user.email ?? ""

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-muted hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Benutzermenü"
        aria-expanded={open}
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-md border bg-popover shadow-md z-50">
          <div className="px-3 py-2.5 border-b">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <span className="inline-block text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize mt-0.5">
              {profile.role}
            </span>
          </div>
          <div className="py-1">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start">
              <Link href="/dashboard/profile" onClick={() => setOpen(false)}>Profil</Link>
            </Button>
            <hr className="my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Abmelden
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
