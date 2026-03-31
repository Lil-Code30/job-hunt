"use client";

import { useState } from "react";
import Link from "next/link";
import { useJobs } from "@/lib/hooks/useJobs";
import KanbanBoard from "@/components/jobs/KanbanBoard";
import JobTable from "@/components/jobs/JobTable";
import FilterBar from "@/components/shared/FiltereBar";
import type { JobFilters, JobStatus } from "@/types";

type View = "table" | "kanban";

export default function JobsPage() {
  const [view, setView] = useState<View>("table");
  const [filters, setFilters] = useState<JobFilters>({});
  const { jobs, loading, changeStatus, removeJob } = useJobs(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Jobs</h1>
          <p className="mt-1 text-sm text-gray-400">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add job
        </Link>
      </div>

      {/* Filter bar + view toggle */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
        <div className="flex rounded-xl border border-gray-800 bg-gray-900 p-1 shrink-0">
          {(["table", "kanban"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                view === v
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-violet-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <p className="text-gray-400">No jobs match your filters.</p>
          <button
            onClick={() => setFilters({})}
            className="mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard jobs={jobs} onStatusChange={changeStatus} />
      ) : (
        <JobTable
          jobs={jobs}
          onStatusChange={changeStatus}
          onDelete={removeJob}
        />
      )}
    </div>
  );
}
