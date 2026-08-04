/** Ürün listesi yüklenirken gösterilen iskelet */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-main">
        <div className="h-8 w-48 bg-gray-200 rounded-lg skeleton mb-6" />

        <div className="flex gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-28 bg-gray-200 rounded-full skeleton" />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-100 skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded skeleton" />
                <div className="h-4 w-full bg-gray-200 rounded skeleton" />
                <div className="h-4 w-2/3 bg-gray-200 rounded skeleton" />
                <div className="h-9 w-full bg-gray-200 rounded-xl skeleton mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
