export default function VendorProfileLoading() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-5 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-md" />
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-64 bg-muted rounded" />
            <div className="h-4 w-40 bg-muted rounded" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-full" />
        </div>
        <div className="grid grid-cols-4 gap-4 pt-2">
          {[...Array(4)]?.map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {[...Array(5)]?.map((_, i) => (
          <div key={i} className="h-9 w-32 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        {[...Array(6)]?.map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
