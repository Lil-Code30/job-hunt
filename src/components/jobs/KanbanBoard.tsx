'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Job, JobStatus } from '@/types'

// ── Column config ─────────────────────────────────────────────────────────────

type Column = {
  id: JobStatus
  label: string
  color: string
  dot: string
}

const COLUMNS: Column[] = [
  { id: 'bookmarked',   label: 'Bookmarked',   color: 'border-t-violet-400', dot: 'bg-violet-400' },
  { id: 'applied',      label: 'Applied',      color: 'border-t-blue-400',   dot: 'bg-blue-400'   },
  { id: 'phone_screen', label: 'Phone screen', color: 'border-t-yellow-400', dot: 'bg-yellow-400' },
  { id: 'interview',    label: 'Interview',    color: 'border-t-orange-400', dot: 'bg-orange-400' },
  { id: 'offer',        label: 'Offer',        color: 'border-t-green-400',  dot: 'bg-green-400'  },
  { id: 'rejected',     label: 'Rejected',     color: 'border-t-red-400',    dot: 'bg-red-400'    },
]

// ── Sortable card ─────────────────────────────────────────────────────────────

function JobCard({ job, isDragging }: { job: Job; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 cursor-grab active:cursor-grabbing select-none shadow-sm hover:shadow-md transition-shadow"
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{job.title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.company}</p>

      {job.location && (
        <p className="text-xs text-gray-400 mt-1">{job.remote ? 'Remote' : job.location}</p>
      )}

      {job.salary && (
        <p className="text-xs text-gray-500 mt-1">
          {job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}
        </p>
      )}

      {job.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-violet-50 dark:bg-violet-950 px-2 py-0.5 text-xs text-violet-700 dark:text-violet-300">
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{job.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Droppable column ──────────────────────────────────────────────────────────

function KanbanColumn({ column, jobs }: { column: Column; jobs: Job[] }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <div ref={setNodeRef} className={`flex flex-col rounded-xl border-t-2 ${column.color} bg-gray-50 dark:bg-gray-800/50 min-w-[240px] w-[240px] shrink-0`}>
      <div className="flex items-center gap-2 px-3 py-3">
        <span className={`h-2 w-2 rounded-full ${column.dot}`} />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {column.label}
        </span>
        <span className="ml-auto rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
          {jobs.length}
        </span>
      </div>

      <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 px-2 pb-3 min-h-[120px]">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-center text-xs text-gray-400">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

type Props = {
  jobs: Job[]
  onStatusChange: (jobId: string, status: JobStatus) => Promise<void>
}

export default function KanbanBoard({ jobs, onStatusChange }: Props) {
  const [activeJob, setActiveJob] = useState<Job | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function jobsByStatus(status: JobStatus) {
    return jobs.filter((j) => j.status === status)
  }

  function findJobById(id: string) {
    return jobs.find((j) => j.id === id) ?? null
  }

  function findColumnForJob(jobId: string): JobStatus | null {
    return jobs.find((j) => j.id === jobId)?.status ?? null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveJob(findJobById(event.active.id as string))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveJob(null)
    if (!over) return

    const jobId = active.id as string
    const overId = over.id as string

    // over.id can be a column id or another job's id
    const targetStatus = (COLUMNS.find((c) => c.id === overId)?.id ??
      findColumnForJob(overId)) as JobStatus | null

    if (!targetStatus) return
    const currentStatus = findColumnForJob(jobId)
    if (currentStatus === targetStatus) return

    await onStatusChange(jobId, targetStatus)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.id} column={col} jobs={jobsByStatus(col.id)} />
        ))}
      </div>

      <DragOverlay>
        {activeJob && (
          <div className="rotate-2 opacity-90">
            <JobCard job={activeJob} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
