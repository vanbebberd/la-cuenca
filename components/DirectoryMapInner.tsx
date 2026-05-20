"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";

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

function makeIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

export default function DirectoryMapInner({ businesses, centerLat, centerLng }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const lat = centerLat ?? (businesses[0]?.lat ?? -41.47);
    const lng = centerLng ?? (businesses[0]?.lng ?? -72.93);

    const map = L.map(containerRef.current, { zoomControl: true }).setView([lat, lng], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const markers: L.Marker[] = [];
    businesses.forEach((b) => {
      const marker = L.marker([b.lat, b.lng], { icon: makeIcon(b.categoryColor || "#10b981") })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:150px;font-family:sans-serif">
            <p style="font-weight:700;font-size:13px;margin:0 0 2px 0;color:#111">${b.name}</p>
            <p style="font-size:11px;color:#6b7280;margin:0 0 6px 0">${b.categoryName}</p>
            <a href="/directory/${b.slug}" style="font-size:12px;color:#059669;font-weight:600;text-decoration:none">Ver local →</a>
          </div>`
        );
      markers.push(marker);
    });

    if (markers.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
