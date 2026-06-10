"use client";
import { useEffect } from "react";

type EventType = "VIEW" | "WHATSAPP_CLICK" | "CALL_CLICK" | "DIRECTIONS_CLICK" | "RESERVATION";

interface Props {
  businessId: string;
  autoTrack?: EventType;
}

export function BusinessTracker({ businessId, autoTrack }: Props) {
  useEffect(() => {
    if (autoTrack) track(businessId, autoTrack);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function track(businessId: string, type: EventType) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, type }),
  }).catch(() => {});
}
