"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Job, JobStatus } from "@/types";

const STATUS_ORDER: JobStatus[] = [
  "applied",
  "phone_screen",
  "interview",
  "offer",
];

const STATUS_COLORS: Record<string, string> = {
  bookmarked: "#7C3AED",
  applied: "#3B82F6",
  phone_screen: "#F59E0B",
  interview: "#F97316",
  offer: "#10B981",
  rejected: "#EF4444",
  withdrawn: "#6B7280",
};

type Props = { jobs: Job[] };

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-gray-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

// Custom funnel built from horizontal bars that shrink — no recharts FunnelChart needed
function PipelineFunnel({ jobs }: { jobs: Job[] }) {
  const stages = STATUS_ORDER.map((s) => ({
    status: s,
    label: s.replace("_", " "),
    count: jobs.filter(
      (j) => j.status === s || (s === "offer" && j.status === "offer"),
    ).length,
    color: STATUS_COLORS[s],
  }));

  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const pct = Math.round((stage.count / max) * 100);
        const dropPct =
          i > 0
            ? stages[i - 1].count > 0
              ? Math.round((1 - stage.count / stages[i - 1].count) * 100)
              : null
            : null;

        return (
          <div key={stage.status} className="space-y-1">
            {dropPct !== null && dropPct > 0 && (
              <p className="text-center text-xs text-gray-600">
                ↓ {dropPct}% drop-off
              </p>
            )}
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs capitalize text-gray-400">
                {stage.label}
              </span>
              <div className="flex-1">
                <div
                  className="flex items-center justify-center rounded-md py-1.5 text-xs font-medium text-white transition-all"
                  style={{
                    width: `${Math.max(pct, 8)}%`,
                    background: stage.color,
                    minWidth: stage.count > 0 ? "2rem" : "0",
                  }}
                >
                  {stage.count > 0 ? stage.count : ""}
                </div>
              </div>
              <span className="w-6 text-right text-xs text-gray-500">
                {stage.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsPage({ jobs }: Props) {
  const total = jobs.length;
  const applied = jobs.filter((j) => j.status !== "bookmarked").length;
  const interviews = jobs.filter((j) =>
    ["interview", "offer"].includes(j.status),
  ).length;
  const offers = jobs.filter((j) => j.status === "offer").length;
  const responseRate = applied ? Math.round((interviews / applied) * 100) : 0;

  // Bar chart data: jobs by status
  const byStatus = Object.entries(
    jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([status, count]) => ({
      name: status.replace("_", " "),
      count,
      color: STATUS_COLORS[status] ?? "#6B7280",
    }))
    .sort((a, b) => {
      const order = [
        "bookmarked",
        "applied",
        "phone_screen",
        "interview",
        "offer",
        "rejected",
        "withdrawn",
      ];
      return (
        order.indexOf(a.name.replace(" ", "_")) -
        order.indexOf(b.name.replace(" ", "_"))
      );
    });

  // Source breakdown
  const bySource = Object.entries(
    jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.source] = (acc[j.source] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Top tags
  const tagCounts = jobs
    .flatMap((j) => j.tags)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Salary stats
  const salaryJobs = jobs.filter((j) => j.salary?.min && j.salary?.max);
  const avgMid = salaryJobs.length
    ? Math.round(
        salaryJobs.reduce(
          (sum, j) => sum + (j.salary!.min + j.salary!.max) / 2,
          0,
        ) / salaryJobs.length,
      )
    : null;

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs shadow-xl">
        <p className="capitalize text-gray-300">{payload[0].payload.name}</p>
        <p className="font-semibold text-white">
          {payload[0].value} job{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center">
        <p className="text-gray-400">
          No data yet — start adding jobs to see your stats.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total tracked" value={total} />
        <StatCard label="Applied" value={applied} />
        <StatCard
          label="Response rate"
          value={`${responseRate}%`}
          sub="applied → interview"
        />
        <StatCard
          label="Offers"
          value={offers}
          sub={
            applied
              ? `${Math.round((offers / applied) * 100)}% of applied`
              : "—"
          }
        />
      </div>

      {avgMid && (
        <StatCard
          label="Avg. salary midpoint"
          value={`$${avgMid.toLocaleString()}`}
          sub={`across ${salaryJobs.length} job${salaryJobs.length !== 1 ? "s" : ""} with salary data`}
        />
      )}

      {/* Status bar chart */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-5 text-sm font-semibold text-gray-300">
          Jobs by status
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={byStatus}
            barSize={28}
            margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(139,92,246,0.06)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {byStatus.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Pipeline funnel */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-5 text-sm font-semibold text-gray-300">
            Pipeline funnel
          </h2>
          <PipelineFunnel jobs={jobs} />
        </div>

        {/* Source breakdown */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-5 text-sm font-semibold text-gray-300">Sources</h2>
          {bySource.length === 0 ? (
            <p className="text-sm text-gray-500">No source data yet.</p>
          ) : (
            <div className="space-y-3">
              {bySource.map(({ source, count }) => (
                <div key={source} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-gray-400 truncate">
                    {source}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${Math.round((count / total) * 100)}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-medium text-gray-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-300">Top tags</h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="rounded-full border border-violet-800 bg-violet-950 px-3 py-1 text-xs font-medium text-violet-300"
                style={{ fontSize: `${Math.min(14, 10 + count)}px` }}
              >
                {tag}
                <span className="ml-1.5 opacity-50">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Remote vs on-site */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-300">
          Remote vs on-site
        </h2>
        <div className="flex items-center gap-4">
          {(() => {
            const remote = jobs.filter((j) => j.remote).length;
            const onsite = total - remote;
            const remotePct = total ? Math.round((remote / total) * 100) : 0;
            return (
              <>
                <div className="flex-1 h-3 rounded-full bg-gray-800 overflow-hidden flex">
                  <div
                    className="h-full bg-violet-500 transition-all"
                    style={{ width: `${remotePct}%` }}
                  />
                  <div className="h-full bg-blue-600 flex-1" />
                </div>
                <div className="flex gap-4 text-xs text-gray-400 shrink-0">
                  <span>
                    <span className="inline-block h-2 w-2 rounded-full bg-violet-500 mr-1.5" />
                    Remote {remote}
                  </span>
                  <span>
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-600 mr-1.5" />
                    On-site {onsite}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
