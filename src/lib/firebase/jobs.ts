import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  StatusHistoryEntry,
} from "@/types";

const JOBS_COLLECTION = "jobs";

function jobFromDoc(doc: DocumentData, id: string): Job {
  return { id, ...doc } as Job;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createJob(
  userId: string,
  input: CreateJobInput,
): Promise<string> {
  const ref = await addDoc(collection(db, JOBS_COLLECTION), {
    ...input,
    userId,
    contacts: input.contacts ?? [],
    tags: input.tags ?? [],
    notes: input.notes ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Write initial status history
  await addDoc(collection(db, JOBS_COLLECTION, ref.id, "statusHistory"), {
    status: input.status,
    changedAt: serverTimestamp() as unknown as Timestamp,
  } satisfies Omit<StatusHistoryEntry, "note">);

  return ref.id;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getJob(jobId: string): Promise<Job | null> {
  const snap = await getDoc(doc(db, JOBS_COLLECTION, jobId));
  if (!snap.exists()) return null;
  return jobFromDoc(snap.data(), snap.id);
}

export async function getUserJobs(userId: string): Promise<Job[]> {
  const q = query(
    collection(db, JOBS_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => jobFromDoc(d.data(), d.id));
}

// Real-time listener — returns unsubscribe fn
export function subscribeToJobs(
  userId: string,
  onUpdate: (jobs: Job[]) => void,
): () => void {
  const q = query(
    collection(db, JOBS_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(q, (snap: QuerySnapshot) => {
    onUpdate(snap.docs.map((d) => jobFromDoc(d.data(), d.id)));
  });
}

export async function getStatusHistory(
  jobId: string,
): Promise<StatusHistoryEntry[]> {
  const snap = await getDocs(
    query(
      collection(db, JOBS_COLLECTION, jobId, "statusHistory"),
      orderBy("changedAt", "asc"),
    ),
  );
  return snap.docs.map((d) => d.data() as StatusHistoryEntry);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateJob(
  jobId: string,
  input: UpdateJobInput,
): Promise<void> {
  await updateDoc(doc(db, JOBS_COLLECTION, jobId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function updateJobStatus(
  jobId: string,
  status: Job["status"],
  note?: string,
): Promise<void> {
  await updateDoc(doc(db, JOBS_COLLECTION, jobId), {
    status,
    updatedAt: serverTimestamp(),
    ...(status === "applied" ? { appliedAt: serverTimestamp() } : {}),
  });

  await addDoc(collection(db, JOBS_COLLECTION, jobId, "statusHistory"), {
    status,
    changedAt: serverTimestamp(),
    ...(note ? { note } : {}),
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteJob(jobId: string): Promise<void> {
  await deleteDoc(doc(db, JOBS_COLLECTION, jobId));
}
