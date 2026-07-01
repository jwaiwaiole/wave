'use client'

import { useState } from 'react'

interface Props {
  current: { total_budget: number; savings_target: number } | null
  onSave: (data: { total_budget: number; savings_target: number }) => Promise<void>
  onClose: () => void
}

export default function BudgetSetup({ current, onSave, onClose }: Props) {
  const [budget, setBudget] = useState(current?.total_budget?.toString() ?? '')
  const [savings, setSavings] = useState(current?.savings_target?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const monthName = now.toLocaleString('default', { month: 'long' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      total_budget: parseFloat(budget),
      savings_target: parseFloat(savings || '0'),
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-stone-800">{monthName} Budget</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Total spending budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">$</span>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="3000"
                required
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              Savings target <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">$</span>
              <input
                type="number"
                value={savings}
                onChange={e => setSavings(e.target.value)}
                placeholder="500"
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-stone-200 rounded-xl text-stone-800 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all"
            style={{ backgroundColor: '#0891B2' }}
          >
            {saving ? 'Saving…' : 'Set Budget'}
          </button>
        </form>
      </div>
    </div>
  )
}
