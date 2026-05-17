-- ============================================================
-- Maqsad Life OS — 003_supplements.sql
-- Safe idempotent additions: triggers + missing columns
-- Run AFTER 001 and 002
-- ============================================================

-- ─── updated_at auto-trigger function ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that have the column
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'daily_logs', 'prayers', 'gym_sessions', 'personal_records',
    'outreach_leads', 'finance_transactions', 'habits', 'weekly_reviews',
    'relationships', 'learning_logs', 'diet_logs', 'quitting_trackers', 'subscriptions'
  ] LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- ─── Ensure quick_logs has logged_at column (category added if missing) ────
ALTER TABLE quick_logs
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'note',
  ADD COLUMN IF NOT EXISTS logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── Mirror entries: add updated_at if missing ──────────────────────────────
ALTER TABLE mirror_entries
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── Ensure all columns exist (safe re-run guard) ───────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_calls_this_week  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_calls_reset_at   TIMESTAMPTZ;

ALTER TABLE quick_logs
  ADD COLUMN IF NOT EXISTS category  TEXT NOT NULL DEFAULT 'note',
  ADD COLUMN IF NOT EXISTS logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
