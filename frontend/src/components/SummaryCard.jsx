function StatCard({ label, value, sub, color }) {
  return (
    <div className={`rounded-2xl p-5 ${color}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function SummaryCard({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  const total = summary?.total_amount ?? 0
  const monthly = summary?.this_month_amount ?? 0
  const categories = summary?.category_summary ?? []
  const topCat = categories[0]
  const count = summary?.total_count ?? 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="전체 지출 합계"
          value={`${total.toLocaleString()}원`}
          sub={`총 ${count}건`}
          color="bg-indigo-50"
        />
        <StatCard
          label="이번 달 지출"
          value={`${monthly.toLocaleString()}원`}
          sub={new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          color="bg-purple-50"
        />
      </div>

      {categories.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 mb-3">카테고리별 지출</p>
          <div className="space-y-2">
            {categories.slice(0, 5).map((cat) => {
              const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{cat.category}</span>
                    <span className="text-gray-500 font-medium">{cat.amount.toLocaleString()}원 ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
