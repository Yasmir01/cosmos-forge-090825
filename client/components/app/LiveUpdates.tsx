import { useEffect, useState } from "react";

export default function LiveUpdates() {
  const [last, setLast] = useState<any>(null);

  useEffect(() => {
    const SSE_URL = import.meta.env.VITE_SSE_URL || "/api/sse";
    const evtSource = new EventSource(SSE_URL);

    evtSource.onmessage = (e) => {
      try { setLast(JSON.parse(e.data)); } catch { setLast(e.data); }
      console.log("Realtime update:", e.data);
    };
    evtSource.onerror = () => {
      console.warn("SSE connection error; closing");
      evtSource.close();
    };

    return () => evtSource.close();
  }, []);

  return (
    <div className="space-y-2">
      <div>Listening for live updates...</div>
      {last && <pre className="text-xs bg-slate-50 p-2 border rounded overflow-auto">{JSON.stringify(last, null, 2)}</pre>}
    </div>
  );
}
