"use client";
import { useEffect, useRef } from "react";

export interface MapBusiness {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  categoryName: string;
  categoryColor: string;
}

interface Props {
  businesses: MapBusiness[];
  centerLat?: number;
  centerLng?: number;
}

export default function DirectoryMapInner({ businesses, centerLat, centerLng }: Props) {
  const mapRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css" as string);

      if (!containerRef.current || mapRef.current) return;

      const lat = centerLat ?? (businesses[0]?.lat ?? -41.47);
      const lng = centerLng ?? (businesses[0]?.lng ?? -72.93);

      const map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lng], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const markers: ReturnType<typeof L.marker>[] = [];

      businesses.forEach((b) => {
        const icon = L.divIcon({
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${b.categoryColor || "#10b981"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
          className: "",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([b.lat, b.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:150px;font-family:system-ui,sans-serif;padding:4px 0">
              <p style="font-weight:700;font-size:13px;margin:0 0 3px 0;color:#111">${b.name}</p>
              <p style="font-size:11px;color:#6b7280;margin:0 0 8px 0">${b.categoryName}</p>
              <a href="/directory/${b.slug}" style="font-size:12px;color:#059669;font-weight:600;text-decoration:none">Ver local →</a>
            </div>`
          );
        markers.push(marker);
      });

      if (markers.length === 1) {
        map.setView([businesses[0].lat, businesses[0].lng], 15);
      } else if (markers.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      }

      setTimeout(() => map.invalidateSize(), 100);
    }

    init();

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
