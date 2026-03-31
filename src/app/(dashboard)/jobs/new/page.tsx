"use client";

import { useRouter } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";

export default function NewJobPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
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
        <h1 className="text-2xl font-semibold text-gray-100">Add job</h1>
        <p className="mt-1 text-sm text-gray-400">
          Paste a URL to auto-fill, or enter details manually.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <JobForm
          onSuccess={(id) => router.push(`/jobs/${id}`)}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
