"use client";

import { useState, useEffect, useMemo } from "react";
import {
  subscribeToJobs,
  updateJobStatus,
  deleteJob,
} from "@/lib/firebase/jobs";
import { useAuth } from "./useAuth";
import type { Job, JobFilters } from "@/types";

export function useJobs(filters?: JobFilters) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscription
  useEffect(() => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToJobs(user.uid, (data) => {
      setJobs(data);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  // Client-side filtering (fast, no extra reads)
  const filteredJobs = useMemo(() => {
    if (!filters) return jobs;

    return jobs.filter((job) => {
      if (filters.status?.length && !filters.status.includes(job.status))
        return false;
      if (
        filters.tags?.length &&
        !filters.tags.some((t) => job.tags.includes(t))
      )
        return false;
      if (filters.source?.length && !filters.source.includes(job.source))
        return false;
      if (filters.remote !== undefined && job.remote !== filters.remote)
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hit =
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.tags.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [jobs, filters]);

  // Derived stats
  const stats = useMemo(
    () => ({
      total: jobs.length,
      byStatus: jobs.reduce<Record<string, number>>((acc, j) => {
        acc[j.status] = (acc[j.status] ?? 0) + 1;
        return acc;
      }, {}),
      responseRate: (() => {
        const applied = jobs.filter((j) => j.status !== "bookmarked").length;
        if (!applied) return 0;
        const responded = jobs.filter(
          (j) => !["bookmarked", "applied"].includes(j.status),
        ).length;
        return Math.round((responded / applied) * 100);
      })(),
    }),
    [jobs],
  );

  async function changeStatus(
    jobId: string,
    status: Job["status"],
    note?: string,
  ) {
    await updateJobStatus(jobId, status, note);
  }

  async function removeJob(jobId: string) {
    await deleteJob(jobId);
  }

  return {
    jobs: filteredJobs,
    allJobs: jobs,
    loading,
    error,
    stats,
    changeStatus,
    removeJob,
  };
}
