import { useState } from "react";

export default function AutoSyncToggle({ onChange }: { onChange?: (enabled: boolean) => void }) {
  const [enabled, setEnabled] = useState(true);

  const toggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    if (onChange) onChange(newVal);
  };

  return (
    <button
      className={`p-2 rounded text-white ${enabled ? "bg-green-500" : "bg-gray-400"}`}
      onClick={toggle}
    >
      {enabled ? "Auto-Sync: ON" : "Auto-Sync: OFF"}
    </button>
  );
}
