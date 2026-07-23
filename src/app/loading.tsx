export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-32 bg-muted rounded-md" />
          <div className="h-8 w-28 bg-muted rounded-md" />
        </div>
      </div>
      {/* Alert banner */}
      <div className="h-10 w-full bg-muted rounded-lg" />
      {/* Bento grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)]?.map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
        <div className="lg:col-span-1 h-64 bg-muted rounded-xl" />
      </div>
      {/* Compliance + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-56 bg-muted rounded-xl" />
        <div className="lg:col-span-1 h-56 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
