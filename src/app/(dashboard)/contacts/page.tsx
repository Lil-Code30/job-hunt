"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useJobs } from "@/lib/hooks/useJobs";
import ContactCard from "@/components/jobs/ContactCard";

export default function ContactsPage() {
  const { allJobs, loading } = useJobs();

  const contacts = useMemo(() => {
    return allJobs.flatMap((job) =>
      job.contacts.map((c) => ({
        ...c,
        jobTitle: job.title,
        jobCompany: job.company,
        jobId: job.id,
      })),
    );
  }, [allJobs]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-violet-500" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-100">Contacts</h1>
        <p className="mt-1 text-sm text-gray-400">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} across{" "}
          {allJobs.length} jobs
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center">
          <p className="text-gray-400">No contacts yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Add contacts when editing a job.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((contact) => (
            <div key={contact.id}>
              <ContactCard contact={contact} />
              <Link
                href={`/jobs/${contact.jobId}`}
                className="mt-1 block text-xs text-gray-500 hover:text-violet-400 pl-1 transition-colors"
              >
                {contact.jobTitle} at {contact.jobCompany} ↗
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
