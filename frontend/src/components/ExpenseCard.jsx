import { useNavigate } from 'react-router-dom'
import Badge from './Badge'

export default function ExpenseCard({ expense }) {
  const navigate = useNavigate()

  const date = expense.receipt_date
    ? new Date(expense.receipt_date).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '-'

  const amount = (expense.total_amount ?? 0).toLocaleString()

  return (
    <div
      onClick={() => navigate(`/expense/${expense.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer
                 hover:border-indigo-200 hover:shadow-md transition-all duration-200 animate-slide-up"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {expense.store_name || '(상호명 없음)'}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{date}</p>
        </div>
        <Badge category={expense.category} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className="text-lg font-bold text-gray-900">{amount}원</p>
        <span className="text-xs text-gray-400 bg-gray-50 rounded-md px-2 py-1">
          {expense.payment_method || '-'}
        </span>
      </div>
    </div>
  )
}
