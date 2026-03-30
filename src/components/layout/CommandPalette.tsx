'use client'

import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import type { Job } from '@/types'

const STATUS_EMOJI: Record<string, string> = {
  bookmarked:   '🔖',
  applied:      '📤',
  phone_screen: '📞',
  interview:    '🎯',
  offer:        '🎉',
  rejected:     '❌',
  withdrawn:    '↩️',
}

type Props = {
  jobs: Job[]
}

export default function CommandPalette({ jobs }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const navigate = useCallback((path: string) => {
    router.push(path)
    setOpen(false)
    setSearch('')
  }, [router])

  // Filter jobs by search
  const matchedJobs = jobs.filter((j) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.tags.some((t) => t.toLowerCase().includes(q)) ||
      j.status.includes(q)
    )
  }).slice(0, 8)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command palette" shouldFilter={false}>
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search jobs, companies, tags…"
              className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
            />
            <kbd className="rounded border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 text-xs text-gray-400">Esc</kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-400">
              No results found
            </Command.Empty>

            {/* Navigation shortcuts */}
            {!search && (
              <Command.Group heading={<span className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Navigation</span>}>
                {[
                  { label: 'Dashboard', path: '/' },
                  { label: 'All jobs', path: '/jobs' },
                  { label: 'Add new job', path: '/jobs/new' },
                  { label: 'Contacts', path: '/contacts' },
                  { label: 'Stats', path: '/stats' },
                ].map((item) => (
                  <Command.Item
                    key={item.path}
                    value={item.label}
                    onSelect={() => navigate(item.path)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer data-[selected=true]:bg-violet-50 dark:data-[selected=true]:bg-violet-950 data-[selected=true]:text-violet-700"
                  >
                    <span>{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Job results */}
            {matchedJobs.length > 0 && (
              <Command.Group heading={<span className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 block">Jobs</span>}>
                {matchedJobs.map((job) => (
                  <Command.Item
                    key={job.id}
                    value={`${job.title} ${job.company}`}
                    onSelect={() => navigate(`/jobs/${job.id}`)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer data-[selected=true]:bg-violet-50 dark:data-[selected=true]:bg-violet-950"
                  >
                    <span className="text-base" style={{ fontSize: 16 }}>{STATUS_EMOJI[job.status]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 truncate">{job.company} · {job.location || 'Remote'}</p>
                    </div>
                    {job.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 flex gap-4 text-xs text-gray-400">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
