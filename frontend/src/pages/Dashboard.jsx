import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Header from '../components/Header'
import SummaryCard from '../components/SummaryCard'
import FilterBar from '../components/FilterBar'
import ExpenseCard from '../components/ExpenseCard'

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
        </svg>
      </div>
      <p className="text-gray-500 font-medium">저장된 지출 내역이 없습니다</p>
      <p className="mt-1 text-sm text-gray-400">영수증을 업로드하면 자동으로 등록됩니다.</p>
      <button
        onClick={() => navigate('/upload')}
        className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        첫 번째 영수증 등록하기
      </button>
    </div>
  )
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState({ from: '', to: '' })

  const fetchExpenses = useCallback(async (f = filter) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (f.from) params.from = f.from
      if (f.to) params.to = f.to
      const { data } = await api.get('/api/expenses', { params })
      setExpenses(data)
    } catch {
      setError('지출 내역을 불러오지 못했습니다. 백엔드 서버를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const month = new Date().toISOString().slice(0, 7) // YYYY-MM
      const { data } = await api.get('/api/summary', { params: { month } })
      setSummary(data)
    } catch {
      // 요약 조회 실패는 조용히 처리
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses(filter)
    fetchSummary()
  }, [])

  const handleFilter = (f) => {
    setFilter(f)
    fetchExpenses(f)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-500">영수증 지출 내역을 한눈에 확인하세요.</p>
        </div>

        {/* 요약 카드 */}
        <div className="mb-6">
          <SummaryCard summary={summary} loading={summaryLoading} />
        </div>

        {/* 필터 */}
        <div className="mb-5">
          <FilterBar onFilter={handleFilter} />
        </div>

        {/* 지출 목록 */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-5 text-sm text-red-700">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 h-32 animate-pulse" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{expenses.length}건의 지출 내역</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenses.map(exp => (
                <ExpenseCard key={exp.id} expense={exp} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
