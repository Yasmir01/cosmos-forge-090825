export default function ZonePicker() {
  const mapContainer = useRef<HTMLDivElement>(null);

  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "red" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
