function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-800 ${className ?? ""}`}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 space-y-2">
      <Bone className="h-4 w-3/4" />
      <Bone className="h-3 w-1/2" />
      <div className="flex gap-1 pt-1">
        <Bone className="h-5 w-14 rounded-full" />
        <Bone className="h-5 w-10 rounded-full" />
      </div>
    </div>
  );
}

export function JobRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          <Bone className="h-3.5 w-40" />
          <Bone className="h-3 w-24" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Bone className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex gap-1">
          <Bone className="h-5 w-14 rounded-full" />
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <Bone className="h-3 w-16" />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <Bone className="h-3 w-20" />
      </td>
      <td className="px-4 py-3">
        <Bone className="h-7 w-12 ml-auto rounded-lg" />
      </td>
    </tr>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Bone className="h-7 w-40" />
        <Bone className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3"
          >
            <Bone className="h-3 w-24" />
            <Bone className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <Bone className="h-4 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Bone className="h-3 w-28" />
            <Bone className="h-2 flex-1 rounded-full" />
            <Bone className="h-3 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3"
          >
            <Bone className="h-3 w-24" />
            <Bone className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <Bone className="h-4 w-28 mb-4" />
        <Bone className="h-[220px] w-full rounded-xl" />
      </div>
    </div>
  );
}
