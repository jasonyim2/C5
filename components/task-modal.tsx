"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, Priority, Status, Category } from "@/lib/types"
import { PRIORITY_CONFIG, CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/lib/types"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

const createEmptyTask = (): Task => ({
  task_id: crypto.randomUUID(),
  date: dayjs().tz("Asia/Seoul").format("YYYY-MM-DD"),
  cutoff_date: dayjs().tz("Asia/Seoul").format("YYYY-MM-DD"),
  title: "",
  priority: "B",
  status: "todo",
  due_time: "12:00",
  category: "업무",
  created_at: dayjs().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
  updated_at: dayjs().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
})

interface TaskModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onSave: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function TaskModal({ isOpen, task, onClose, onSave, onDelete }: TaskModalProps) {
  const [formData, setFormData] = useState<Task>(createEmptyTask())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = task !== null

  useEffect(() => {
    if (task) {
      setFormData(task)
    } else {
      setFormData(createEmptyTask())
    }
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    setIsSubmitting(true)
    
    await onSave({
      ...formData,
      updated_at: dayjs().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
    })
    
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? "할 일 수정" : "새로운 할 일"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="할 일을 입력하세요"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
              autoFocus
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              우선순위
            </label>
            <div className="flex gap-2">
              {(["A", "B", "C"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={cn(
                    "flex-1 rounded-xl py-3 text-sm font-semibold transition-all",
                    formData.priority === p
                      ? cn(PRIORITY_CONFIG[p].bg, PRIORITY_CONFIG[p].color, "ring-2 ring-offset-2 ring-offset-card")
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                  style={{
                    ringColor: formData.priority === p ? `var(--priority-${p.toLowerCase()})` : undefined,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                날짜
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                시간
              </label>
              <input
                type="time"
                value={formData.due_time}
                onChange={(e) =>
                  setFormData({ ...formData, due_time: e.target.value })
                }
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
              />
            </div>
          </div>

          {/* Cutoff Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              마감일
            </label>
            <input
              type="date"
              value={formData.cutoff_date}
              onChange={(e) =>
                setFormData({ ...formData, cutoff_date: e.target.value })
              }
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
            />
          </div>

          {/* Category & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as Category,
                  })
                }
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all appearance-none"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Status,
                  })
                }
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all appearance-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task!.task_id)
                  onClose()
                }}
                className="flex h-12 w-12 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "저장"
              ) : (
                "추가"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
