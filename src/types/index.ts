import { Timestamp } from "firebase/firestore";

export type JobStatus =
  | "bookmarked"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type JobSource =
  | "LinkedIn"
  | "Wellfound"
  | "Indeed"
  | "Greenhouse"
  | "Lever"
  | "Referral"
  | "Company site"
  | "Other";

export type Salary = {
  min: number;
  max: number;
  currency: string;
};

export type StatusHistoryEntry = {
  status: JobStatus;
  changedAt: Timestamp;
  note?: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
  notes?: string;
};

export type Job = {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url?: string;
  source: JobSource;
  status: JobStatus;
  tags: string[];
  salary?: Salary;
  description: string; // markdown
  notes: string; // markdown timeline
  contacts: Contact[];
  appliedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Omit generated fields when creating
export type CreateJobInput = Omit<
  Job,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type UpdateJobInput = Partial<Omit<Job, "id" | "userId" | "createdAt">>;

export type JobFilters = {
  status?: JobStatus[];
  tags?: string[];
  source?: JobSource[];
  remote?: boolean;
  search?: string;
};
