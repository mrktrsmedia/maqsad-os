'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate } from '@/lib/dates'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  company_name: string
  contact_name: string | null
  platform: string
  status: string
  notes: string | null
  last_contacted_at: string | null
  created_at: string
}

const STATUSES = ['sent', 'replied', 'booked', 'closed', 'ghosted', 'follow_up']
const PLATFORMS = ['LinkedIn', 'Email', 'Twitter/X', 'Instagram', 'WhatsApp', 'Cold Call', 'Referral', 'Other']

const STATUS_META: Record<string, { label: string; color: string }> = {
  sent:       { label: 'SENT',       color: '#5c8fd4' },
  replied:    { label: 'REPLIED',    color: '#c8a97e' },
  booked:     { label: 'BOOKED',     color: '#9b6fd4' },
  closed:     { label: 'CLOSED',     color: '#5cb88a' },
  ghosted:    { label: 'GHOSTED',    color: '#3a3845' },
  follow_up:  { label: 'FOLLOW UP',  color: '#d47c3a' },
}

export default function OutreachModule() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    platform: 'LinkedIn',
    status: 'sent',
    notes: '',
  })

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('outreach_leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setLeads(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const resetForm = () => setForm({ company_name: '', contact_name: '', platform: 'LinkedIn', status: 'sent', notes: '' })

  async function saveLead() {
    if (!form.company_name.trim()) { toast.error('Company name required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      company_name: form.company_name,
      contact_name: form.contact_name || null,
      platform: form.platform,
      status: form.status,
      notes: form.notes || null,
      last_contacted_at: new Date().toISOString(),
    }

    let error
    if (editingLead) {
      ({ error } = await supabase.from('outreach_leads').update(payload).eq('id', editingLead.id))
    } else {
      ({ error } = await supabase.from('outreach_leads').insert(payload))
    }

    if (error) { toast.error('Failed to save lead'); return }
    toast.success(editingLead ? 'Lead updated' : 'Lead added')
    setShowForm(false)
    setEditingLead(null)
    resetForm()
    fetchLeads()
  }

  async function deleteLead(id: string) {
    const { error } = await supabase.from('outreach_leads').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Lead deleted')
    fetchLeads()
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('outreach_leads').update({ status, last_contacted_at: new Date().toISOString() }).eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
      toast.success('Status updated')
    }
  }

  function openEdit(lead: Lead) {
    setForm({
      company_name: lead.company_name,
      contact_name: lead.contact_name || '',
      platform: lead.platform,
      status: lead.status,
      notes: lead.notes || '',
    })
    setEditingLead(lead)
    setShowForm(true)
  }

  const filtered = leads.filter(l => {
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    const matchSearch = !searchQuery ||
      l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const statusCounts: Record<string, number> = {}
  leads.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1 })

  const todayLeads = leads.filter(l => {
    if (!l.last_contacted_at) return false
    return l.last_contacted_at.split('T')[0] === today()
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING OUTREACH...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {STATUSES.map(status => {
          const meta = STATUS_META[status]
          const count = statusCounts[status] || 0
          return (
            <button key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`os-card text-center cursor-pointer transition-all ${filterStatus === status ? 'border-[var(--accent-dim)]' : ''}`}
            >
              <div className="text-[8px] tracking-widest mb-1" style={{ color: meta.color }}>{meta.label}</div>
              <div className="text-xl font-bold font-['Syne']" style={{ color: meta.color }}>{count}</div>
            </button>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="os-card flex items-center gap-6 flex-wrap">
        <div>
          <span className="text-[9px] text-[var(--text-muted)] tracking-widest">TOTAL LEADS </span>
          <span className="text-[var(--accent)] font-bold">{leads.length}</span>
        </div>
        <div>
          <span className="text-[9px] text-[var(--text-muted)] tracking-widest">TODAY'S OUTREACH </span>
          <span className="text-[var(--green)] font-bold">{todayLeads.length}</span>
        </div>
        <div>
          <span className="text-[9px] text-[var(--text-muted)] tracking-widest">CLOSE RATE </span>
          <span className="text-[var(--gold)] font-bold">
            {leads.length > 0 ? Math.round(((statusCounts['closed'] || 0) / leads.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Header + Search */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="os-section-title">
            LEADS {filterStatus !== 'all' && `- ${STATUS_META[filterStatus]?.label}`}
          </h2>
          <span className="text-[9px] text-[var(--text-muted)]">{filtered.length} shown</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search company or contact..." className="os-input flex-1 md:w-48 text-xs" />
          <button onClick={() => { resetForm(); setEditingLead(null); setShowForm(true) }} className="os-btn whitespace-nowrap">
            + ADD LEAD
          </button>
        </div>
      </div>

      {showForm && (
        <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
          <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
            {editingLead ? 'EDIT LEAD' : 'ADD LEAD'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">COMPANY *</label>
              <input type="text" value={form.company_name}
                onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                placeholder="Acme Corp" className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">CONTACT NAME</label>
              <input type="text" value={form.contact_name}
                onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                placeholder="John Smith" className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">PLATFORM</label>
              <select value={form.platform}
                onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                className="os-input w-full">
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">STATUS</label>
              <select value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="os-input w-full">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES</label>
            <textarea value={form.notes} rows={2}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Context, talking points, next steps..." className="os-input w-full resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveLead} className="os-btn">SAVE</button>
            <button onClick={() => { setShowForm(false); setEditingLead(null); resetForm() }}
              className="os-btn opacity-50">CANCEL</button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {filtered.length === 0 ? (
        <div className="os-card text-center py-12">
          <div className="text-3xl mb-3">📬</div>
          <div className="text-[var(--text-muted)] text-xs">
            {leads.length === 0 ? 'No leads yet. Start tracking your outreach.' : 'No leads match this filter.'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(lead => {
            const meta = STATUS_META[lead.status] || STATUS_META['sent']
            return (
              <div key={lead.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-bold text-xs text-[var(--text)] font-['Syne']">{lead.company_name}</span>
                      {lead.contact_name && (
                        <span className="text-[10px] text-[var(--text-muted)]">{lead.contact_name}</span>
                      )}
                      <span className="text-[8px] px-2 py-0.5 rounded-full font-bold"
                        style={{ color: meta.color, backgroundColor: meta.color + '20' }}>
                        {meta.label}
                      </span>
                      <span className="text-[9px] text-[var(--text-dim)]">{lead.platform}</span>
                    </div>
                    {lead.notes && (
                      <div className="text-[10px] text-[var(--text-dim)] mb-1">{lead.notes}</div>
                    )}
                    <div className="text-[8px] text-[var(--text-dim)]">
                      Added {formatDate(lead.created_at.split('T')[0])}
                      {lead.last_contacted_at && ` · Contacted ${formatDate(lead.last_contacted_at.split('T')[0])}`}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <select
                      value={lead.status}
                      onChange={e => updateStatus(lead.id, e.target.value)}
                      className="text-[8px] bg-[var(--surface2)] border border-[var(--border)] rounded px-1 py-1 text-[var(--text-muted)]"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(lead)}
                        className="text-[8px] text-[var(--text-muted)] hover:text-[var(--accent)] px-1.5 py-1 border border-[var(--border)] rounded">
                        EDIT
                      </button>
                      <button onClick={() => deleteLead(lead.id)}
                        className="text-[8px] text-[var(--text-muted)] hover:text-[var(--red)] px-1.5 py-1 border border-[var(--border)] rounded">
                        DEL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
