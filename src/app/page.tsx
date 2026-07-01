'use client'

import { useCallback, useEffect, useState } from 'react'
import DailyChart from '@/components/DailyChart'
import TransactionList from '@/components/TransactionList'
import BudgetSetup from '@/components/BudgetSetup'
import ConnectBank from '@/components/ConnectBank'

interface Budget {
  total_budget: number
  savings_target: number
}

interface Transaction {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  account_source: string
}

export default function Home() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showBudgetSetup, setShowBudgetSetup] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  const now = new Date()
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const fetchBudget = useCallback(async () => {
    const res = await fetch('/api/budget')
    const data = await res.json()
    setBudget(data)
  }, [])

  const fetchTransactions = useCallback(async () => {
    const { supabase } = await import('@/lib/supabase')
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: false })
    setTransactions(data ?? [])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchBudget()
    fetchTransactions()
  }, [fetchBudget, fetchTransactions])

  const handleSync = async () => {
    setSyncing(true)
    const res = await fetch('/api/plaid/sync', { method: 'POST' })
    const { synced } = await res.json()
    await fetchTransactions()
    setLastSynced(`${synced} transactions synced`)
    setSyncing(false)
  }

  const handleSaveBudget = async (data: { total_budget: number; savings_target: number }) => {
    await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchBudget()
  }

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3EE' }}>
      <div className="max-w-md mx-auto px-4 pb-12">
        {/* Header */}
        <div className="pt-12 pb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Wave 🌊</h1>
            <p className="text-stone-400 text-sm mt-1">{monthName}</p>
          </div>
          <button
            onClick={() => setShowBudgetSetup(true)}
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
          >
            {budget ? 'Edit budget' : 'Set budget'}
          </button>
        </div>

        {/* Chart */}
        {budget ? (
          <DailyChart totalBudget={budget.total_budget} transactions={transactions} />
        ) : (
          <div
            className="bg-white rounded-3xl p-8 text-center shadow-sm border border-stone-100 cursor-pointer hover:border-cyan-200 transition-colors"
            onClick={() => setShowBudgetSetup(true)}
          >
            <p className="text-4xl mb-3">🏄</p>
            <p className="text-stone-600 font-medium">Set your {monthName} budget to get started</p>
            <p className="text-stone-400 text-sm mt-1">Tap to set a spending target</p>
          </div>
        )}

        {/* Sync button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: '#0891B2' }}
          >
            {syncing ? 'Syncing…' : 'Sync transactions'}
          </button>
        </div>
        {lastSynced && (
          <p className="text-center text-stone-400 text-xs mt-2">{lastSynced}</p>
        )}

        {/* Connect bank */}
        <div className="mt-3">
          <ConnectBank onConnected={handleSync} />
        </div>

        {/* Transactions */}
        <div className="mt-6">
          <h2 className="text-stone-600 font-semibold text-sm uppercase tracking-wide mb-3">
            This month · {transactions.length} transactions
          </h2>
          <TransactionList transactions={transactions} />
        </div>
      </div>

      {showBudgetSetup && (
        <BudgetSetup
          current={budget}
          onSave={handleSaveBudget}
          onClose={() => setShowBudgetSetup(false)}
        />
      )}
    </div>
  )
}
