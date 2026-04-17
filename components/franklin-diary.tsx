"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, BookOpen, Loader2 } from "lucide-react"
import type { Task, Status, Priority } from "@/lib/types"
import { DateNavigator } from "./date-navigator"
import { FilterTabs } from "./filter-tabs"
import { PrioritySection } from "./priority-section"
import { TaskModal } from "./task-modal"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

type FilterOption = "all" | Status

export function FranklinDiary() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(
    dayjs().tz("Asia/Seoul").format("YYYY-MM-DD")
  )
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to load tasks", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter tasks by date and status
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const dateMatch = task.date === selectedDate
      const statusMatch =
        activeFilter === "all" || task.status === activeFilter
      return dateMatch && statusMatch
    })
  }, [tasks, selectedDate, activeFilter])

  // Group tasks by priority
  const groupedTasks = useMemo(() => {
    const groups: Record<Priority, Task[]> = { A: [], B: [], C: [] }
    filteredTasks.forEach((task) => {
      groups[task.priority].push(task)
    })
    // Sort by status (todo first, then in-progress, then done)
    const statusOrder: Status[] = ["todo", "in-progress", "done"]
    Object.keys(groups).forEach((key) => {
      groups[key as Priority].sort(
        (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      )
    })
    return groups
  }, [filteredTasks])

  // Count tasks for filter tabs
  const counts = useMemo(() => {
    const dateTasks = tasks.filter((t) => t.date === selectedDate)
    return {
      all: dateTasks.length,
      todo: dateTasks.filter((t) => t.status === "todo").length,
      "in-progress": dateTasks.filter((t) => t.status === "in-progress").length,
      done: dateTasks.filter((t) => t.status === "done").length,
    }
  }, [tasks, selectedDate])

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.task_id === taskId)
    if (!task) return

    const newStatus: Status = task.status === "done" ? "todo" : "done"
    const updated_at = dayjs().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
    
    setTasks((prev) =>
      prev.map((t) =>
        t.task_id === taskId ? { ...t, status: newStatus, updated_at } : t
      )
    )

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, updated_at }),
      })
    } catch (error) {
      console.error("Failed to update status", error)
      fetchTasks()
    }
  }

  const handleSaveTask = async (task: Task) => {
    const isNew = !tasks.find((t) => t.task_id === task.task_id)
    
    setTasks((prev) => {
      if (!isNew) {
        return prev.map((t) => (t.task_id === task.task_id ? task : t))
      }
      return [...prev, task]
    })

    try {
      if (isNew) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        })
      } else {
        await fetch(`/api/tasks/${task.task_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        })
      }
    } catch (error) {
      console.error("Failed to save task", error)
      fetchTasks()
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.task_id !== taskId))
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
    } catch (error) {
      console.error("Failed to delete task", error)
      fetchTasks()
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const hasAnyTasks = filteredTasks.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">데이터를 불러오는 중입니다...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Franklin Diary
              </span>
            </div>
            <button
              onClick={handleAddTask}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <DateNavigator
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Filter Tabs */}
        <div className="mb-6">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
        </div>

        {/* Task List */}
        {hasAnyTasks ? (
          <div className="space-y-8">
            <PrioritySection
              priority="A"
              tasks={groupedTasks.A}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleEditTask}
            />
            <PrioritySection
              priority="B"
              tasks={groupedTasks.B}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleEditTask}
            />
            <PrioritySection
              priority="C"
              tasks={groupedTasks.C}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleEditTask}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">할 일이 없습니다</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              새로운 할 일을 추가해보세요
            </p>
            <button
              onClick={handleAddTask}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              할 일 추가
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={handleAddTask}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 transition-transform sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
