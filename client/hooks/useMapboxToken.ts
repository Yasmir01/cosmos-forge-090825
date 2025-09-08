import { useEffect, useState } from "react";

export function useMapboxToken() {
  const [status, setStatus] = useState<"mapbox" | "maplibre" | "missing">("maplibre");
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  useEffect(() => {
    if (!token || token.trim() === "") {
      setStatus("missing");
    } else {
      setStatus("mapbox");
    }
  }, [token]);

  return { token, status };
}
