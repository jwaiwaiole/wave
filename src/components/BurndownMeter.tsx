'use client'

interface Props {
  totalBudget: number
  spent: number
}

export default function BurndownMeter({ totalBudget, spent }: Props) {
  const remaining = Math.max(0, totalBudget - spent)
  const pct = totalBudget > 0 ? Math.min(100, (remaining / totalBudget) * 100) : 0

  const color =
    pct > 60 ? '#0891B2' :
    pct > 30 ? '#D97706' :
    '#DC2626'

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - now.getDate()
  const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-stone-400 text-sm font-medium uppercase tracking-wide">Remaining</p>
          <p className="text-4xl font-bold text-stone-800 mt-1">
            ${remaining.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-stone-400 text-sm mt-1">of ${totalBudget.toLocaleString()} budget</p>
        </div>
        <div className="text-right">
          <p className="text-stone-400 text-sm font-medium uppercase tracking-wide">Daily left</p>
          <p className="text-2xl font-semibold mt-1" style={{ color }}>
            ${dailyBudget.toFixed(0)}
          </p>
          <p className="text-stone-400 text-sm mt-1">{daysLeft}d remaining</p>
        </div>
      </div>

      {/* Wave container */}
      <div className="relative h-28 rounded-2xl overflow-hidden bg-stone-100">
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
          style={{ height: `${pct}%`, backgroundColor: color, opacity: 0.15 }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
          style={{ height: `${pct}%` }}
        >
          {/* Wave SVG sits at the top of the fill */}
          <svg
            viewBox="0 0 1200 30"
            preserveAspectRatio="none"
            className="absolute -top-[14px] left-0 w-[200%] animate-wave"
            style={{ fill: color }}
          >
            <path d="M0,15 C150,30 350,0 600,15 C850,30 1050,0 1200,15 L1200,30 L0,30 Z" />
          </svg>
          <div className="absolute inset-0 top-4" style={{ backgroundColor: color }} />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-2xl font-bold text-stone-700">{pct.toFixed(0)}% left</p>
        </div>
      </div>

      <div className="flex justify-between mt-3 text-sm text-stone-400">
        <span>Spent: ${spent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        <span>{pct <= 30 ? '⚠️ Running low' : pct <= 60 ? 'On track' : 'Looking good'}</span>
      </div>
    </div>
  )
}
