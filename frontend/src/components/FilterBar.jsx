import { useState } from 'react'

export default function FilterBar({ onFilter }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const handleApply = () => {
    onFilter({ from, to })
  }

  const handleReset = () => {
    setFrom('')
    setTo('')
    onFilter({ from: '', to: '' })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-white rounded-2xl border border-gray-100 px-5 py-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">시작일</label>
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">종료일</label>
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          조회
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm rounded-lg transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  )
}
