-- ============================================================
-- Maqsad Life OS — 001_initial_schema.sql
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial','free','solo','pro')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMPTZ,
  ai_calls_this_week INTEGER DEFAULT 0,
  ai_calls_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DAILY LOGS ──────────────────────────────────────────────
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  day_score INTEGER CHECK (day_score >= 0 AND day_score <= 100),
  notes TEXT,
  overall_completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);

-- ─── QUICK LOGS ──────────────────────────────────────────────
CREATE TABLE quick_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_quick_logs_user_date ON quick_logs(user_id, log_date DESC);

-- ─── PRAYERS ─────────────────────────────────────────────────
CREATE TABLE prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_date DATE NOT NULL,
  fajr BOOLEAN DEFAULT FALSE,
  dhuhr BOOLEAN DEFAULT FALSE,
  asr BOOLEAN DEFAULT FALSE,
  maghrib BOOLEAN DEFAULT FALSE,
  isha BOOLEAN DEFAULT FALSE,
  quran_pages INTEGER DEFAULT 0,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prayer_date)
);
CREATE INDEX idx_prayers_user_date ON prayers(user_id, prayer_date DESC);

-- ─── GYM SESSIONS ────────────────────────────────────────────
CREATE TABLE gym_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type TEXT,
  key_lifts TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  energy_level TEXT CHECK (energy_level IN ('low','medium','high','peak')),
  body_weight NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_gym_sessions_user_date ON gym_sessions(user_id, session_date DESC);

-- ─── PERSONAL RECORDS ────────────────────────────────────────
CREATE TABLE personal_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lift_name     TEXT NOT NULL,
  weight_kg     NUMERIC(6,2) NOT NULL DEFAULT 0,
  reps          INTEGER NOT NULL DEFAULT 1,
  date_achieved DATE NOT NULL DEFAULT CURRENT_DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_prs_user ON personal_records(user_id, lift_name);

-- ─── OUTREACH LEADS ──────────────────────────────────────────
CREATE TABLE outreach_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  platform TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','replied','booked','closed','ghosted')),
  notes TEXT,
  last_contacted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_outreach_user_status ON outreach_leads(user_id, status);
CREATE INDEX idx_outreach_user_date ON outreach_leads(user_id, created_at DESC);

-- ─── FINANCE TRANSACTIONS ────────────────────────────────────
CREATE TABLE finance_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_finance_user_date ON finance_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_finance_user_type ON finance_transactions(user_id, type);

-- ─── HABITS ──────────────────────────────────────────────────
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#c8a97e',
  target_frequency TEXT DEFAULT 'daily',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_habits_user ON habits(user_id, is_active);

CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, completion_date)
);
CREATE INDEX idx_habit_completions_user ON habit_completions(user_id, completion_date DESC);

-- ─── WEEKLY REVIEWS ──────────────────────────────────────────
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  intent TEXT,
  wins TEXT,
  losses TEXT,
  lessons TEXT,
  next_week_move TEXT,
  ai_debrief TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);
CREATE INDEX idx_weekly_reviews_user ON weekly_reviews(user_id, week_start DESC);

-- ─── RELATIONSHIPS ───────────────────────────────────────────
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship_type TEXT,
  status_note TEXT,
  last_contacted DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_relationships_user ON relationships(user_id);

-- ─── LEARNING LOGS ───────────────────────────────────────────
CREATE TABLE learning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  topic TEXT NOT NULL,
  resource TEXT,
  minutes INTEGER,
  pages_read INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_learning_user_date ON learning_logs(user_id, log_date DESC);

-- ─── DIET LOGS ───────────────────────────────────────────────
CREATE TABLE diet_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_name TEXT NOT NULL,
  calories INTEGER DEFAULT 0,
  protein_g INTEGER DEFAULT 0,
  carbs_g INTEGER DEFAULT 0,
  fat_g INTEGER DEFAULT 0,
  water_liters NUMERIC(4,2) DEFAULT 0,
  meal_time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_diet_user_date ON diet_logs(user_id, log_date DESC);

-- ─── QUITTING TRACKERS ───────────────────────────────────────
CREATE TABLE quitting_trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reset_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_quitting_user ON quitting_trackers(user_id);

-- ─── MIRROR ENTRIES ──────────────────────────────────────────
CREATE TABLE mirror_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  question TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_mirror_user_date ON mirror_entries(user_id, created_at DESC);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'trial',
  status TEXT DEFAULT 'trialing',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_customer_id);

-- ─── TRIGGER: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','daily_logs','prayers','gym_sessions','outreach_leads',
    'finance_transactions','habits','weekly_reviews','relationships',
    'learning_logs','diet_logs','quitting_trackers','subscriptions'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END $$;

-- ─── TRIGGER: create profile on signup ───────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), '[^a-z0-9]', '', 'g')),
    NOW() + INTERVAL '7 days'
  );
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'trial', 'trialing');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
