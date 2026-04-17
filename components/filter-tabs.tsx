"use client"

import { cn } from "@/lib/utils"
import type { Status } from "@/lib/types"

type FilterOption = "all" | Status

interface FilterTabsProps {
  activeFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
  counts: {
    all: number
    todo: number
    "in-progress": number
    done: number
  }
}

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "todo", label: "할 일" },
  { value: "in-progress", label: "진행 중" },
  { value: "done", label: "완료" },
]

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
            activeFilter === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {option.label}
          <span className="ml-1.5 text-xs opacity-70">
            {counts[option.value]}
          </span>
        </button>
      ))}
    </div>
  )
}
