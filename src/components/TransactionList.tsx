'use client'

import { useState } from 'react'

interface Transaction {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  account_source: string
}

interface Props {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: Props) {
  const [filter, setFilter] = useState('')

  const filtered = transactions.filter(t =>
    !filter ||
    t.vendor.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase()) ||
    t.account_source?.toLowerCase().includes(filter.toLowerCase())
  )

  const categoryColors: Record<string, string> = {
    FOOD_AND_DRINK: '#D97706',
    SHOPPING: '#7C3AED',
    TRANSPORTATION: '#0891B2',
    ENTERTAINMENT: '#DB2777',
    GENERAL_MERCHANDISE: '#059669',
    Other: '#78716C',
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-4 border-b border-stone-100">
        <input
          type="text"
          placeholder="Search transactions…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full px-4 py-2 bg-stone-50 rounded-xl text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-stone-400">
          {transactions.length === 0 ? 'No transactions yet — connect a bank or sync.' : 'No matches.'}
        </div>
      ) : (
        <div className="divide-y divide-stone-50">
          {filtered.map(t => {
            const color = categoryColors[t.category] ?? '#78716C'
            return (
              <div key={t.id} className="flex items-center px-4 py-3 hover:bg-stone-50 transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-3"
                  style={{ backgroundColor: color }}
                >
                  {t.vendor.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 font-medium text-sm truncate">{t.vendor}</p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {t.account_source} · {new Date(t.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-stone-800 font-semibold text-sm">${t.amount.toFixed(2)}</p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color }}>
                    {t.category.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
