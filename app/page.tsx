'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { YoutubeSummary } from '@/lib/types';
import { simulateAISummary, isValidYouTubeUrl } from '@/lib/mock-ai';
import { SummaryResult } from '@/components/summary-result';
import { SummaryResultSkeleton, SummaryCardSkeleton } from '@/components/skeleton';
import { SummaryCard } from '@/components/summary-card';
import { FilterBar } from '@/components/filter-bar';
import { MobileBottomNav, DesktopNav } from '@/components/navigation';
import { Loader2, Youtube, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [loading, setLoading] = useState(false);

  const [summaries, setSummaries] = useState<YoutubeSummary[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<YoutubeSummary | null>(null);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    loadSummaries();
  }, []);

  async function loadSummaries() {
    setSummariesLoading(true);
    const { data, error } = await supabase
      .from('youtube_summary')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSummaries(data as YoutubeSummary[]);
    setSummariesLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUrlError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError('YouTube URL을 입력해 주세요.');
      return;
    }
    if (!isValidYouTubeUrl(trimmed)) {
      setUrlError('올바른 YouTube URL을 입력해 주세요. (예: https://youtube.com/watch?v=...)');
      return;
    }

    setLoading(true);
    setLatestResult(null);
    setSelectedId(null);

    try {
      const result = await simulateAISummary(trimmed);

      // 이번 단계에서는 DB 저장을 비활성화합니다.
      /*
      const { data, error } = await supabase
        .from('youtube_summary')
        .insert({
          youtube_url: trimmed,
          video_title: mock.video_title,
          channel_name: mock.channel_name,
          summary_3line: mock.summary_3line,
          summary_full: mock.summary_full,
          keywords: mock.keywords,
          category: mock.category,
          is_favorite: false,
          memo: null,
        })
        .select()
        .single();
      */

      const newSummary: YoutubeSummary = {
        id: crypto.randomUUID(), // 임시 ID 생성
        created_at: new Date().toISOString(),
        youtube_url: trimmed,
        video_title: result.video_title,
        channel_name: result.channel_name,
        summary_3line: result.summary_3line,
        summary_full: result.summary_full,
        keywords: result.keywords,
        category: result.category,
        is_favorite: false,
        memo: null,
      };

      setLatestResult(newSummary);
      setSummaries((prev) => [newSummary, ...prev]);
      setUrl('');
    } catch (err: any) {
      setUrlError(err.message || '요약 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFavoriteToggle(id: string, value: boolean) {
    setSummaries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_favorite: value } : s))
    );
    if (latestResult?.id === id) setLatestResult((p) => p ? { ...p, is_favorite: value } : p);
    await supabase.from('youtube_summary').update({ is_favorite: value }).eq('id', id);
  }

  async function handleMemoChange(id: string, memo: string) {
    await supabase.from('youtube_summary').update({ memo }).eq('id', id);
    setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, memo } : s)));
    if (latestResult?.id === id) setLatestResult((p) => p ? { ...p, memo } : p);
  }

  async function handleCategoryChange(id: string, category: string) {
    await supabase.from('youtube_summary').update({ category }).eq('id', id);
    setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, category } : s)));
    if (latestResult?.id === id) setLatestResult((p) => p ? { ...p, category } : p);
  }

  async function handleDelete(id: string) {
    await supabase.from('youtube_summary').delete().eq('id', id);
    setSummaries((prev) => prev.filter((s) => s.id !== id));
    if (latestResult?.id === id) setLatestResult(null);
    if (selectedId === id) setSelectedId(null);
  }

  const categories = useMemo(() => {
    const cats = summaries.map((s) => s.category).filter((c): c is string => !!c);
    return Array.from(new Set(cats));
  }, [summaries]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      if (showFavorites && !s.is_favorite) return false;
      if (activeCategory && s.category !== activeCategory) return false;
      return true;
    });
  }, [summaries, showFavorites, activeCategory]);

  const selectedSummary = useMemo(
    () => (selectedId ? summaries.find((s) => s.id === selectedId) ?? null : null),
    [summaries, selectedId]
  );

  const displayedResult = latestResult ?? selectedSummary;

  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />

      <div className="md:pl-[72px]">
        {/* Sticky Header with Input */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3">
            <div className="flex items-center gap-2 md:hidden mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#FF0000] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <span className="font-bold text-base text-foreground">YouTube Summarizer</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2.5">
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Youtube className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  placeholder="YouTube URL을 붙여넣으세요 (예: https://youtube.com/watch?v=...)"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-[16px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200',
                    urlError
                      ? 'border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-[#FF0000]/50 focus:ring-[#FF0000]/20'
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-[#FF0000] hover:bg-[#CC0000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-xl min-h-[48px] min-w-[120px] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '요약하기'}
              </button>
            </form>
            {urlError && (
              <p className="mt-1.5 text-[13px] text-destructive pl-1">{urlError}</p>
            )}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-10">
          {/* Result */}
          {(loading || displayedResult) && (
            <section className="mb-8">
              {loading ? (
                <SummaryResultSkeleton />
              ) : displayedResult ? (
                <SummaryResult
                  key={displayedResult.id}
                  summary={displayedResult}
                  onFavoriteToggle={handleFavoriteToggle}
                  onMemoChange={handleMemoChange}
                  onCategoryChange={handleCategoryChange}
                  onDelete={handleDelete}
                />
              ) : null}
            </section>
          )}

          {/* Saved list */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">저장된 요약</h2>
              <span className="text-sm text-muted-foreground">{filteredSummaries.length}개</span>
            </div>

            <div className="mb-4">
              <FilterBar
                categories={categories}
                activeCategory={activeCategory}
                showFavorites={showFavorites}
                onCategoryChange={setActiveCategory}
                onFavoritesToggle={() => setShowFavorites((v) => !v)}
                totalCount={summaries.length}
              />
            </div>

            {summariesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => <SummaryCardSkeleton key={i} />)}
              </div>
            ) : filteredSummaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <Youtube className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">
                  {showFavorites || activeCategory ? '해당 조건의 요약이 없습니다' : '아직 요약된 영상이 없습니다'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {showFavorites || activeCategory
                    ? '다른 필터를 선택해 보세요'
                    : '위에서 YouTube URL을 입력하고 요약을 시작해 보세요'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop: split view */}
                <div className="hidden md:flex gap-5">
                  <div className="w-80 flex-shrink-0">
                    <div className="space-y-2.5 max-h-[calc(100vh-260px)] overflow-y-auto scrollbar-none pr-1">
                      {filteredSummaries.slice(0, visibleCount).map((s) => (
                        <SummaryCard
                          key={s.id}
                          summary={s}
                          isSelected={selectedId === s.id}
                          onSelect={(id) => {
                            setSelectedId(id);
                            setLatestResult(null);
                          }}
                          onFavoriteToggle={handleFavoriteToggle}
                          onDelete={handleDelete}
                        />
                      ))}
                      {visibleCount < filteredSummaries.length && (
                        <button
                          onClick={() => setVisibleCount((v) => v + 9)}
                          className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors border border-dashed border-border rounded-xl"
                        >
                          <ChevronDown className="w-4 h-4" />
                          더보기 ({filteredSummaries.length - visibleCount}개)
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {selectedSummary ? (
                      <SummaryResult
                        key={selectedSummary.id}
                        summary={selectedSummary}
                        onFavoriteToggle={handleFavoriteToggle}
                        onMemoChange={handleMemoChange}
                        onCategoryChange={handleCategoryChange}
                        onDelete={handleDelete}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-border text-center p-8">
                        <p className="text-sm text-muted-foreground">
                          왼쪽 목록에서 카드를 선택하면<br />상세 내용이 여기에 표시됩니다
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile: single column */}
                <div className="md:hidden grid grid-cols-1 gap-3">
                  {filteredSummaries.slice(0, visibleCount).map((s) => (
                    <SummaryCard
                      key={s.id}
                      summary={s}
                      onFavoriteToggle={handleFavoriteToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                  {visibleCount < filteredSummaries.length && (
                    <button
                      onClick={() => setVisibleCount((v) => v + 9)}
                      className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-dashed border-border rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                      더보기 ({filteredSummaries.length - visibleCount}개 남음)
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
