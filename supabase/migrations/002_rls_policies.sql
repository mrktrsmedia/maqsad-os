-- ============================================================
-- Maqsad Life OS — 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quitting_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper macro for standard user-owns-row policies
DO $$
DECLARE
  t TEXT;
  col TEXT := 'user_id';
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'daily_logs','quick_logs','prayers','gym_sessions','personal_records',
    'outreach_leads','finance_transactions','habits','habit_completions',
    'weekly_reviews','relationships','learning_logs','diet_logs',
    'quitting_trackers','mirror_entries','subscriptions'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "Users can select own %1$I" ON %1$I FOR SELECT USING (auth.uid() = %2$I)', t, col);
    EXECUTE format(
      'CREATE POLICY "Users can insert own %1$I" ON %1$I FOR INSERT WITH CHECK (auth.uid() = %2$I)', t, col);
    EXECUTE format(
      'CREATE POLICY "Users can update own %1$I" ON %1$I FOR UPDATE USING (auth.uid() = %2$I) WITH CHECK (auth.uid() = %2$I)', t, col);
    EXECUTE format(
      'CREATE POLICY "Users can delete own %1$I" ON %1$I FOR DELETE USING (auth.uid() = %2$I)', t, col);
  END LOOP;
END $$;

-- Profiles uses id not user_id
CREATE POLICY "Users can select own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
