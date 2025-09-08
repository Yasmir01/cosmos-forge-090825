import { useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";
import { useMapboxToken } from "@/hooks/useMapboxToken";

// Use global mapboxgl + MapboxDraw provided by CDN
declare const mapboxgl: any;
declare const MapboxDraw: any;

export default function MapZonePicker() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const { token, status } = useMapboxToken();

  const [area, setArea] = useState<number>(0);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "missing") return;
    if (!containerRef.current || mapRef.current) return;

    try {
      if (!mapboxgl) throw new Error("mapboxgl is not available on window");
    } catch (e: any) {
      setMapError(e?.message || String(e));
      return;
    }

    try {
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-98.5795, 39.8283],
        zoom: 3,
        doubleClickZoom: false,
        dragRotate: false,
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add Mapbox Draw controls (polygon + trash)
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
      });
      map.addControl(draw);

      map.on("error", (e: any) => {
        console.error("Mapbox error:", e?.error || e);
      });

      const updateArea = () => {
        try {
          const data = draw.getAll();
          if (data.features.length > 0) {
            const turfAny: any = (window as any)["turf"];
            const m2 = turfAny?.area ? turfAny.area(data) : 0;
            const ft2 = m2 * 10.7639;
            setArea(Number(ft2.toFixed(2)));
          } else {
            setArea(0);
          }
        } catch {
          setArea(0);
        }
      };

      map.on("draw.create", updateArea);
      map.on("draw.update", updateArea);
      map.on("draw.delete", () => setArea(0));

      map.on("error", (e: any) => {
        setMapError(String(e?.error || "Unknown map error"));
      });

      mapRef.current = map;

      return () => {
        map.off("draw.create", updateArea);
        map.off("draw.update", updateArea);
        map.off("draw.delete", () => setArea(0));
        try { map.remove(); } catch {}
        mapRef.current = null;
      };
    } catch (e: any) {
      setMapError(e?.message || String(e));
    }
  }, [status, token]);

  // (Draw handles sources; no manual sync needed now)

  if (status === "missing") {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg m-4">
        <strong>⚠️ Mapbox Token Missing</strong>
        <p className="mt-2">
          No <code>VITE_MAPBOX_TOKEN</code> found. Please add it in <em>Builder Settings → Environment</em>, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div ref={containerRef} className="w-full h-[calc(100vh-6rem)]" />
      <div className="mt-2 text-center font-semibold">
        {area > 0 ? `🖌 Selected area: ${area.toLocaleString()} ft²` : "Draw a polygon to measure paint area"}
      </div>
    </div>
  );
}
