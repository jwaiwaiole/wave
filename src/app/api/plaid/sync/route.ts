import { NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const { data: items, error } = await supabase.from('plaid_items').select('*')
    if (error || !items?.length) return NextResponse.json({ synced: 0 })

    const now = new Date()
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const endDate = now.toISOString().split('T')[0]

    let totalSynced = 0

    for (const item of items) {
      const response = await plaidClient.transactionsGet({
        access_token: item.access_token,
        start_date: startDate,
        end_date: endDate,
      })

      for (const txn of response.data.transactions) {
        if (txn.amount <= 0) continue

        await supabase.from('transactions').upsert({
          plaid_transaction_id: txn.transaction_id,
          date: txn.date,
          vendor: txn.merchant_name || txn.name,
          category: txn.personal_finance_category?.primary ?? txn.category?.[0] ?? 'Other',
          amount: txn.amount,
          account_source: item.institution_name,
        }, { onConflict: 'plaid_transaction_id' })

        totalSynced++
      }
    }

    return NextResponse.json({ synced: totalSynced })
  } catch (error) {
    console.error('sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
