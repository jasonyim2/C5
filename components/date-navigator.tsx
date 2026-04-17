"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/ko"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("ko")

export function formatDate(dateString: string) {
  return dayjs(dateString).format("YYYY년 M월 D일 dddd")
}

interface DateNavigatorProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const navigateDay = (direction: -1 | 1) => {
    const newDate = dayjs(selectedDate).add(direction, "day").format("YYYY-MM-DD")
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(dayjs().tz("Asia/Seoul").format("YYYY-MM-DD"))
  }

  const isToday = selectedDate === dayjs().tz("Asia/Seoul").format("YYYY-MM-DD")

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigateDay(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => navigateDay(1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {formatDate(selectedDate)}
        </h1>
        {!isToday && (
          <button
            onClick={goToToday}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            오늘로 이동
          </button>
        )}
      </div>

      <div className="w-[88px]" /> {/* Spacer for balance */}
    </div>
  )
}
