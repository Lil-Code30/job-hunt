"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobs } from "@/lib/hooks/useJobs";
import KanbanBoard from "@/components/jobs/KanbanBoard";
import JobForm from "@/components/jobs/JobForm";

export default function JobsPage() {
  const router = useRouter();
  const { jobs, loading, stats, changeStatus } = useJobs();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showForm, setShowForm] = useState(false);

  async function handleStatusChange(jobId: string, status: any) {
    await changeStatus(jobId, status);
  }

  function handleJobCreated(id: string) {
    setShowForm(false);
    router.push(`/jobs/${id}`);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-zinc-400">
            {stats.total} total · {stats.byStatus.applied || 0} applied
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-800 p-1">
            <button
              onClick={() => setView("kanban")}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                view === "kanban"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                view === "list"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
          >
            Add job
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-24 text-center">
          <p className="text-zinc-400">No jobs yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-sm text-brand hover:underline"
          >
            Add your first job
          </button>
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard jobs={jobs} onStatusChange={handleStatusChange} />
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 cursor-pointer hover:bg-zinc-900 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{job.title}</p>
                <p className="text-sm text-zinc-400 truncate">{job.company}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize
                ${job.status === "bookmarked" ? "bg-violet-500/20 text-violet-400" : ""}
                ${job.status === "applied" ? "bg-blue-500/20 text-blue-400" : ""}
                ${job.status === "phone_screen" ? "bg-yellow-500/20 text-yellow-400" : ""}
                ${job.status === "interview" ? "bg-orange-500/20 text-orange-400" : ""}
                ${job.status === "offer" ? "bg-green-500/20 text-green-400" : ""}
                ${job.status === "rejected" ? "bg-red-500/20 text-red-400" : ""}
                ${job.status === "withdrawn" ? "bg-zinc-500/20 text-zinc-400" : ""}
              `}>
                {job.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Add job</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <JobForm onSuccess={handleJobCreated} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
