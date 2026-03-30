"use client";

import { useState } from "react";
import { createJob, updateJob } from "@/lib/firebase/jobs";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Job, CreateJobInput, JobStatus, JobSource } from "@/types";

const JOB_STATUSES: JobStatus[] = [
  "bookmarked",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

const JOB_SOURCES: JobSource[] = [
  "LinkedIn",
  "Wellfound",
  "Indeed",
  "Greenhouse",
  "Lever",
  "Referral",
  "Company site",
  "Other",
];

const STATUS_COLORS: Record<JobStatus, string> = {
  bookmarked: "bg-violet-100 text-violet-800",
  applied: "bg-blue-100 text-blue-800",
  phone_screen: "bg-yellow-100 text-yellow-800",
  interview: "bg-orange-100 text-orange-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-600",
};

type Props = {
  job?: Job;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
};

const DEFAULT_FORM: Omit<CreateJobInput, "contacts"> = {
  title: "",
  company: "",
  location: "",
  remote: false,
  url: "",
  source: "LinkedIn",
  status: "bookmarked",
  tags: [],
  salary: undefined,
  description: "",
  notes: "",
};

export default function JobForm({ job, onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState(
    job
      ? {
          title: job.title,
          company: job.company,
          location: job.location,
          remote: job.remote,
          url: job.url ?? "",
          source: job.source,
          status: job.status,
          tags: job.tags,
          salary: job.salary,
          description: job.description,
          notes: job.notes,
        }
      : DEFAULT_FORM,
  );

  const [tagInput, setTagInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "description" | "notes"
  >("details");

  // ── URL scraper ─────────────────────────────────────────────────────────────
  async function handleScrape() {
    if (!form.url) return;
    setScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({
        ...f,
        title: data.title ?? f.title,
        company: data.company ?? f.company,
        location: data.location ?? f.location,
        remote: data.remote ?? f.remote,
        source: (data.source as JobSource) ?? f.source,
        description: data.description ?? f.description,
      }));
    } catch (e: any) {
      setScrapeError(e.message ?? "Could not scrape this URL");
    } finally {
      setScraping(false);
    }
  }

  // ── Tags ────────────────────────────────────────────────────────────────────
  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (job) {
        await updateJob(job.id, form);
        onSuccess?.(job.id);
      } else {
        const id = await createJob(user.uid, { ...form, contacts: [] });
        onSuccess?.(id);
      }
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500";
  const labelCls =
    "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* ── URL bar ── */}
      <div>
        <label className={labelCls}>
          Job URL (optional — auto-fills fields)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://jobs.company.com/..."
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleScrape}
            disabled={!form.url || scraping}
            className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-violet-700 transition-colors"
          >
            {scraping ? "Fetching…" : "Auto-fill"}
          </button>
        </div>
        {scrapeError && (
          <p className="mt-1 text-xs text-red-500">{scrapeError}</p>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["details", "description", "notes"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-violet-500 font-medium text-violet-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Details tab ── */}
      {activeTab === "details" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={labelCls}>Job title *</label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className={inputCls}
              placeholder="Senior Frontend Engineer"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelCls}>Company *</label>
            <input
              required
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
              }
              className={inputCls}
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className={inputCls}
              placeholder="Montreal, QC"
            />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input
              type="checkbox"
              id="remote"
              checked={form.remote}
              onChange={(e) =>
                setForm((f) => ({ ...f, remote: e.target.checked }))
              }
              className="h-4 w-4 accent-violet-600"
            />
            <label
              htmlFor="remote"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Remote
            </label>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as JobStatus }))
              }
              className={inputCls}
            >
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Source</label>
            <select
              value={form.source}
              onChange={(e) =>
                setForm((f) => ({ ...f, source: e.target.value as JobSource }))
              }
              className={inputCls}
            >
              {JOB_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div>
            <label className={labelCls}>Salary min</label>
            <input
              type="number"
              value={form.salary?.min ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  salary: {
                    currency: "CAD",
                    max: f.salary?.max ?? 0,
                    ...f.salary,
                    min: Number(e.target.value),
                  },
                }))
              }
              className={inputCls}
              placeholder="80000"
            />
          </div>
          <div>
            <label className={labelCls}>Salary max</label>
            <input
              type="number"
              value={form.salary?.max ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  salary: {
                    currency: "CAD",
                    min: f.salary?.min ?? 0,
                    ...f.salary,
                    max: Number(e.target.value),
                  },
                }))
              }
              className={inputCls}
              placeholder="120000"
            />
          </div>

          {/* Tags */}
          <div className="col-span-2">
            <label className={labelCls}>
              Tags (press Enter or comma to add)
            </label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className={inputCls}
              placeholder="react, senior, startup…"
            />
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900 px-2 py-0.5 text-xs font-medium text-violet-800 dark:text-violet-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-violet-500 hover:text-violet-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Description tab (markdown) ── */}
      {activeTab === "description" && (
        <div>
          <label className={labelCls}>
            Job description (markdown supported)
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className={`${inputCls} font-mono min-h-[320px] resize-y`}
            placeholder="Paste or type the full job description here. Markdown is supported — use **bold**, ## headers, - lists, etc."
          />
          <p className="mt-1 text-xs text-gray-400">
            Tip: Cmd+B for bold, Cmd+I for italic in most editors
          </p>
        </div>
      )}

      {/* ── Notes tab (markdown timeline) ── */}
      {activeTab === "notes" && (
        <div>
          <label className={labelCls}>Notes & timeline (markdown)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={`${inputCls} font-mono min-h-[320px] resize-y`}
            placeholder={`## ${new Date().toLocaleDateString()}\n- Applied via LinkedIn\n- Spoke to recruiter Sarah\n\n## Interview prep\n- Research their tech stack\n- Prepare system design question`}
          />
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-violet-700 transition-colors"
        >
          {saving ? "Saving…" : job ? "Save changes" : "Add job"}
        </button>
      </div>
    </form>
  );
}
