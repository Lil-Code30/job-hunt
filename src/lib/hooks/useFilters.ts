"use client";

import { useState, useCallback } from "react";
import type { JobFilters, JobStatus, JobSource } from "@/types";

export function useFilters(initial: JobFilters = {}) {
  const [filters, setFilters] = useState<JobFilters>(initial);

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search: search || undefined }));
  }, []);

  const toggleStatus = useCallback((status: JobStatus) => {
    setFilters((f) => {
      const cur = f.status ?? [];
      const next = cur.includes(status)
        ? cur.filter((s) => s !== status)
        : [...cur, status];
      return { ...f, status: next.length ? next : undefined };
    });
  }, []);

  const toggleSource = useCallback((source: JobSource) => {
    setFilters((f) => {
      const cur = f.source ?? [];
      const next = cur.includes(source)
        ? cur.filter((s) => s !== source)
        : [...cur, source];
      return { ...f, source: next.length ? next : undefined };
    });
  }, []);

  const setRemote = useCallback((remote: boolean | undefined) => {
    setFilters((f) => ({ ...f, remote }));
  }, []);

  const clear = useCallback(() => setFilters({}), []);

  const activeCount = [
    filters.status?.length ?? 0,
    filters.source?.length ?? 0,
    filters.remote !== undefined ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return {
    filters,
    setFilters,
    setSearch,
    toggleStatus,
    toggleSource,
    setRemote,
    clear,
    activeCount,
  };
}
