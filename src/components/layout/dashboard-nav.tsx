"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard/grades", label: "Noten" },
]

interface DashboardNavProps {
  isAdmin?: boolean
}

export function DashboardNav({ isAdmin = false }: DashboardNavProps) {
  const pathname = usePathname()

  const items = isAdmin
    ? [...navItems, { href: "/dashboard/admin", label: "Admin" }]
    : navItems

  return (
    <nav className="flex gap-1">
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
