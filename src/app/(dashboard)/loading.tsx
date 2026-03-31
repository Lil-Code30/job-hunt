import { DashboardSkeleton } from "@/components/shared/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <DashboardSkeleton />
    </div>
  );
}
