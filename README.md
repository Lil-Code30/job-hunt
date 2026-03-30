# Job Hunt

A job application tracker built with Next.js and Firebase.

## Folder structure

```
job-hunt/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + topbar shell
│   │   ├── page.tsx                ← dashboard overview
│   │   ├── jobs/
│   │   │   ├── page.tsx            ← job list (table + kanban toggle)
│   │   │   ├── [id]/page.tsx       ← job detail
│   │   │   └── new/page.tsx        ← add job (URL or manual)
│   │   ├── contacts/page.tsx       ← people at companies
│   │   ├── stats/page.tsx          ← charts, funnel, heatmap
│   │   └── settings/page.tsx
│   └── api/
│       ├── scrape/route.ts         ← URL → job metadata
│       └── export/route.ts         ← CSV export
│
├── components/
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobTable.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── JobForm.tsx             ← manual entry + markdown editor
│   │   ├── StatusBadge.tsx
│   │   └── TagPill.tsx
│   ├── ui/                         ← shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── CommandPalette.tsx      ← Cmd+K search
│   └── shared/
│       ├── MarkdownEditor.tsx      ← for description field
│       └── FilterBar.tsx
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── jobs.ts                 ← CRUD operations
│   │   ├── contacts.ts
│   │   └── auth.ts
│   ├── hooks/
│   │   ├── useJobs.ts
│   │   ├── useSearch.ts
│   │   └── useFilters.ts
│   └── utils/
│       ├── scraper.ts
│       └── formatters.ts
│
├── types/
│   └── index.ts                    ← Job, Contact, Tag, Status types
│
└── functions/                      ← Firebase Cloud Functions
    ├── src/
    │   ├── scrapeJob.ts
    │   └── sendReminder.ts
    └── package.json
```

## Env variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
