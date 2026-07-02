export interface YoutubeSummary {
  id: string;
  youtube_url: string;
  video_title: string | null;
  channel_name: string | null;
  summary_3line: string | null;
  summary_full: string | null;
  keywords: string | null;
  category: string | null;
  is_favorite: boolean;
  memo: string | null;
  created_at: string;
}

export type YoutubeSummaryInsert = Omit<YoutubeSummary, 'id' | 'created_at'>;
