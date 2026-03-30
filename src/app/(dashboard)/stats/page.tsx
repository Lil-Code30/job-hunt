"use client";

import { useJobs } from "@/lib/hooks/useJobs";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const STATUS_LABELS: Record<string, string> = {
  bookmarked: "Bookmarked",
  applied: "Applied",
  phone_screen: "Phone Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const COLORS = [
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#eab308", // yellow
  "#f97316", // orange
  "#22c55e", // green
  "#ef4444", // red
  "#6b7280", // gray
];

export default function StatsPage() {
  const { jobs, stats, loading } = useJobs();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  const chartData = Object.entries(stats.byStatus).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
  }));

  const sourceData = jobs.reduce<Record<string, number>>((acc, job) => {
    acc[job.source] = (acc[job.source] || 0) + 1;
    return acc;
  }, {});

  const sourceChartData = Object.entries(sourceData).map(([source, count]) => ({
    name: source,
    value: count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Stats</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Total Jobs</p>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Applied</p>
          <p className="text-3xl font-semibold">{stats.byStatus.applied || 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Interviews</p>
          <p className="text-3xl font-semibold">{stats.byStatus.interview || 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm text-zinc-400">Response Rate</p>
          <p className="text-3xl font-semibold">{stats.responseRate}%</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold mb-4">Jobs by Status</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-zinc-500 py-12">No data yet</p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold mb-4">Jobs by Source</h2>
          {sourceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sourceChartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                <Bar dataKey="value" fill="#5E6AD2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-zinc-500 py-12">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
