/*
# Create YouTube_Summary Table

## Summary
Creates the core data table for the YouTube Summary web app. This is a single-tenant
(no authentication) app where all users share the same data store.

## New Tables

### `youtube_summary`
Stores AI-generated summaries of YouTube videos, with user notes and categorization.

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key, auto-generated |
| youtube_url | text | The original YouTube video URL |
| video_title | text | Title of the YouTube video (AI-populated) |
| channel_name | text | YouTube channel name (AI-populated) |
| summary_3line | text | 3-line bullet summary (AI-generated, newline-separated) |
| summary_full | text | Full detailed summary (AI-generated) |
| keywords | text | Comma-separated keywords (AI-generated) |
| category | text | User-assigned category label |
| is_favorite | boolean | Whether the user has favorited this summary |
| memo | text | Free-form user notes |
| created_at | timestamptz | Timestamp of creation |

## Security
- RLS enabled on `youtube_summary`.
- Single-tenant app with no authentication — both `anon` and `authenticated` roles
  get full CRUD access via `USING (true)` / `WITH CHECK (true)`.
- This is intentional: data is shared across all browser sessions (public/demo app).
*/

CREATE TABLE IF NOT EXISTS youtube_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url text NOT NULL,
  video_title text,
  channel_name text,
  summary_3line text,
  summary_full text,
  keywords text,
  category text,
  is_favorite boolean NOT NULL DEFAULT false,
  memo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE youtube_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_youtube_summary" ON youtube_summary;
CREATE POLICY "anon_select_youtube_summary" ON youtube_summary FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_youtube_summary" ON youtube_summary;
CREATE POLICY "anon_insert_youtube_summary" ON youtube_summary FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_youtube_summary" ON youtube_summary;
CREATE POLICY "anon_update_youtube_summary" ON youtube_summary FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_youtube_summary" ON youtube_summary;
CREATE POLICY "anon_delete_youtube_summary" ON youtube_summary FOR DELETE
  TO anon, authenticated USING (true);
