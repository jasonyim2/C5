'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { YoutubeSummary } from '@/lib/types';
import { SummaryResult } from '@/components/summary-result';
import { SummaryResultSkeleton } from '@/components/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function SummaryDetailPage({ params }: Props) {
  const router = useRouter();
  const [summary, setSummary] = useState<YoutubeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('youtube_summary')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setSummary(data as YoutubeSummary);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleFavoriteToggle(id: string, value: boolean) {
    setSummary((p) => p ? { ...p, is_favorite: value } : p);
    await supabase.from('youtube_summary').update({ is_favorite: value }).eq('id', id);
  }

  async function handleMemoChange(id: string, memo: string) {
    setSummary((p) => p ? { ...p, memo } : p);
    await supabase.from('youtube_summary').update({ memo }).eq('id', id);
  }

  async function handleCategoryChange(id: string, category: string) {
    setSummary((p) => p ? { ...p, category } : p);
    await supabase.from('youtube_summary').update({ category }).eq('id', id);
  }

  async function handleDelete(id: string) {
    await supabase.from('youtube_summary').delete().eq('id', id);
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-semibold text-foreground text-sm line-clamp-1">
            {loading ? '불러오는 중...' : summary?.video_title ?? '요약 상세'}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <SummaryResultSkeleton />
        ) : notFound ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">요약을 찾을 수 없습니다</p>
            <p className="text-sm text-muted-foreground mb-6">이미 삭제되었거나 존재하지 않는 요약입니다.</p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#FF0000] text-white text-sm font-medium rounded-xl hover:bg-[#CC0000] transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        ) : summary ? (
          <SummaryResult
            summary={summary}
            onFavoriteToggle={handleFavoriteToggle}
            onMemoChange={handleMemoChange}
            onCategoryChange={handleCategoryChange}
            onDelete={handleDelete}
          />
        ) : null}
      </main>
    </div>
  );
}
