"use client";

import { useState } from "react";
import { createJob, updateJob } from "@/lib/firebase/jobs";
import { useAuth } from "@/lib/hooks/useAuth";
import type {
  Job,
  CreateJobInput,
  JobStatus,
  JobSource,
  Contact,
} from "@/types";

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
const CURRENCIES = ["CAD", "USD", "EUR", "GBP", "AUD"];

type Tab = "details" | "description" | "notes" | "contacts";
type Props = {
  job?: Job;
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
};

const BLANK_CONTACT: Omit<Contact, "id"> = {
  name: "",
  role: "",
  email: "",
  linkedin: "",
  notes: "",
};
const genId = () => Math.random().toString(36).slice(2, 10);

export default function JobForm({ job, onSuccess, onCancel }: Props) {
  const { user } = useAuth();

  const [form, setForm] = useState(() => ({
    title: job?.title ?? "",
    company: job?.company ?? "",
    location: job?.location ?? "",
    remote: job?.remote ?? false,
    url: job?.url ?? "",
    source: job?.source ?? ("LinkedIn" as JobSource),
    status: job?.status ?? ("bookmarked" as JobStatus),
    tags: job?.tags ?? ([] as string[]),
    salary: job?.salary,
    description: job?.description ?? "",
    notes: job?.notes ?? "",
  }));

  const [contacts, setContacts] = useState<Contact[]>(job?.contacts ?? []);
  const [newContact, setNewContact] =
    useState<Omit<Contact, "id">>(BLANK_CONTACT);
  const [tagInput, setTagInput] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("details");

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
        title: data.title || f.title,
        company: data.company || f.company,
        location: data.location || f.location,
        remote: data.remote ?? f.remote,
        source: (data.source as JobSource) || f.source,
        description: data.description || f.description,
      }));
    } catch (e: any) {
      setScrapeError(e.message ?? "Could not scrape this URL");
    } finally {
      setScraping(false);
    }
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag))
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput("");
  }

  function addContact() {
    if (!newContact.name.trim()) return;
    setContacts((c) => [...c, { ...newContact, id: genId() }]);
    setNewContact(BLANK_CONTACT);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (job) {
        await updateJob(job.id, { ...form, contacts });
        onSuccess?.(job.id);
      } else {
        const id = await createJob(user.uid, {
          ...form,
          contacts,
        } as CreateJobInput);
        onSuccess?.(id);
      }
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors";
  const lbl = "block text-xs font-medium text-gray-400 mb-1.5";
  const tabs: Tab[] = ["details", "description", "notes", "contacts"];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* URL auto-fill */}
      <div>
        <label className={lbl}>Job URL — paste to auto-fill fields</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://jobs.company.com/…"
            className={inp}
          />
          <button
            type="button"
            onClick={handleScrape}
            disabled={!form.url || scraping}
            className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
          >
            {scraping ? "Fetching…" : "Auto-fill"}
          </button>
        </div>
        {scrapeError && (
          <p className="mt-1 text-xs text-red-400">{scrapeError}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize transition-colors ${tab === t ? "border-b-2 border-violet-500 font-medium text-violet-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            {t}
            {t === "contacts" && contacts.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-700 px-1.5 text-xs">
                {contacts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Details */}
      {tab === "details" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className={lbl}>Job title *</label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className={inp}
              placeholder="Senior Frontend Engineer"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={lbl}>Company *</label>
            <input
              required
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
              }
              className={inp}
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className={lbl}>Location</label>
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className={inp}
              placeholder="Montreal, QC"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="remote"
              checked={form.remote}
              onChange={(e) =>
                setForm((f) => ({ ...f, remote: e.target.checked }))
              }
              className="h-4 w-4 accent-violet-600 rounded cursor-pointer"
            />
            <label
              htmlFor="remote"
              className="text-sm text-gray-300 cursor-pointer select-none"
            >
              Remote
            </label>
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as JobStatus }))
              }
              className={inp}
            >
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-gray-900">
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Source</label>
            <select
              value={form.source}
              onChange={(e) =>
                setForm((f) => ({ ...f, source: e.target.value as JobSource }))
              }
              className={inp}
            >
              {JOB_SOURCES.map((s) => (
                <option key={s} value={s} className="bg-gray-900">
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Salary min</label>
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
              className={inp}
              placeholder="80000"
            />
          </div>
          <div>
            <label className={lbl}>Salary max</label>
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
              className={inp}
              placeholder="120000"
            />
          </div>
          <div>
            <label className={lbl}>Currency</label>
            <select
              value={form.salary?.currency ?? "CAD"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  salary: {
                    min: f.salary?.min ?? 0,
                    max: f.salary?.max ?? 0,
                    ...f.salary,
                    currency: e.target.value,
                  },
                }))
              }
              className={inp}
            >
              {CURRENCIES.map((c) => (
                <option key={c} className="bg-gray-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={lbl}>Tags — Enter or comma to add</label>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className={inp}
              placeholder="react, senior, startup…"
            />
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-violet-700 bg-violet-900/40 px-2.5 py-0.5 text-xs text-violet-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          tags: f.tags.filter((t) => t !== tag),
                        }))
                      }
                      className="text-violet-400 hover:text-white"
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

      {/* Description */}
      {tab === "description" && (
        <div>
          <label className={lbl}>Job description — markdown supported</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className={`${inp} font-mono min-h-[340px] resize-y leading-relaxed`}
            placeholder={
              "## About the role\n\nPaste or type the job description here.\n\n**Markdown supported:**\n- **bold**, *italic*, `code`\n- ## Headings\n- - bullet lists"
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            Rendered in the job detail view
          </p>
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div>
          <label className={lbl}>Notes & timeline — markdown supported</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={`${inp} font-mono min-h-[340px] resize-y leading-relaxed`}
            placeholder={`## ${new Date().toLocaleDateString("en-CA")}\n- Applied via LinkedIn\n- Recruiter confirmed salary range\n\n## Interview prep\n- Research their product\n- Prepare system design answers\n- Ask about team structure`}
          />
        </div>
      )}

      {/* Contacts */}
      {tab === "contacts" && (
        <div className="space-y-4">
          {contacts.length > 0 && (
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-violet-700 flex items-center justify-center text-xs font-semibold text-white">
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500">{c.role}</p>
                      {c.email && (
                        <p className="text-xs text-violet-400">{c.email}</p>
                      )}
                      {c.linkedin && (
                        <a
                          href={c.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:underline"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                      {c.notes && (
                        <p className="mt-0.5 text-xs text-gray-500 italic">
                          {c.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setContacts((cx) => cx.filter((x) => x.id !== c.id))
                    }
                    className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              New contact
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Name *</label>
                <input
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact((c) => ({ ...c, name: e.target.value }))
                  }
                  className={inp}
                  placeholder="Sarah Kim"
                />
              </div>
              <div>
                <label className={lbl}>Role</label>
                <input
                  value={newContact.role}
                  onChange={(e) =>
                    setNewContact((c) => ({ ...c, role: e.target.value }))
                  }
                  className={inp}
                  placeholder="Engineering Manager"
                />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact((c) => ({ ...c, email: e.target.value }))
                  }
                  className={inp}
                  placeholder="sarah@company.com"
                />
              </div>
              <div>
                <label className={lbl}>LinkedIn URL</label>
                <input
                  value={newContact.linkedin}
                  onChange={(e) =>
                    setNewContact((c) => ({ ...c, linkedin: e.target.value }))
                  }
                  className={inp}
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Notes</label>
                <input
                  value={newContact.notes}
                  onChange={(e) =>
                    setNewContact((c) => ({ ...c, notes: e.target.value }))
                  }
                  className={inp}
                  placeholder="Met at meetup, referred me to the role"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addContact}
              disabled={!newContact.name.trim()}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-40 transition-colors"
            >
              Add contact
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : job ? "Save changes" : "Add job"}
        </button>
      </div>
    </form>
  );
}
