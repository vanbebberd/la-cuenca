"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export function EventActions({ id, slug }: { id: string; slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este evento? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/events/${slug}`} target="_blank">
        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
      </Link>
      <Link href={`/admin/events/${id}/edit`}>
        <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
      </Link>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete} disabled={loading}>
        <Trash2 className="h-4 w-4 text-gray-300 hover:text-red-500" />
      </Button>
    </div>
  );
}
