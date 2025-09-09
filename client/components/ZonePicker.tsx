export default function ZonePicker() {
  console.log("✅ ZonePicker mounted"); // <--- put it here

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
  console.log("🎯 useEffect ran");
  // 🚧 Temporarily disable map setup
  // map.current = new mapboxgl.Map({
  //   container: mapContainer.current,
  //   style: "mapbox://styles/mapbox/streets-v11",
  //   center: [-74.5, 40],
  //   zoom: 9,
  // });
}, []);
