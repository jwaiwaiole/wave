import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const now = new Date()
  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', now.getMonth() + 1)
    .eq('year', now.getFullYear())
    .single()

  return NextResponse.json(data ?? null)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const now = new Date()

  const { data, error } = await supabase
    .from('budgets')
    .upsert({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      total_budget: body.total_budget,
      savings_target: body.savings_target,
    }, { onConflict: 'month,year' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
