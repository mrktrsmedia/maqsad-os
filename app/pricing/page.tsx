export const dynamic = 'force-dynamic'

import Link from 'next/link'
import CheckoutButton from '@/components/ui/CheckoutButton'

const PLANS = [
  {
    name: 'Trial',
    price: 'Free',
    period: '7 days',
    description: 'See if Maqsad is built for you.',
    color: '#5a5865',
    features: [
      'All 13 modules',
      '2 AI reports per week',
      'Basic tracking',
      '7-day full access',
      'No credit card required',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Solo',
    price: '$19',
    period: '/month',
    description: 'For the individual who executes alone.',
    color: '#5c8fd4',
    features: [
      'Everything in Trial',
      '10 AI reports per week',
      'Weekly AI debrief',
      'Mirror insights',
      'Full historical tracking',
      'Priority support',
    ],
    cta: 'Get Solo',
    priceId: process.env.STRIPE_SOLO_PRICE_ID,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    description: 'For the operator who demands more.',
    color: '#c8a97e',
    features: [
      'Everything in Solo',
      '30 AI reports per week',
      'Advanced pattern analysis',
      'Deeper mirror insights',
      'Priority support',
      'Future team features',
    ],
    cta: 'Get Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    highlight: true,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e0]" style={{ fontFamily: "'DM Mono', monospace" }}>
      {/* Nav */}
      <nav className="border-b border-[#222228] px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#c8a97e] font-bold text-lg tracking-widest" style={{ fontFamily: "'Syne', sans-serif" }}>
          MAQSAD
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[#5a5865] hover:text-[#e8e6e0] text-xs tracking-widest transition-colors">LOGIN</Link>
          <Link href="/signup" className="border border-[#c8a97e] text-[#c8a97e] text-xs tracking-widest px-4 py-2 rounded hover:bg-[rgba(200,169,126,0.1)] transition-all">
            SIGN UP
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center py-20 px-8">
        <div className="text-[10px] text-[#5a5865] tracking-widest mb-4">PRICING</div>
        <h1 className="text-4xl font-bold text-[#e8e6e0] mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
          One System. Total Clarity.
        </h1>
        <p className="text-[#5a5865] text-sm max-w-md mx-auto">
          Start free. No credit card. Cancel anytime. Built for people who take execution seriously.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 flex flex-col ${
                plan.highlight
                  ? 'border-[#c8a97e] bg-[rgba(200,169,126,0.05)]'
                  : 'border-[#222228] bg-[#111114]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#c8a97e] text-[#0a0a0b] text-[9px] font-bold tracking-widest px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-[9px] tracking-widest mb-2" style={{ color: plan.color }}>{plan.name.toUpperCase()}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: plan.color }}>
                    {plan.price}
                  </span>
                  <span className="text-[#5a5865] text-sm">{plan.period}</span>
                </div>
                <p className="text-[#5a5865] text-xs">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#5a5865]">
                    <span style={{ color: plan.color }} className="flex-shrink-0 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.href ? (
                <Link
                  href={plan.href}
                  className="block text-center py-3 rounded-lg border text-xs font-bold tracking-widest transition-all"
                  style={{
                    borderColor: plan.color,
                    color: plan.highlight ? '#0a0a0b' : plan.color,
                    backgroundColor: plan.highlight ? plan.color : 'transparent',
                  }}
                >
                  {plan.cta}
                </Link>
              ) : (
                <CheckoutButton plan={plan} />
              )}
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mt-20">
          <div className="text-[10px] text-[#5a5865] tracking-widest text-center mb-10">FREQUENTLY ASKED</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: 'What happens after the trial?', a: 'After 7 days, you can upgrade to Solo or Pro. If you don\'t upgrade, access to the dashboard pauses.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from the billing portal. No questions asked. Your data remains for 30 days.' },
              { q: 'What is the AI Mirror?', a: 'You ask a question. The AI gets your last 7 days of data and responds with a direct, pattern-based insight. No fluff.' },
              { q: 'Is my data private?', a: 'Completely. Row-Level Security on Supabase ensures only you can see your data. We don\'t sell data.' },
            ].map(faq => (
              <div key={faq.q} className="border border-[#222228] rounded-lg p-6">
                <div className="text-xs font-bold text-[#e8e6e0] mb-2">{faq.q}</div>
                <div className="text-xs text-[#5a5865]">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
