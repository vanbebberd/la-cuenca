"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, CheckCircle, XCircle, Trash2 } from "lucide-react";
import Link from "next/link";

export function BusinessActions({ id, slug, status }: { id: string; slug: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const action = status === "ACTIVE" ? "deactivate" : "activate";
    await fetch(`/api/admin/businesses/${id}/${action}`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este local? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/directory/${slug}`} target="_blank">
        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
      </Link>
      <Link href={`/admin/businesses/${id}/edit`}>
        <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
      </Link>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle} disabled={loading}>
        {status === "ACTIVE"
          ? <XCircle className="h-4 w-4 text-red-400" />
          : <CheckCircle className="h-4 w-4 text-emerald-400" />}
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete} disabled={loading}>
        <Trash2 className="h-4 w-4 text-gray-300 hover:text-red-500" />
      </Button>
    </div>
  );
}
