"use client";
import { track } from "@/components/BusinessTracker";

type EventType = "WHATSAPP_CLICK" | "CALL_CLICK" | "DIRECTIONS_CLICK";

interface Props {
  href: string;
  businessId: string;
  event: EventType;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
}

export function TrackedLink({ href, businessId, event, target, rel, className, children }: Props) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={() => track(businessId, event)}
    >
      {children}
    </a>
  );
}
