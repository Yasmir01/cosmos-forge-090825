import { useEffect } from "react";

export default function DebugMapboxToken() {
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    console.log("🔎 VITE_MAPBOX_TOKEN =", token);

    if (!token) {
      console.error(
        "❌ Mapbox token not found. Set VITE_MAPBOX_TOKEN in Builder.io → Settings → Environment Variables.",
      );
    } else {
      console.info("✅ Mapbox token detected!");
    }
  }, []);

  return (
    <div style={{ padding: 16, background: "#111", color: "#0f0", borderRadius: 8 }}>
      <h3 style={{ margin: 0 }}>Debug: Mapbox Token</h3>
      <p style={{ margin: 0 }}>Open browser console (F12 → Console) to see the output.</p>
    </div>
  );
}
