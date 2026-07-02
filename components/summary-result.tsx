'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Heart, ChevronDown } from 'lucide-react';
import type { YoutubeSummary } from '@/lib/types';

interface SummaryResultProps {
  summary: YoutubeSummary;
  onFavoriteToggle: (id: string, value: boolean) => Promise<void>;
  onMemoChange: (id: string, memo: string) => Promise<void>;
  onCategoryChange: (id: string, category: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

type TabKey = 'three' | 'full' | 'keywords';

const CATEGORY_OPTIONS = ['기술', '비즈니스', '교육', '엔터테인먼트', '과학', '건강', '여행', '요리', '기타'];

export function SummaryResult({
  summary,
  onFavoriteToggle,
  onMemoChange,
  onCategoryChange,
  onDelete,
}: SummaryResultProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('three');
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [memo, setMemo] = useState(summary.memo ?? '');
  const [memoTimer, setMemoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const keywords = summary.keywords
    ? summary.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

  const threeLines = summary.summary_3line
    ? summary.summary_3line.split('\n').filter(Boolean)
    : [];

  function handleFavorite() {
    setHeartAnimating(true);
    onFavoriteToggle(summary.id, !summary.is_favorite);
    setTimeout(() => setHeartAnimating(false), 400);
  }

  function handleMemo(value: string) {
    setMemo(value);
    if (memoTimer) clearTimeout(memoTimer);
    const t = setTimeout(() => {
      onMemoChange(summary.id, value);
    }, 600);
    setMemoTimer(t);
  }

  function handleCategory(cat: string) {
    onCategoryChange(summary.id, cat);
    setShowCategoryDropdown(false);
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'three', label: '3줄 요약' },
    { key: 'full', label: '전체 요약' },
    { key: 'keywords', label: '핵심 키워드' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card card-shadow overflow-hidden fade-in-up">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2
              className="font-bold leading-tight text-[22px] md:text-[28px] text-foreground line-clamp-2"
              style={{ lineHeight: 1.3 }}
            >
              {summary.video_title ?? '제목 없음'}
            </h2>
            <p className="mt-1 text-[13px] font-medium text-muted-foreground">
              {summary.channel_name ?? ''}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            {/* Category */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
              >
                <span>{summary.category ?? '카테고리'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute right-0 top-9 z-30 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategory(cat)}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent',
                        summary.category === cat && 'text-[#FF0000] font-medium'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite */}
            <button
              onClick={handleFavorite}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                summary.is_favorite
                  ? 'bg-[#FF0000]/10 text-[#FF0000]'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <Heart
                className={cn(
                  'w-4 h-4 transition-all',
                  summary.is_favorite && 'fill-current',
                  heartAnimating && 'heart-animate'
                )}
              />
            </button>

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => onDelete(summary.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-secondary rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === 'three' && (
          <ol className="space-y-3">
            {threeLines.length > 0 ? (
              threeLines.map((line, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF0000]/10 text-[#FF0000] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-[16px] leading-[1.6] text-foreground">{line}</span>
                </li>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">요약 내용이 없습니다.</p>
            )}
          </ol>
        )}

        {activeTab === 'full' && (
          <p
            className="text-[16px] text-foreground whitespace-pre-wrap"
            style={{ lineHeight: 1.6 }}
          >
            {summary.summary_full ?? '전체 요약 내용이 없습니다.'}
          </p>
        )}

        {activeTab === 'keywords' && (
          <div className="flex flex-wrap gap-2">
            {keywords.length > 0 ? (
              keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground text-[13px] font-medium rounded-full border border-border"
                >
                  {kw}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">키워드가 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {/* Memo */}
      <div className="px-5 pb-5">
        <div className="relative">
          <textarea
            value={memo}
            onChange={(e) => handleMemo(e.target.value)}
            placeholder="메모를 입력하세요..."
            rows={3}
            className="w-full resize-none bg-secondary/60 border border-border rounded-xl px-4 py-3 text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FF0000]/30 focus:border-[#FF0000]/50 transition-all duration-200"
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>
    </div>
  );
}
