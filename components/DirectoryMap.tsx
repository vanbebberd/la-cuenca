"use client";
import dynamic from "next/dynamic";
import type { MapBusiness } from "./DirectoryMapInner";

const MapInner = dynamic(() => import("./DirectoryMapInner"), { ssr: false });

interface Props {
  businesses: MapBusiness[];
  centerLat?: number;
  centerLng?: number;
}

export function DirectoryMap({ businesses, centerLat, centerLng }: Props) {
  if (businesses.length === 0) return null;
  return (
    <div className="w-full h-full">
      <MapInner businesses={businesses} centerLat={centerLat} centerLng={centerLng} />
    </div>
  );
}
