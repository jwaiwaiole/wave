'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

interface Transaction {
  date: string
  amount: number
}

interface Props {
  totalBudget: number
  transactions: Transaction[]
}

interface DayData {
  day: number
  label: string
  spent: number
  allowance: number
  perPerson: number
  isFuture: boolean
  isToday: boolean
}

function buildChartData(totalBudget: number, transactions: Transaction[]): DayData[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Group spending by day
  const spentByDay: Record<number, number> = {}
  for (const txn of transactions) {
    const d = new Date(txn.date + 'T00:00:00')
    if (d.getMonth() === month && d.getFullYear() === year) {
      spentByDay[d.getDate()] = (spentByDay[d.getDate()] ?? 0) + txn.amount
    }
  }

  const data: DayData[] = []
  let remaining = totalBudget

  for (let day = 1; day <= daysInMonth; day++) {
    const daysLeft = daysInMonth - day + 1
    const allowance = remaining / daysLeft
    const spent = spentByDay[day] ?? 0
    const isFuture = day > today
    const isToday = day === today

    data.push({
      day,
      label: day === 1 || day % 5 === 0 || isToday ? `${day}` : '',
      spent: isFuture ? 0 : spent,
      allowance: parseFloat(allowance.toFixed(2)),
      perPerson: parseFloat((allowance / 2).toFixed(2)),
      isFuture,
      isToday,
    })

    if (!isFuture) {
      remaining = Math.max(0, remaining - spent)
    }
  }

  return data
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  const allowance = payload.find(p => p.name === 'allowance')?.value ?? 0
  const spent = payload.find(p => p.name === 'spent')?.value ?? 0

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-100 p-3 text-sm">
      <p className="font-semibold text-stone-700 mb-1">Day {label}</p>
      {spent > 0 && <p className="text-stone-500">Spent: <span className="font-medium text-stone-800">${spent.toFixed(0)}</span></p>}
      <p className="text-cyan-600">Daily budget: <span className="font-medium">${allowance.toFixed(0)}</span></p>
      <p className="text-stone-400">Per person: <span className="font-medium text-stone-600">${(allowance / 2).toFixed(0)}</span></p>
    </div>
  )
}

export default function DailyChart({ totalBudget, transactions }: Props) {
  const now = new Date()
  const today = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - today

  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0)
  const remaining = Math.max(0, totalBudget - totalSpent)
  const dailyAllowance = daysLeft > 0 ? remaining / daysLeft : 0
  const perPerson = dailyAllowance / 2

  const data = buildChartData(totalBudget, transactions)

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
      {/* Per-person callout */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-cyan-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-cyan-600 font-medium uppercase tracking-wide">Jordan / day</p>
          <p className="text-2xl font-bold text-cyan-700 mt-1">${perPerson.toFixed(0)}</p>
        </div>
        <div className="flex-1 bg-cyan-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-cyan-600 font-medium uppercase tracking-wide">Lanny / day</p>
          <p className="text-2xl font-bold text-cyan-700 mt-1">${perPerson.toFixed(0)}</p>
        </div>
      </div>

      <p className="text-xs text-stone-400 mb-3 text-center">
        ${remaining.toFixed(0)} left · {daysLeft} days remaining · adjusts daily
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#A8A29E' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#A8A29E' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={`${today}`} stroke="#0891B2" strokeDasharray="4 2" strokeWidth={1.5} />
          <Bar dataKey="spent" name="spent" fill="#E8D5B7" radius={[3, 3, 0, 0]} maxBarSize={16} />
          <Line
            dataKey="allowance"
            name="allowance"
            type="monotone"
            stroke="#0891B2"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#0891B2' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-3 justify-center text-xs text-stone-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#E8D5B7' }} /> Spent</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block" style={{ backgroundColor: '#0891B2' }} /> Daily allowance</span>
      </div>
    </div>
  )
}
