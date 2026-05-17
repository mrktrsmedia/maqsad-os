'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Plan {
  name: string
  priceId?: string
  cta: string
  color: string
  highlight: boolean
  href?: string
}

export default function CheckoutButton({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleClick() {
    if (!plan.priceId) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId }),
      })
      const data = await res.json()

      if (res.status === 401) {
        // Not logged in - send to signup then back to pricing
        router.push('/signup?redirect=/pricing')
        return
      }

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3 rounded-lg border text-xs font-bold tracking-widest transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          borderColor: plan.color,
          color: plan.highlight ? '#0a0a0b' : plan.color,
          backgroundColor: plan.highlight ? plan.color : 'transparent',
        }}
      >
        {loading ? 'REDIRECTING...' : plan.cta}
      </button>
      {error && (
        <p className="text-[10px] text-red-400 text-center tracking-wide">{error}</p>
      )}
    </div>
  )
}
