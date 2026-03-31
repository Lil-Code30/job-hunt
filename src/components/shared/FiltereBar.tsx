"use client";

import { useState } from "react";
import type { JobFilters, JobStatus, JobSource } from "@/types";

const STATUSES: JobStatus[] = [
  "bookmarked",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];
const SOURCES: JobSource[] = [
  "LinkedIn",
  "Wellfound",
  "Indeed",
  "Greenhouse",
  "Lever",
  "Referral",
  "Company site",
  "Other",
];

type Props = {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
};

export default function FilterBar({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.status?.length,
    filters.source?.length,
    filters.remote !== undefined ? 1 : 0,
  ].reduce<number>((sum, v) => sum + (v ?? 0), 0);

  function toggleStatus(s: JobStatus) {
    const cur = filters.status ?? [];
    const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
    onChange({ ...filters, status: next.length ? next : undefined });
  }

  function toggleSource(s: JobSource) {
    const cur = filters.source ?? [];
    const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
    onChange({ ...filters, source: next.length ? next : undefined });
  }

  function clear() {
    onChange({});
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <circle
              cx="6"
              cy="6"
              r="4"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M9 9l2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search jobs…"
            value={filters.search ?? ""}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value || undefined })
            }
            className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            activeCount > 0
              ? "border-violet-500 bg-violet-600/10 text-violet-400"
              : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-gray-200"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 4h10M4 7h6M6 10h2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            onClick={clear}
            className="rounded-xl border border-gray-800 bg-gray-900 px-3 py-2.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {open && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 space-y-4">
          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => {
                const active = filters.status?.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                      active
                        ? "border-violet-500 bg-violet-600/15 text-violet-400"
                        : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Source
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SOURCES.map((s) => {
                const active = filters.source?.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSource(s)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      active
                        ? "border-violet-500 bg-violet-600/15 text-violet-400"
                        : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remote */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Work type
            </p>
            <div className="flex gap-1.5">
              {[
                { label: "All", value: undefined },
                { label: "Remote", value: true },
                { label: "On-site", value: false },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => onChange({ ...filters, remote: value })}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    filters.remote === value
                      ? "border-violet-500 bg-violet-600/15 text-violet-400"
                      : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
