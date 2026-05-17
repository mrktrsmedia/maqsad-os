import type { Plan } from '@/types/database.types'

export const PLAN_LIMITS = {
  trial:  { aiCallsPerWeek: 2,  modules: 'basic' },
  free:   { aiCallsPerWeek: 1,  modules: 'basic' },
  solo:   { aiCallsPerWeek: 10, modules: 'full'  },
  pro:    { aiCallsPerWeek: 30, modules: 'full'  },
} as const

export function canUseAI(plan: Plan, aiCallsThisWeek: number): boolean {
  return aiCallsThisWeek < PLAN_LIMITS[plan].aiCallsPerWeek
}

export function hasFullAccess(plan: Plan): boolean {
  return plan === 'solo' || plan === 'pro'
}

export function getRemainingAICalls(plan: Plan, aiCallsThisWeek: number): number {
  return Math.max(0, PLAN_LIMITS[plan].aiCallsPerWeek - aiCallsThisWeek)
}

export const STRIPE_PLANS = {
  solo: { name: 'Solo', price: '$19/mo', priceId: process.env.STRIPE_SOLO_PRICE_ID },
  pro:  { name: 'Pro',  price: '$39/mo', priceId: process.env.STRIPE_PRO_PRICE_ID  },
}
