import MapZonePicker from "@/components/app/MapZonePicker";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b bg-white/70 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-600" />
            <span className="font-semibold tracking-tight">Zone Picker</span>
          </div>
          <nav className="text-sm text-slate-600">
            <a className="hover:text-slate-900" href="#">Estimate</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <MapZonePicker />
      </main>
    </div>
  );
}
