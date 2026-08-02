export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar placeholder */}
      <div className="sticky top-0 z-30 h-[60px] bg-brand" />
      {/* Breadcrumb placeholder */}
      <div className="h-10 border-b border-gray-200 bg-white" />

      <div className="mx-auto max-w-6xl animate-pulse px-4 py-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-4">
            {/* Header card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-6 w-3/4 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-full bg-gray-200" />
                    <div className="h-3.5 w-16 rounded bg-gray-200" />
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <div className="h-12 flex-1 rounded-xl bg-gray-200" />
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
              </div>
            </div>

            {/* Detail card */}
            <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex justify-between border-b border-gray-100 pb-4">
                <div className="h-6 w-48 rounded bg-gray-200" />
                <div className="h-8 w-40 rounded-lg bg-gray-200" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-36 rounded bg-gray-200" />
                  <div className="h-3.5 rounded bg-gray-200" />
                  <div className="h-3.5 w-5/6 rounded bg-gray-200" />
                  <div className="h-3.5 w-4/6 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mx-auto mb-4 h-20 w-20 rounded-xl bg-gray-200" />
              <div className="mx-auto mb-4 h-5 w-40 rounded bg-gray-200" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 py-2.5">
                  <div className="h-7 w-7 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-16 rounded bg-gray-200" />
                    <div className="h-4 w-28 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
              <div className="mt-4 h-10 rounded-xl bg-gray-200" />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-1">
              <div className="mb-3 h-5 w-32 rounded bg-gray-200" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 py-2.5">
                  <div className="h-7 w-7 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-20 rounded bg-gray-200" />
                    <div className="h-4 w-32 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
