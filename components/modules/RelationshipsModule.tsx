'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate } from '@/lib/dates'
import toast from 'react-hot-toast'

interface Relationship {
  id: string
  name: string
  relationship_type: string
  status_note: string | null
  last_contacted: string | null
  notes: string | null
}

const REL_TYPES = ['Family', 'Friend', 'Mentor', 'Client', 'Partner', 'Colleague', 'Network', 'Other']

function daysSinceContact(last: string | null): number | null {
  if (!last) return null
  const diff = new Date().getTime() - new Date(last + 'T00:00:00').getTime()
  return Math.floor(diff / 86400000)
}

function getContactColor(days: number | null): string {
  if (days === null) return '#3a3845'
  if (days <= 7) return '#5cb88a'
  if (days <= 30) return '#c8a97e'
  if (days <= 90) return '#d47c3a'
  return '#d45c5c'
}

export default function RelationshipsModule() {
  const supabase = createClient()
  const [people, setPeople] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Relationship | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [form, setForm] = useState({
    name: '',
    relationship_type: 'Friend',
    status_note: '',
    last_contacted: '',
    notes: '',
  })

  const fetchPeople = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', user.id)
      .order('last_contacted', { ascending: false, nullsFirst: false })

    if (data) setPeople(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchPeople() }, [fetchPeople])

  const resetForm = () => setForm({ name: '', relationship_type: 'Friend', status_note: '', last_contacted: '', notes: '' })

  async function savePerson() {
    if (!form.name.trim()) { toast.error('Name required'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name: form.name,
      relationship_type: form.relationship_type,
      status_note: form.status_note || null,
      last_contacted: form.last_contacted || null,
      notes: form.notes || null,
    }

    let error
    if (editingPerson) {
      ({ error } = await supabase.from('relationships').update(payload).eq('id', editingPerson.id))
    } else {
      ({ error } = await supabase.from('relationships').insert(payload))
    }

    if (error) { toast.error('Failed to save'); return }
    toast.success(editingPerson ? 'Updated' : 'Person added')
    setShowForm(false)
    setEditingPerson(null)
    resetForm()
    fetchPeople()
  }

  async function deletePerson(id: string) {
    const { error } = await supabase.from('relationships').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Removed')
    fetchPeople()
  }

  async function markContacted(id: string) {
    const { error } = await supabase.from('relationships').update({ last_contacted: today() }).eq('id', id)
    if (!error) {
      setPeople(prev => prev.map(p => p.id === id ? { ...p, last_contacted: today() } : p))
      toast.success('Marked as contacted today')
    }
  }

  function openEdit(person: Relationship) {
    setForm({
      name: person.name,
      relationship_type: person.relationship_type,
      status_note: person.status_note || '',
      last_contacted: person.last_contacted || '',
      notes: person.notes || '',
    })
    setEditingPerson(person)
    setShowForm(true)
  }

  const filtered = people.filter(p => {
    const matchType = filterType === 'all' || p.relationship_type === filterType
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchType && matchSearch
  })

  const needsFollowUp = people.filter(p => {
    const days = daysSinceContact(p.last_contacted)
    return days !== null && days > 30
  }).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[var(--text-muted)] text-xs tracking-widest">LOADING RELATIONSHIPS...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">PEOPLE TRACKED</div>
          <div className="text-2xl font-bold text-[var(--accent)] font-['Syne']">{people.length}</div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">NEED FOLLOW-UP</div>
          <div className={`text-2xl font-bold font-['Syne'] ${needsFollowUp > 0 ? 'text-[var(--warn)]' : 'text-[var(--green)]'}`}>{needsFollowUp}</div>
        </div>
        <div className="os-card text-center">
          <div className="text-[9px] text-[var(--text-muted)] tracking-widest mb-2">RECENT (7D)</div>
          <div className="text-2xl font-bold text-[var(--green)] font-['Syne']">
            {people.filter(p => { const d = daysSinceContact(p.last_contacted); return d !== null && d <= 7 }).length}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {(['all', ...REL_TYPES] as const).map(type => (
            <button key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-1 text-[8px] tracking-widest rounded border transition-all ${
                filterType === type ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-glow)]' : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}>
              {type === 'all' ? 'ALL' : type.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..." className="os-input flex-1 md:w-40 text-xs" />
          <button onClick={() => { resetForm(); setEditingPerson(null); setShowForm(true) }} className="os-btn whitespace-nowrap">
            + ADD PERSON
          </button>
        </div>
      </div>

      {showForm && (
        <div className="os-card border border-[var(--accent)] border-opacity-30 space-y-4">
          <div className="text-[10px] text-[var(--accent)] tracking-widest font-bold">
            {editingPerson ? 'EDIT PERSON' : 'ADD PERSON'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NAME *</label>
              <input type="text" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Full name" className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">TYPE</label>
              <select value={form.relationship_type}
                onChange={e => setForm(p => ({ ...p, relationship_type: e.target.value }))}
                className="os-input w-full">
                {REL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">LAST CONTACTED</label>
              <input type="date" value={form.last_contacted}
                onChange={e => setForm(p => ({ ...p, last_contacted: e.target.value }))}
                className="os-input w-full" />
            </div>
            <div>
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">STATUS NOTE</label>
              <input type="text" value={form.status_note}
                onChange={e => setForm(p => ({ ...p, status_note: e.target.value }))}
                placeholder="e.g. Met for coffee, Need to follow up..." className="os-input w-full" />
            </div>
            <div className="col-span-2">
              <label className="text-[9px] text-[var(--text-muted)] tracking-widest block mb-1">NOTES</label>
              <textarea value={form.notes} rows={2}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Important context, shared interests, things to remember..." className="os-input w-full resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={savePerson} className="os-btn">SAVE</button>
            <button onClick={() => { setShowForm(false); setEditingPerson(null); resetForm() }}
              className="os-btn opacity-50">CANCEL</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="os-card text-center py-12">
          <div className="text-3xl mb-3">👥</div>
          <div className="text-[var(--text-muted)] text-xs">
            {people.length === 0 ? 'Start building your relationship tracker' : 'No matches for this filter'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(person => {
            const days = daysSinceContact(person.last_contacted)
            const color = getContactColor(days)
            return (
              <div key={person.id} className="os-card group hover:border-[var(--border-bright)] transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: color + '20', color }}>
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-[var(--text)] font-['Syne']">{person.name}</span>
                      <span className="text-[8px] text-[var(--text-dim)]">{person.relationship_type}</span>
                    </div>
                    {person.status_note && (
                      <div className="text-[10px] text-[var(--text-muted)] mb-1">{person.status_note}</div>
                    )}
                    <div className="text-[9px]" style={{ color }}>
                      {days === null ? 'Never contacted' : days === 0 ? 'Contacted today' : `${days} days ago`}
                    </div>
                    {person.notes && (
                      <div className="text-[9px] text-[var(--text-dim)] mt-1 truncate">{person.notes}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => markContacted(person.id)}
                      className="text-[8px] text-[var(--text-muted)] hover:text-[var(--green)] px-1.5 py-0.5 border border-[var(--border)] rounded whitespace-nowrap">
                      ✓ TODAY
                    </button>
                    <button onClick={() => openEdit(person)}
                      className="text-[8px] text-[var(--text-muted)] hover:text-[var(--accent)] px-1.5 py-0.5 border border-[var(--border)] rounded">
                      EDIT
                    </button>
                    <button onClick={() => deletePerson(person.id)}
                      className="text-[8px] text-[var(--text-muted)] hover:text-[var(--red)] px-1.5 py-0.5 border border-[var(--border)] rounded">
                      DEL
                    </button>
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
