"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
    <path d="M12 0C7.6 0 4 3.6 4 8c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="8" r="3.5" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -34],
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
        .bindPopup(`
          <div style="min-width:160px">
            <p style="font-weight:700;font-size:14px;margin:0 0 2px">${b.name}</p>
            <p style="font-size:12px;color:#6b7280;margin:0 0 6px">${b.categoryName}</p>
            <a href="/directory/${b.slug}" style="font-size:12px;color:#059669;font-weight:600;text-decoration:none">Ver local →</a>
          </div>
        `);
      markers.push(marker);
    });

    if (markers.length > 1) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden z-0" />;
}
