import type { JobStatus } from "@/types";

const CONFIG: Record<JobStatus, { label: string; cls: string }> = {
  bookmarked: {
    label: "Bookmarked",
    cls: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  applied: {
    label: "Applied",
    cls: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  phone_screen: {
    label: "Phone screen",
    cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  interview: {
    label: "Interview",
    cls: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  offer: {
    label: "Offer",
    cls: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  withdrawn: {
    label: "Withdrawn",
    cls: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  },
};

export default function StatusBadge({ status }: { status: JobStatus }) {
  const { label, cls } = CONFIG[status] ?? CONFIG.bookmarked;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}
