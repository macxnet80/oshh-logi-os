/** Leichte Platzhalter für Streaming, wenn Seiten-/Layout-Daten noch im Flug sind. */
export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-gray-50/85 backdrop-blur-[20px] border-b border-black/6">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
        <div
          className="h-10 w-[140px] rounded-xl bg-gray-200 animate-pulse"
          aria-hidden
        />
        <div
          className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse"
          aria-hidden
        />
      </div>
    </header>
  );
}

export function MainContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy aria-label="Lädt …">
      <div className="h-10 w-2/3 max-w-md rounded-lg bg-gray-200" />
      <div className="h-4 w-full max-w-xl rounded bg-gray-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
