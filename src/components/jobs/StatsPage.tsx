"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
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
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function StatsPage({ jobs }: Props) {
  // ── derived data ────────────────────────────────────────────────────────────

  const total = jobs.length;
  const applied = jobs.filter((j) => j.status !== "bookmarked").length;
  const interviews = jobs.filter((j) =>
    ["interview", "offer"].includes(j.status),
  ).length;
  const offers = jobs.filter((j) => j.status === "offer").length;
  const responseRate = applied ? Math.round((interviews / applied) * 100) : 0;

  // Bar chart: jobs by status
  const byStatus = Object.entries(
    jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([status, count]) => ({
    status: status.replace("_", " "),
    count,
    fill: STATUS_COLORS[status] ?? "#888",
  }));

  // Funnel: applied → phone → interview → offer
  const funnelData = STATUS_ORDER.map((s) => ({
    name: s.replace("_", " "),
    value: jobs.filter(
      (j) => j.status === s || (s === "interview" && j.status === "offer"),
    ).length,
    fill: STATUS_COLORS[s],
  }));

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
    .slice(0, 8);

  // Salary range (from jobs that have salary)
  const salaryJobs = jobs.filter((j) => j.salary);
  const avgSalaryMid = salaryJobs.length
    ? Math.round(
        salaryJobs.reduce(
          (sum, j) => sum + (j.salary!.min + j.salary!.max) / 2,
          0,
        ) / salaryJobs.length,
      )
    : null;

  return (
    <div className="space-y-8">
      {/* ── KPI cards ── */}
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
      {avgSalaryMid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Avg. salary midpoint"
            value={`$${avgSalaryMid.toLocaleString()}`}
            sub={`across ${salaryJobs.length} jobs with salary data`}
          />
        </div>
      )}

      {/* ── Status bar chart ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Jobs by status
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byStatus} barSize={32}>
            <XAxis
              dataKey="status"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "none",
                background: "#1f2937",
                color: "#f9fafb",
                fontSize: 12,
              }}
              cursor={{ fill: "rgba(139,92,246,0.08)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {byStatus.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* ── Pipeline funnel ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Pipeline funnel
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  background: "#1f2937",
                  color: "#f9fafb",
                  fontSize: 12,
                }}
              />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList
                  position="center"
                  fill="#fff"
                  fontSize={12}
                  dataKey="name"
                />
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* ── Source breakdown ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Sources
          </h2>
          <div className="space-y-3">
            {bySource.map(({ source, count }) => (
              <div key={source} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-gray-500">
                  {source}
                </span>
                <div className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${Math.round((count / total) * 100)}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top tags ── */}
      {topTags.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Top tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300"
                style={{ fontSize: `${Math.min(14, 10 + count)}px` }}
              >
                {tag} <span className="opacity-60">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
