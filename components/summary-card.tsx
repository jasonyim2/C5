'use client';

import { Heart, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { YoutubeSummary } from '@/lib/types';
import Link from 'next/link';

interface SummaryCardProps {
  summary: YoutubeSummary;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onFavoriteToggle: (id: string, value: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SummaryCard({
  summary,
  isSelected,
  onSelect,
  onFavoriteToggle,
  onDelete,
}: SummaryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const firstLine = summary.summary_3line
    ? summary.summary_3line.split('\n')[0]
    : null;

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    setHeartAnimating(true);
    onFavoriteToggle(summary.id, !summary.is_favorite);
    setTimeout(() => setHeartAnimating(false), 400);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(summary.id);
  }

  const cardContent = (
    <div
      className={cn(
        'group relative rounded-xl border bg-card card-shadow p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5',
        isSelected
          ? 'border-[#FF0000]/50 ring-2 ring-[#FF0000]/20'
          : 'border-border hover:border-border/80 hover:shadow-md'
      )}
      onClick={() => onSelect?.(summary.id)}
    >
      {/* Context menu */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-30 min-w-[120px]">
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              삭제
            </button>
          </div>
        )}
      </div>

      <div className="pr-6">
        {summary.category && (
          <span className="inline-block mb-1.5 px-2 py-0.5 bg-[#FF0000]/8 text-[#FF0000] text-[11px] font-semibold rounded-full border border-[#FF0000]/20">
            {summary.category}
          </span>
        )}

        <h3 className="font-semibold text-[15px] leading-snug text-foreground line-clamp-2 mb-1">
          {summary.video_title ?? '제목 없음'}
        </h3>

        <p className="text-[13px] font-medium text-muted-foreground mb-2">
          {summary.channel_name ?? ''}
        </p>

        {firstLine && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
            {firstLine}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
        <span className="text-[11px] text-muted-foreground">
          {new Date(summary.created_at).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <button
          onClick={handleFavorite}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
            summary.is_favorite
              ? 'text-[#FF0000]'
              : 'text-muted-foreground hover:text-[#FF0000]'
          )}
        >
          <Heart
            className={cn(
              'w-3.5 h-3.5 transition-all',
              summary.is_favorite && 'fill-current',
              heartAnimating && 'heart-animate'
            )}
          />
        </button>
      </div>
    </div>
  );

  if (onSelect) {
    return cardContent;
  }

  return (
    <Link href={`/summary/${summary.id}`} className="block">
      {cardContent}
    </Link>
  );
}
