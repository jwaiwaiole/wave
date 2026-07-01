import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { public_token, institution_name } = await req.json()

  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token })
    const { access_token, item_id } = response.data

    await supabase.from('plaid_items').upsert(
      { access_token, item_id, institution_name },
      { onConflict: 'item_id' }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('exchange-token error:', error)
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 })
  }
}
