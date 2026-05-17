export type Plan = 'trial' | 'free' | 'solo' | 'pro'
export type OutreachStatus = 'sent' | 'replied' | 'booked' | 'closed' | 'ghosted'
export type TransactionType = 'income' | 'expense'
export type EnergyLevel = 'low' | 'medium' | 'high' | 'peak'

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  timezone: string
  plan: Plan
  onboarding_completed: boolean
  trial_ends_at: string | null
  ai_calls_this_week: number
  ai_calls_reset_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  day_score: number | null
  notes: string | null
  overall_completion: number
  created_at: string
  updated_at: string
}

export interface QuickLog {
  id: string
  user_id: string
  log_date: string
  content: string
  category: string
  logged_at: string
}

export interface Prayer {
  id: string
  user_id: string
  prayer_date: string
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
  quran_pages: number
  reflection: string | null
  created_at: string
  updated_at: string
}

export interface GymSession {
  id: string
  user_id: string
  session_date: string
  session_type: string | null
  key_lifts: string | null
  duration_minutes: number | null
  calories_burned: number | null
  energy_level: EnergyLevel | null
  body_weight: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OutreachLead {
  id: string
  user_id: string
  company_name: string
  contact_name: string | null
  platform: string | null
  status: OutreachStatus
  notes: string | null
  last_contacted_at: string
  created_at: string
  updated_at: string
}

export interface FinanceTransaction {
  id: string
  user_id: string
  transaction_date: string
  type: TransactionType
  category: string | null
  amount: number
  currency: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  target_frequency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  completion_date: string
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string
  week_end: string
  intent: string | null
  wins: string | null
  losses: string | null
  lessons: string | null
  next_week_move: string | null
  ai_debrief: string | null
  created_at: string
  updated_at: string
}

export interface Relationship {
  id: string
  user_id: string
  name: string
  relationship_type: string | null
  status_note: string | null
  last_contacted: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LearningLog {
  id: string
  user_id: string
  log_date: string
  topic: string
  resource: string | null
  minutes: number | null
  pages_read: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DietLog {
  id: string
  user_id: string
  log_date: string
  meal_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  water_liters: number
  meal_time: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface QuittingTracker {
  id: string
  user_id: string
  name: string
  start_date: string
  last_reset_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MirrorEntry {
  id: string
  user_id: string
  entry_date: string
  question: string
  ai_response: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: Plan
  status: string
  current_period_end: string | null
  created_at: string
  updated_at: string
}
