import { useCallback, useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import AutoSyncToggle from "@/components/app/AutoSyncToggle";

const MAPLIBRE_STYLE = "https://demotiles.maplibre.org/style.json";
const MAPBOX_STYLE = "mapbox://styles/mapbox/satellite-streets-v11";
/* token via hook */

function ensureMapLibreCss() {
  const id = "maplibre-gl-css";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.css";
    document.head.appendChild(link);
  }
}

function ensureMapLibreScript(): Promise<void> {
  const id = "maplibre-gl-js";
  return new Promise((resolve, reject) => {
    if ((window as any).maplibregl) return resolve();
    if (document.getElementById(id)) {
      (document.getElementById(id) as HTMLScriptElement).addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MapLibre script"));
    document.head.appendChild(script);
  });
}

function ensureMapboxCss() {
  const id = "mapbox-gl-css";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v2.16.1/mapbox-gl.css";
    document.head.appendChild(link);
  }
}

function ensureMapboxScript(): Promise<void> {
  const id = "mapbox-gl-js";
  return new Promise((resolve, reject) => {
    if ((window as any).mapboxgl) return resolve();
    if (document.getElementById(id)) {
      (document.getElementById(id) as HTMLScriptElement).addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://api.mapbox.com/mapbox-gl-js/v2.16.1/mapbox-gl.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Mapbox script"));
    document.head.appendChild(script);
  });
}

export default function ZonePicker() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const [points, setPoints] = useState<number[][]>([]);
  const [polygon, setPolygon] = useState<any>(null);
  const [area, setArea] = useState<number>(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { token, status } = useMapboxToken();
  const [engine, setEngine] = useState<'mapbox' | 'maplibre'>(status === 'mapbox' ? 'mapbox' : 'maplibre');

  if (status === "missing") {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg m-4">
        <strong>⚠️ Mapbox Token Missing</strong>
        <p className="mt-2">
          No <code>VITE_MAPBOX_TOKEN</code> found.
          Please add it in <em>Builder Settings → Environment</em>, then refresh.
        </p>
      </div>
    );
  }

  // Initialize map
  useEffect(() => {
    let cancelled = false;
    if (token) {
      ensureMapboxCss();
      console.log("Loaded token:", token);
    }

    (async () => {
      if (!mapContainer.current || mapRef.current) return;

      let map: any;
      let lib: any;

      try {
        await ensureMapboxScript();
        if (cancelled) return;
        const mapboxgl: any = (window as any).mapboxgl;
        mapboxgl.accessToken = token;
        lib = mapboxgl;
        map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: MAPBOX_STYLE,
          center: [-122.423057, 37.77845],
          zoom: 14,
          doubleClickZoom: false,
          dragRotate: false,
        });
        setEngine("mapbox");
      } catch (e: any) {
        // Fallback to MapLibre
        try {
          ensureMapLibreCss();
          await ensureMapLibreScript();
          if (cancelled) return;
          const maplibregl: any = (window as any).maplibregl;
          lib = maplibregl;
          map = new maplibregl.Map({
            container: mapContainer.current!,
            style: MAPLIBRE_STYLE,
            center: [-122.423057, 37.77845],
            zoom: 14,
            doubleClickZoom: false,
            dragRotate: false,
          });
          setEngine("maplibre");
          setMapError(null);
        } catch (fallbackErr: any) {
          setMapError(String(fallbackErr?.message || fallbackErr || "Map init error"));
          return;
        }
      }

      mapRef.current = map;

      try { map.addControl(new lib.NavigationControl({ visualizePitch: true }), "top-right"); } catch {}

      map.on("styledata", () => { try { map.resize(); } catch {} });

      map.on("load", () => {
        setMapReady(true);
        try { map.resize(); } catch {}
        setTimeout(() => { try { map.resize(); } catch {} }, 100);

        if (!map.getSource("points")) {
          map.addSource("points", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "points-layer",
            type: "circle",
            source: "points",
            paint: {
              "circle-radius": 4,
              "circle-color": "#ffffff",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#0066FF",
            },
          });
        }

        if (!map.getSource("poly")) {
          map.addSource("poly", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "poly-fill",
            type: "fill",
            source: "poly",
            paint: { "fill-color": "#0066FF", "fill-opacity": 0.35 },
          });
          map.addLayer({
            id: "poly-outline",
            type: "line",
            source: "poly",
            paint: { "line-color": "#0033AA", "line-width": 2 },
          });
        }
      });

      map.on("error", async (e: any) => {
        const msg = String(e?.error || "Unknown map error");
        setMapError(msg);
        if (msg.includes("Invalid Token") || msg.includes("401") || msg.toLowerCase().includes("not authorized")) {
          try { mapRef.current?.remove(); } catch {}
          try {
            ensureMapLibreCss();
            await ensureMapLibreScript();
            const maplibregl: any = (window as any).maplibregl;
            const fallback = new maplibregl.Map({
              container: mapContainer.current!,
              style: MAPLIBRE_STYLE,
              center: [-122.423057, 37.77845],
              zoom: 14,
              doubleClickZoom: false,
              dragRotate: false,
            });
            mapRef.current = fallback;
            try { fallback.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right"); } catch {}
            fallback.on("styledata", () => { try { fallback.resize(); } catch {} });
            fallback.on("load", () => {
              setEngine("maplibre");
              setMapReady(true);
              setMapError(null);
              try { fallback.resize(); } catch {}
              setTimeout(() => { try { fallback.resize(); } catch {} }, 100);
              if (!fallback.getSource("points")) {
                fallback.addSource("points", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
                fallback.addLayer({ id: "points-layer", type: "circle", source: "points", paint: { "circle-radius": 4, "circle-color": "#ffffff", "circle-stroke-width": 2, "circle-stroke-color": "#0066FF" } });
              }
              if (!fallback.getSource("poly")) {
                fallback.addSource("poly", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
                fallback.addLayer({ id: "poly-fill", type: "fill", source: "poly", paint: { "fill-color": "#0066FF", "fill-opacity": 0.35 } });
                fallback.addLayer({ id: "poly-outline", type: "line", source: "poly", paint: { "line-color": "#0033AA", "line-width": 2 } });
              }
            });
          } catch {}
        }
      });

      map.on("click", (e: any) => {
        const { lng, lat } = e.lngLat || {};
        if (typeof lng !== "number" || typeof lat !== "number") return;
        const newPoints = [...pointsRef.current, [lng, lat]];
        setPoints(newPoints);

        if (newPoints.length > 2) {
          const ring = [...newPoints, newPoints[0]];
          const poly = turf.polygon([ring]);
          setPolygon(poly);
          setArea(turf.area(poly));
        }
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          // remove listeners if possible
          try { mapRef.current.off && mapRef.current.off(); } catch {}
          mapRef.current.remove();
        } catch (err: any) {
          // Ignore AbortError from Mapbox internal fetch cancellation
          if (err && err.name === 'AbortError') {
            console.debug('Ignored Mapbox AbortError during remove');
          } else {
            console.debug('Map remove error:', err);
          }
        } finally {
          mapRef.current = null;
        }
      }
    };
  }, [status, token]);

  // Keep a ref of points for event handler closure
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // Update sources on state change
  useEffect(() => {
    const map = mapRef.current as any;
    if (!map || !map.isStyleLoaded?.()) return;

    const pointsGeoJSON = {
      type: "FeatureCollection",
      features: points.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: p },
        properties: {},
      })),
    } as any;

    const polyGeoJSON = (polygon as any) ?? { type: "FeatureCollection", features: [] };

    const ps = map.getSource("points");
    if (ps) ps.setData(pointsGeoJSON);

    const pg = map.getSource("poly");
    if (pg) pg.setData(polyGeoJSON);
  }, [points, polygon]);

  const [autoSync, setAutoSync] = useState(true);

  const handleClear = useCallback(() => {
    setPoints([]);
    setPolygon(null);
    setArea(0);
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative">
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        <div
          className={`px-3 py-1 text-sm rounded-md shadow-md ${
            engine === "mapbox"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-yellow-100 text-yellow-700 border border-yellow-300"
          }`}
        >
          {engine === "mapbox" ? "Using Mapbox tiles" : "Using MapLibre tiles"}
        </div>
        <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-3 py-2 rounded-md flex flex-wrap gap-2 items-center">
          <AutoSyncToggle onChange={setAutoSync} />
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div ref={mapContainer} className="w-full h-full bg-slate-100" />

      {!mapReady && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-3 py-2 rounded-md text-sm z-10">
          Map loading...
        </div>
      )}
      {mapError && (
        <div className="absolute bottom-3 left-3 bg-red-50 border border-red-200 text-red-800 shadow-sm px-3 py-2 rounded-md text-sm z-10">
          Map error: {mapError}
        </div>
      )}
      {polygon && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-3 py-2 rounded-md text-sm z-10">
          Area: {(area / 0.092903).toFixed(2)} sq ft
        </div>
      )}
    </div>
  );
}
