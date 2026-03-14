"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"

interface Profile {
  id: string
  email: string
  role: string
}

interface UserManagementProps {
  profiles: Profile[]
  currentUserId: string
}

export function UserManagement({ profiles, currentUserId }: UserManagementProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState<Record<string, boolean>>({})

  async function handleRoleChange(userId: string, newRole: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      startTransition(() => router.refresh())
    }
  }

  async function handleDelete(userId: string) {
    setDeletingId(userId)
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
    setDeletingId(null)
    if (res.ok) {
      setDialogOpen((prev) => ({ ...prev, [userId]: false }))
      startTransition(() => router.refresh())
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left px-4 py-2 font-medium">E-Mail</th>
            <th className="text-left px-4 py-2 font-medium">Rolle</th>
            <th className="text-left px-4 py-2 font-medium">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => {
            const isSelf = profile.id === currentUserId
            return (
              <tr key={profile.id} className="border-t">
                <td className="px-4 py-2">{profile.email}</td>
                <td className="px-4 py-2">
                  <Select
                    defaultValue={profile.role}
                    disabled={isSelf || isPending}
                    onValueChange={(value) => value && handleRoleChange(profile.id!, value)}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">student</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2">
                  <Dialog
                    open={dialogOpen[profile.id] ?? false}
                    onOpenChange={(open) =>
                      setDialogOpen((prev) => ({ ...prev, [profile.id]: open }))
                    }
                  >
                    <DialogTrigger
                      render={
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isSelf}
                        />
                      }
                    >
                      Löschen
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nutzer löschen?</DialogTitle>
                        <DialogDescription>
                          Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten
                          von <strong>{profile.email}</strong> werden unwiderruflich
                          gelöscht.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                          Abbrechen
                        </DialogClose>
                        <Button
                          variant="destructive"
                          disabled={deletingId === profile.id}
                          onClick={() => handleDelete(profile.id)}
                        >
                          {deletingId === profile.id ? "Wird gelöscht…" : "Endgültig löschen"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
