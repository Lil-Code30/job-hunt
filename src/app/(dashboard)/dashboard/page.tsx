"use client";

import Link from "next/link";
import { useJobs } from "@/lib/hooks/useJobs";
import StatusBadge from "@/components/jobs/StatusBadge";
import type { JobStatus } from "@/types";

const STATUS_ORDER: JobStatus[] = [
  "applied",
  "phone_screen",
  "interview",
  "offer",
];

const PIPELINE_COLORS: Record<string, string> = {
  applied: "bg-blue-500",
  phone_screen: "bg-yellow-500",
  interview: "bg-orange-500",
  offer: "bg-green-500",
};

export default function DashboardPage() {
  const { jobs, allJobs, loading, stats } = useJobs();

  const recentJobs = [...allJobs]
    .sort((a, b) => b.updatedAt?.toMillis?.() - a.updatedAt?.toMillis?.())
    .slice(0, 5);

  const activeJobs = allJobs.filter(
    (j) => !["rejected", "withdrawn", "bookmarked"].includes(j.status),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Your job search at a glance
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total tracked", value: stats.total },
          { label: "Active pipeline", value: activeJobs.length },
          { label: "Response rate", value: `${stats.responseRate}%` },
          { label: "Offers", value: stats.byStatus["offer"] ?? 0 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-gray-100">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Pipeline bar */}
      {allJobs.length > 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-300">Pipeline</h2>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = stats.byStatus[status] ?? 0;
              const pct = stats.total
                ? Math.round((count / stats.total) * 100)
                : 0;
              return (
                <div key={status} className="flex items-center gap-4">
                  <span className="w-28 text-xs capitalize text-gray-400">
                    {status.replace("_", " ")}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all ${PIPELINE_COLORS[status]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-gray-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-300">
            Recent activity
          </h2>
          <Link
            href="/jobs"
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No jobs tracked yet.</p>
            <Link
              href="/jobs/new"
              className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              Add your first job
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {recentJobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {job.company} · {job.location || "Remote"}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
