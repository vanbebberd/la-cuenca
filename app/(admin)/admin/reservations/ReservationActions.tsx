"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReservationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta reserva?")) return;
    setLoading(true);
    await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {status === "PENDING" && (
        <>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus("CONFIRMED")} disabled={loading} title="Confirmar">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus("CANCELLED")} disabled={loading} title="Cancelar">
            <XCircle className="h-4 w-4 text-red-400" />
          </Button>
        </>
      )}
      {status === "CONFIRMED" && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateStatus("CANCELLED")} disabled={loading} title="Cancelar">
          <XCircle className="h-4 w-4 text-red-400" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete} disabled={loading} title="Eliminar">
        <Trash2 className="h-4 w-4 text-gray-300 hover:text-red-500" />
      </Button>
    </div>
  );
}
