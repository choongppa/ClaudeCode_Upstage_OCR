import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import Header from '../components/Header'
import EditForm from '../components/EditForm'
import Modal from '../components/Modal'
import { ToastContainer, useToast } from '../components/Toast'

export default function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data } = await api.get('/api/expenses')
        const found = data.find(e => e.id === id)
        if (!found) { setNotFound(true); return }
        setExpense(found)
      } catch {
        addToast('데이터를 불러오지 못했습니다.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchExpense()
  }, [id])

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      const { data } = await api.put(`/api/expenses/${id}`, formData)
      setExpense(data)
      addToast('수정되었습니다.', 'success')
    } catch {
      addToast('수정에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/expenses/${id}`)
      navigate('/')
    } catch {
      addToast('삭제에 실패했습니다.', 'error')
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-10 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 h-32 animate-pulse" />
          ))}
        </main>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 font-medium">항목을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            대시보드로 돌아가기
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 상단 네비 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              대시보드
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-700 font-medium">{expense.store_name || '지출 상세'}</span>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            삭제
          </button>
        </div>

        {/* 등록일 표시 */}
        {expense.created_at && (
          <p className="text-xs text-gray-400 mb-5">
            등록일: {new Date(expense.created_at).toLocaleString('ko-KR')}
          </p>
        )}

        <EditForm data={expense} onSave={handleSave} saving={saving} />
      </main>

      {showDeleteModal && (
        <Modal
          title="지출 항목 삭제"
          message={`"${expense.store_name || '이 항목'}"을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmLabel="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}
