"use client";

import { useJobs } from "@/lib/hooks/useJobs";
import StatsPage from "@/components/jobs/StatsPage";

export default function StatsRoute() {
  const { allJobs, loading } = useJobs();

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-violet-500" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Stats</h1>
        <p className="mt-1 text-sm text-gray-400">Your search by the numbers</p>
      </div>
      <StatsPage jobs={allJobs} />
    </div>
  );
}
