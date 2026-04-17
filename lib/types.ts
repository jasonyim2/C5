export type Priority = "A" | "B" | "C"
export type Status = "todo" | "in-progress" | "done"
export type Category = "업무" | "개인" | "미팅" | "기타"

export interface Task {
  task_id: string
  date: string // YYYY-MM-DD
  cutoff_date: string // YYYY-MM-DD
  title: string
  priority: Priority
  status: Status
  due_time: string // HH:mm
  category: Category
  created_at: string // YYYY-MM-DD HH:mm:ss (KST)
  updated_at: string // YYYY-MM-DD HH:mm:ss (KST)
}

export const PRIORITY_CONFIG = {
  A: {
    label: "A",
    description: "중요하고 긴급함",
    color: "text-priority-a",
    bg: "bg-priority-a-bg",
    border: "border-priority-a/20",
  },
  B: {
    label: "B", 
    description: "중요하지만 긴급하지 않음",
    color: "text-priority-b",
    bg: "bg-priority-b-bg",
    border: "border-priority-b/20",
  },
  C: {
    label: "C",
    description: "긴급하지 않음",
    color: "text-muted-foreground",
    bg: "bg-priority-c-bg",
    border: "border-border",
  },
} as const

export const CATEGORY_OPTIONS: Category[] = ["업무", "개인", "미팅", "기타"]

export const STATUS_OPTIONS = [
  { value: "todo", label: "할 일" },
  { value: "in-progress", label: "진행 중" },
  { value: "done", label: "완료" },
] as const
