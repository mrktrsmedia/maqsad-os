'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate } from '@/lib/dates'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  transaction_date: string
  type: 'income' | 'expense' | 'transfer'
  category: string
  amount: number
  currency: string
  description: string | null
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Client Payment', 'Investment', 'Business', 'Side Income', 'Other'],
  expense: ['Food', 'Rent', 'Transport', 'Subscriptions', 'Utilities', 'Marketing', 'Health', 'Education', 'Entertainment', 'Clothing', 'Software', 'Other'],
  transfer: ['Savings', 'Investment', 'Other'],
}

const TYPE_COLOR: Record<string, string> = {
  income: '#5cb88a',
  expense: '#d45c5c',
  transfer: '#5c8fd4',
}

export default function FinanceModule() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const [form, setForm] = useState({
    transaction_date: today(),
    type: 'expense' as 'income' | 'expense' | 'transfer',
    category: 'Food',
    amount: '',
    currency: 'USD',
    description: '',
  })

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [year, month] = viewMonth.split('-')
    const start = `${year}-${month}-01`
    const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('finance_transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', start)
      .lte('transaction_date', end)
      .order('transaction_date', { ascending: false })

    if (data) setTransactions(data as Transaction[])
    setLoading(false)
  }, [supabase, viewMonth])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const resetForm = () => setForm({
    transaction_date: today(), type: 'expense', category: 'Food', amount: '', currency: 'USD', description: '',
  })

  async function saveTx() {
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Valid amount required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      transaction_date: form.transaction_date,
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount),
      currency: form.currency,
      description: form.description || null,
    }

    let error
    if (editingTx) {
      ({ error } = await supabase.from('finance_transactions').update(payload).eq('id', editingTx.id))
    } else {
      ({ error } = await supabase.from('finance_transactions').insert(payload))
    }

    if (error) { toast.error('Failed to save'); return }
    toast.success(editingTx ? 'Transaction updated' : 'Transaction added')
    setShowForm(false)
    setEditingTx(null)
    resetForm()
    fetchTransactions()
  }

  async function deleteTx(id: string) {
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Transaction deleted')
    fetchTransactions()
  }

  function openEdit(tx: Transaction) {
    setForm({
      transaction_date: tx.transaction_date,
      type: tx.type,
      category: tx.category,
      amount: tx.amount.toString(),
      currency: tx.currency,
      description: tx.description || '',
    })
    setEditingTx(tx)
    setShowForm(true)
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const profit = totalIncome - totalExpenses

  // Category breakdown for expenses
  const expenseByCategory: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
  })
  const topCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const filtered = transactions.filter(t => filterType === 'all' || t.type === filterType)

  function changeMonth(delta: number) {
    const [year, month] = viewMonth.split('-').map(Number)
    const d = new Date(year, month - 1 + delta, 1)
    setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING FINANCE DATA...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Month Navigator */}
      <div className="flex items-center gap-4">
        <button onClick={() => changeMonth(-1)} className="text-[9px] text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-1.5 border border-[var(--border)] rounded">← PREV</button>
        <div className="text-[10px] text-[var(--text-muted)] tracking-widest">
          {new Date(viewMonth + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
        </div>
        <button onClick={() => changeMonth(1)} className="text-[9px] text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-1.5 border border-[var(--border)] rounded">NEXT →</button>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">INCOME</div>
          <div className="text-2xl font-bold text-[var(--green)] font-['Syne']">
            {totalIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">EXPENSES</div>
          <div className="text-2xl font-bold text-[var(--red)] font-['Syne']">
            {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">PROFIT</div>
          <div className={`text-2xl font-bold font-['Syne'] ${profit >= 0 ? 'text-[var(--accent)]' : 'text-[var(--red)]'}`}>
            {profit.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="os-card">
          <div className="text-[10px] text-[var(--text-muted)] tracking-widest mb-4">TOP EXPENSE CATEGORIES</div>
          <div className="space-y-3">
            {topCategories.map(([cat, amount]) => {
              const pct = Math.round((amount / totalExpenses) * 100)
              return (
                <div key={cat}>
                  <div className="flex justify-between text-[9px] text-[var(--text-muted)] mb-1">
                    <span>{cat.toUpperCase()}</span>
                    <span>{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-[var(--surface2)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--red)] opacity-70 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1 p-1 bg-[var(--surface2)] rounded-lg">
            {(['all', 'income', 'expense', 'transfer'] as const).map(type => (
              <button key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-[9px] tracking-widest rounded-md transition-all ${
                  filterType === type ? 'bg-[var(--accent)] text-[#0a0a0b] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}>
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={() => { resetForm(); setEditingTx(null); setShowForm(true) }} className="os-btn">
            + ADD TRANSACTION
          </button>
        </div>

        {showForm && (
          <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
            <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
              {editingTx ? 'EDIT TRANSACTION' : 'ADD TRANSACTION'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">DATE</label>
                <input type="date" value={form.transaction_date}
                  onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))}
                  className="os-input w-full" />
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">TYPE</label>
                <select value={form.type}
                  onChange={e => {
                    const type = e.target.value as typeof form.type
                    setForm(p => ({ ...p, type, category: CATEGORIES[type][0] }))
                  }}
                  className="os-input w-full">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">CATEGORY</label>
                <select value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="os-input w-full">
                  {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">AMOUNT (USD)</label>
                <input type="number" step="0.01" value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00" className="os-input w-full" />
              </div>
              <div className="col-span-2">
                <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">DESCRIPTION</label>
                <input type="text" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What was this for?" className="os-input w-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveTx} className="os-btn">SAVE</button>
              <button onClick={() => { setShowForm(false); setEditingTx(null); resetForm() }}
                className="os-btn opacity-50">CANCEL</button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="os-card text-center py-12">
            <div className="text-3xl mb-3">💰</div>
            <div className="text-[var(--text-muted)] text-xs">No transactions for this period</div>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(tx => (
              <div key={tx.id} className="os-card py-3 group hover:border-[var(--border-bright)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLOR[tx.type] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text)]">
                        {tx.description || tx.category}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: TYPE_COLOR[tx.type], backgroundColor: TYPE_COLOR[tx.type] + '20' }}>
                        {tx.category}
                      </span>
                    </div>
                    <div className="text-[9px] text-[var(--text-dim)]">{formatDate(tx.transaction_date)}</div>
                  </div>
                  <div className={`font-bold text-sm font-['Syne'] ${tx.type === 'income' ? 'text-[var(--green)]' : tx.type === 'expense' ? 'text-[var(--red)]' : 'text-[var(--blue)]'}`}>
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {tx.amount.toLocaleString('en-US', { style: 'currency', currency: tx.currency, minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(tx)}
                      className="text-[9px] text-[var(--text-muted)] hover:text-[var(--accent)] px-2 py-1 border border-[var(--border)] rounded">EDIT</button>
                    <button onClick={() => deleteTx(tx.id)}
                      className="text-[9px] text-[var(--text-muted)] hover:text-[var(--red)] px-2 py-1 border border-[var(--border)] rounded">DEL</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
