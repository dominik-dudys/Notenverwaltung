"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard/admin/semester", label: "Semester" },
  { href: "/dashboard/admin/klausuren", label: "Klausuren" },
  { href: "/dashboard/admin/benutzerverwaltung", label: "Benutzerverwaltung" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 border-b pb-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname.startsWith(item.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
