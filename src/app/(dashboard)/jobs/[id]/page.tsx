"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJob, updateJobStatus } from "@/lib/firebase/jobs";
import { getStatusHistory } from "@/lib/firebase/jobs";
import type { Job, JobStatus, StatusHistoryEntry } from "@/types";
import JobForm from "@/components/jobs/JobForm";

const STATUSES: JobStatus[] = [
  "bookmarked",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function load() {
      const id = params.id as string;
      const [jobData, historyData] = await Promise.all([
        getJob(id),
        getStatusHistory(id),
      ]);
      setJob(jobData);
      setHistory(historyData);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleStatusChange(status: JobStatus) {
    if (!job) return;
    await updateJobStatus(job.id, status);
    setJob((j) => (j ? { ...j, status } : null));
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-24">
        <p className="text-zinc-400">Job not found</p>
        <button onClick={() => router.back()} className="mt-2 text-sm text-brand hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push("/jobs")} className="text-sm text-zinc-400 hover:text-zinc-200 mb-2">
            ← Jobs
          </button>
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <p className="text-zinc-400">{job.company} · {job.location || (job.remote ? "Remote" : "N/A")}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-all ${
              job.status === s ? "ring-2 ring-brand" : "opacity-50 hover:opacity-100"
            } ${
              s === "bookmarked" ? "bg-violet-500/20 text-violet-400" :
              s === "applied" ? "bg-blue-500/20 text-blue-400" :
              s === "phone_screen" ? "bg-yellow-500/20 text-yellow-400" :
              s === "interview" ? "bg-orange-500/20 text-orange-400" :
              s === "offer" ? "bg-green-500/20 text-green-400" :
              s === "rejected" ? "bg-red-500/20 text-red-400" :
              "bg-zinc-500/20 text-zinc-400"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {job.description && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="font-semibold mb-3">Description</h2>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-300">
                {job.description}
              </div>
            </div>
          )}
          {job.notes && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="font-semibold mb-3">Notes</h2>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-300">
                {job.notes}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-zinc-500">Source</dt>
                <dd>{job.source}</dd>
              </div>
              {job.url && (
                <div>
                  <dt className="text-zinc-500">URL</dt>
                  <dd>
                    <a href={job.url} target="_blank" rel="noopener" className="text-brand hover:underline truncate block">
                      Link
                    </a>
                  </dd>
                </div>
              )}
              {job.salary && (
                <div>
                  <dt className="text-zinc-500">Salary</dt>
                  <dd>{job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}</dd>
                </div>
              )}
              {job.tags.length > 0 && (
                <div>
                  <dt className="text-zinc-500">Tags</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {history.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Timeline</h3>
              <div className="space-y-3">
                {history.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-zinc-600" />
                    <span className="capitalize">{entry.status.replace("_", " ")}</span>
                    <span className="text-zinc-500">
                      {entry.changedAt.toDate().toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Edit job</h2>
              <button onClick={() => setEditing(false)} className="text-zinc-400 hover:text-zinc-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <JobForm job={job} onSuccess={() => setEditing(false)} onCancel={() => setEditing(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
