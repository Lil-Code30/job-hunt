import { updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./config";
import type { Contact } from "@/types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function addContact(
  jobId: string,
  contact: Omit<Contact, "id">,
): Promise<Contact> {
  const newContact: Contact = { ...contact, id: generateId() };
  await updateDoc(doc(db, "jobs", jobId), {
    contacts: arrayUnion(newContact),
  });
  return newContact;
}

export async function removeContact(
  jobId: string,
  contact: Contact,
): Promise<void> {
  await updateDoc(doc(db, "jobs", jobId), {
    contacts: arrayRemove(contact),
  });
}

export async function updateContact(
  jobId: string,
  updated: Contact,
  original: Contact,
): Promise<void> {
  await updateDoc(doc(db, "jobs", jobId), {
    contacts: arrayRemove(original),
  });
  await updateDoc(doc(db, "jobs", jobId), {
    contacts: arrayUnion(updated),
  });
}
