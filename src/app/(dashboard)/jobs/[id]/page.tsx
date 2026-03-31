"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getJob, getStatusHistory, deleteJob } from "@/lib/firebase/jobs";
import { useAuth } from "@/lib/hooks/useAuth";
import JobForm from "@/components/jobs/JobForm";
import StatusBadge from "@/components/jobs/StatusBadge";
import TagPill from "@/components/jobs/TagPill";
import MarkdownViewer from "@/components/shared/MarkdownViewer";
import ContactCard from "@/components/jobs/ContactCard";
import type { Job, StatusHistoryEntry } from "@/types";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "description" | "notes" | "contacts"
  >("overview");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [j, h] = await Promise.all([
        getJob(params.id),
        getStatusHistory(params.id),
      ]);
      setJob(j);
      setHistory(h);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setDeleting(true);
    await deleteJob(params.id);
    router.push("/jobs");
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-violet-500" />
      </div>
    );

  if (!job)
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Job not found.</p>
        <Link
          href="/jobs"
          className="mt-3 inline-block text-sm text-violet-400 hover:text-violet-300"
        >
          Back to jobs
        </Link>
      </div>
    );

  if (editing)
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => setEditing(false)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Cancel
        </button>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <JobForm
            job={job}
            onSuccess={() => {
              setEditing(false);
              router.refresh();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-100">
                {job.title}
              </h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="mt-1 text-gray-400">{job.company}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {job.location && (
                <span>
                  {job.remote ? `${job.location} (Remote)` : job.location}
                </span>
              )}
              {job.salary && (
                <span>
                  {job.salary.currency} {job.salary.min.toLocaleString()} –{" "}
                  {job.salary.max.toLocaleString()}
                </span>
              )}
              <span>via {job.source}</span>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  View posting ↗
                </a>
              )}
            </div>
            {job.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(["overview", "description", "notes", "contacts"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-violet-500 font-medium text-violet-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
              {tab === "contacts" && job.contacts.length > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-700 px-1.5 py-0.5 text-xs">
                  {job.contacts.length}
                </span>
              )}
            </button>
          ),
        )}
      </div>

      {/* Tab: Overview (status timeline) */}
      {activeTab === "overview" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-300">
            Status timeline
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No history yet.</p>
          ) : (
            <ol className="relative border-l border-gray-800 ml-3 space-y-6">
              {history.map((entry, i) => (
                <li key={i} className="ml-6">
                  <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-gray-700 bg-gray-900" />
                  <div className="flex items-center gap-3">
                    <StatusBadge status={entry.status} />
                    <span className="text-xs text-gray-500">
                      {entry.changedAt
                        ?.toDate?.()
                        ?.toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-sm text-gray-400">{entry.note}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Tab: Description */}
      {activeTab === "description" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          {job.description ? (
            <MarkdownViewer content={job.description} />
          ) : (
            <p className="text-sm text-gray-500">
              No description added yet.{" "}
              <button
                onClick={() => setEditing(true)}
                className="text-violet-400 hover:text-violet-300"
              >
                Add one
              </button>
            </p>
          )}
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === "notes" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          {job.notes ? (
            <MarkdownViewer content={job.notes} />
          ) : (
            <p className="text-sm text-gray-500">
              No notes yet.{" "}
              <button
                onClick={() => setEditing(true)}
                className="text-violet-400 hover:text-violet-300"
              >
                Add notes
              </button>
            </p>
          )}
        </div>
      )}

      {/* Tab: Contacts */}
      {activeTab === "contacts" && (
        <div className="space-y-3">
          {job.contacts.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
              <p className="text-sm text-gray-500">No contacts added yet.</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Add contacts in edit mode
              </button>
            </div>
          ) : (
            job.contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
