"use client"

import { cn } from "@/lib/utils"
import type { Task, Priority } from "@/lib/types"
import { PRIORITY_CONFIG } from "@/lib/types"
import { TaskCard } from "./task-card"

interface PrioritySectionProps {
  priority: Priority
  tasks: Task[]
  onToggleStatus: (taskId: string) => void
  onEditTask: (task: Task) => void
}

export function PrioritySection({
  priority,
  tasks,
  onToggleStatus,
  onEditTask,
}: PrioritySectionProps) {
  const config = PRIORITY_CONFIG[priority]

  if (tasks.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold",
            config.bg,
            config.color
          )}
        >
          {config.label}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {config.description}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.task_id}
            task={task}
            onToggleStatus={onToggleStatus}
            onEdit={onEditTask}
          />
        ))}
      </div>
    </section>
  )
}
