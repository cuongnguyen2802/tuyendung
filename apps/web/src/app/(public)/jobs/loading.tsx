function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-200" />
            <div className="h-6 w-28 rounded-full bg-gray-200" />
          </div>
        </div>
        <div className="h-7 w-28 shrink-0 rounded-full bg-gray-200" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <>
      {/* Search bar placeholder */}
      <div className="sticky top-0 z-30 h-[60px] bg-brand" />

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Header skeleton */}
        <div className="mb-4 flex animate-pulse items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-72 rounded bg-gray-200" />
            <div className="h-3.5 w-40 rounded bg-gray-200" />
          </div>
          <div className="h-9 w-44 rounded-xl bg-gray-200" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Sidebar skeleton */}
          <div className="hidden animate-pulse space-y-3 lg:block">
            {[80, 130, 110, 160, 100].map((_h, i) => (
              <div key={i} className="rounded-xl bg-white p-4">
                <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-4 rounded bg-gray-200" style={{ width: `${60 + j * 10}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Job cards */}
          <div className="space-y-3">
            <div className="mb-4 flex animate-pulse gap-2">
              {[3, 3, 3].map((_, i) => (
                <div key={i} className="h-8 w-24 rounded-lg bg-gray-200" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
