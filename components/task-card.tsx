"use client"

import { Check, Clock, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { PRIORITY_CONFIG } from "@/lib/types"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

function getDDay(dateStr: string) {
  if (!dateStr) return ""
  const today = dayjs().tz("Asia/Seoul").startOf("day")
  const targetDate = dayjs(dateStr).tz("Asia/Seoul").startOf("day")
  const diffDays = targetDate.diff(today, "day")

  if (diffDays === 0) return "D-Day"
  if (diffDays > 0) return `D-${diffDays}`
  return `D+${Math.abs(diffDays)}`
}

interface TaskCardProps {
  task: Task
  onToggleStatus: (taskId: string) => void
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onToggleStatus, onEdit }: TaskCardProps) {
  const isDone = task.status === "done"
  const dDay = getDDay(task.cutoff_date)
  const isOverdue = task.cutoff_date && dDay.startsWith("D+")

  return (
    <div
      onClick={() => onEdit(task)}
      className={cn(
        "group relative flex items-start gap-4 rounded-2xl p-4 transition-all duration-200 cursor-pointer",
        "bg-card border border-border/50",
        "hover:shadow-lg hover:shadow-black/5 hover:border-border",
        "active:scale-[0.99]",
        isDone && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleStatus(task.task_id)
        }}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          isDone
            ? "border-muted-foreground/30 bg-muted-foreground/10"
            : "border-border hover:border-foreground/30"
        )}
      >
        {isDone && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              "text-base font-medium leading-tight transition-all",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
          {task.due_time && (
            <span className="shrink-0 text-sm font-mono text-muted-foreground">
              {task.due_time}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            {task.category}
          </span>
          {dDay && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                isOverdue && "text-destructive"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {dDay}
            </span>
          )}
          {task.status === "in-progress" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-priority-b-bg px-2 py-0.5 text-xs font-medium text-priority-b">
              진행 중
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
