import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geometryutil";

export default function SatelliteMeasure() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

    const container = ref.current!;
    const map = L.map(container, {
      center: [37.7749, -122.4194],
      zoom: 18,
      layers: [
        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN ?? ""}`,
          { attribution: "© Mapbox © OpenStreetMap", tileSize: 512, zoomOffset: -1 }
        ),
      ],
    });

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new (L as any).Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: { polygon: true, rectangle: true },
    });
    map.addControl(drawControl);

    const onCreated = (event: any) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);
      try {
        const latlngs = layer.getLatLngs()[0];
        const areaM2 = (L as any).GeometryUtil.geodesicArea(latlngs);
        alert(`Area: ${(areaM2 * 10.7639).toFixed(2)} sq ft`);
      } catch {}
    };

    map.on((L as any).Draw.Event.CREATED, onCreated);

    return () => {
      try { map.off((L as any).Draw.Event.CREATED, onCreated); } catch {}
      try { map.remove(); } catch {}
    };
  }, []);

  return <div ref={ref} style={{ height: "500px", width: "100%" }} />;
}
