import { useEffect, useRef } from "react";

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

export default function MapboxTest() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    console.log("Loaded Mapbox token:", token);
    if (!token) {
      alert("⚠️ Missing VITE_MAPBOX_TOKEN");
      return;
    }

    let map: any;
    (async () => {
      ensureMapboxCss();
      await ensureMapboxScript();
      const mapboxgl: any = (window as any).mapboxgl;
      mapboxgl.accessToken = token;
      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-98.5795, 39.8283],
        zoom: 3,
      });
      map.on("load", () => alert("✅ Mapbox map loaded successfully!"));
    })();

    return () => {
      try { map?.remove(); } catch {}
    };
  }, []);

  return <div ref={containerRef} className="w-full h-[500px]" />;
}
