import React, { useEffect, useRef } from "react";

export default function ZonePicker() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("🗺️ ZonePicker mounted");
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", background: "red" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

