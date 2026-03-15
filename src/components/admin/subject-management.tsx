"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createClient } from "@/lib/supabase/client"
import { Modul } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const schema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
})

type FormValues = z.infer<typeof schema>

interface ModulFormDialogProps {
  modul?: Modul
  trigger: React.ReactElement
}

function ModulFormDialog({ modul, trigger }: ModulFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: modul?.name ?? "" },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const supabase = createClient()
    if (modul) {
      await supabase.from("subjects").update({ name: values.name }).eq("id", modul.id)
    } else {
      await supabase.from("subjects").insert({ name: values.name })
    }
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modul ? "Modul bearbeiten" : "Neues Modul"}</DialogTitle>
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
                    <Input placeholder="z.B. Mathe 3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

interface SortableItemProps {
  modul: Modul
  onDelete: (modul: Modul) => void
}

function SortableItem({ modul, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: modul.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          aria-label="Reihenfolge ändern"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <span className="font-medium">{modul.name}</span>
      </div>
      <div className="flex gap-2">
        <ModulFormDialog
          modul={modul}
          trigger={<Button variant="outline" size="sm">Bearbeiten</Button>}
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(modul)}
        >
          Löschen
        </Button>
      </div>
    </div>
  )
}

interface ModulManagementProps {
  module: Modul[]
}

export function ModulManagement({ module }: ModulManagementProps) {
  const router = useRouter()
  const [items, setItems] = useState<Modul[]>(module)
  const [deleteTarget, setDeleteTarget] = useState<Modul | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((m) => m.id === active.id)
    const newIndex = items.findIndex((m) => m.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    const supabase = createClient()
    await Promise.all(
      newItems.map((m, index) =>
        supabase.from("subjects").update({ sort_order: index }).eq("id", m.id)
      )
    )
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from("subjects").delete().eq("id", id)
    setItems((prev) => prev.filter((m) => m.id !== id))
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <ModulFormDialog
          trigger={<Button size="sm">+ Modul erstellen</Button>}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Noch keine Module vorhanden. Module gruppieren Klausuren über mehrere Semester (z.B. &quot;Mathe 3&quot; → Statistik 1 + 2).
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="rounded-md border divide-y bg-background">
              {items.map((m) => (
                <SortableItem key={m.id} modul={m} onDelete={setDeleteTarget} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modul löschen?</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.name}&quot; wird gelöscht. Verknüpfte Klausuren behalten ihre Noten,
              verlieren aber die Modul-Zuordnung.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Abbrechen</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
