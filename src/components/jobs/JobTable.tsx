"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import TagPill from "./TagPill";
import type { Job, JobStatus } from "@/types";

const STATUS_OPTIONS: JobStatus[] = [
  "bookmarked",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

type Props = {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function JobTable({ jobs, onStatusChange, onDelete }: Props) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-xs font-medium uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Tags</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Source</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Salary</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="group hover:bg-gray-800/40 transition-colors"
            >
              <td className="px-4 py-3">
                <Link href={`/jobs/${job.id}`} className="block">
                  <p className="font-medium text-gray-200 group-hover:text-white transition-colors truncate max-w-[200px]">
                    {job.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {job.company}
                    {job.location
                      ? ` · ${job.remote ? "Remote" : job.location}`
                      : ""}
                  </p>
                </Link>
              </td>
              <td className="px-4 py-3">
                <select
                  value={job.status}
                  onChange={(e) =>
                    onStatusChange(job.id, e.target.value as JobStatus)
                  }
                  className="rounded-lg border-0 bg-transparent text-xs outline-none cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-gray-900">
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <div className="mt-0.5">
                  <StatusBadge status={job.status} />
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  {job.tags.slice(0, 2).map((t) => (
                    <TagPill key={t} tag={t} />
                  ))}
                  {job.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{job.tags.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-xs text-gray-400">{job.source}</span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {job.salary ? (
                  <span className="text-xs text-gray-400">
                    {job.salary.currency} {(job.salary.min / 1000).toFixed(0)}k–
                    {(job.salary.max / 1000).toFixed(0)}k
                  </span>
                ) : (
                  <span className="text-xs text-gray-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => onDelete(job.id)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-950 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
