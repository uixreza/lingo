export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 bg-[var(--dash-sides)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--hover-bg-strong)] animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-16 rounded-full bg-[var(--hover-bg-strong)] animate-pulse" />
          </div>
          <div className="h-2.5 w-full rounded bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-2.5 w-2/3 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="w-full py-2">
      <div className="h-7 w-52 rounded bg-[var(--hover-bg-strong)] mb-6 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl bg-[var(--dash-sides)] p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-3 w-full rounded bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-24 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
        </div>
        <div className="rounded-2xl bg-[var(--dash-sides)] p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-3 w-full rounded bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
          <div className="h-24 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
        </div>
      </div>
      <div className="rounded-2xl bg-[var(--dash-sides)] p-6 space-y-4">
        <div className="h-5 w-44 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
        <div className="h-3 w-full rounded bg-[var(--hover-bg-strong)] animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-[var(--hover-bg-strong)] animate-pulse" />
        <div className="h-10 rounded-xl bg-[var(--hover-bg-strong)] animate-pulse" />
      </div>
    </div>
  );
}
