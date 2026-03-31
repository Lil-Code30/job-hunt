import type { Contact } from "@/types";

export default function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 flex items-start gap-4">
      <div className="h-9 w-9 shrink-0 rounded-full bg-violet-700 flex items-center justify-center text-sm font-semibold text-white">
        {contact.name[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200">{contact.name}</p>
        <p className="text-xs text-gray-500">{contact.role}</p>
        <div className="mt-1.5 flex flex-wrap gap-3">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {contact.email}
            </a>
          )}
          {contact.linkedin && (
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              LinkedIn ↗
            </a>
          )}
        </div>
        {contact.notes && (
          <p className="mt-1.5 text-xs text-gray-500">{contact.notes}</p>
        )}
      </div>
    </div>
  );
}
