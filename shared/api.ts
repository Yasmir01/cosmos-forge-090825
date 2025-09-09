import React from "react";
import ZonePicker from "@/components/ZonePicker"; // uses the @ alias from vite.config

function App() {
  console.log("🚀 App mounted");
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ZonePicker />
    </div>
  );
}

export default App;
