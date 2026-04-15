import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import DropZone from '../components/DropZone'
import ProgressBar from '../components/ProgressBar'
import ParsePreview from '../components/ParsePreview'
import api from '../api/axios'

const LS_KEY = 'expenses'

function saveToLocalStorage(expense) {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    existing.unshift(expense)
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
  } catch {
    // localStorage 쓰기 실패는 무시
  }
}

export default function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null)   // OCR 파싱 결과
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    setError(null)
    setParsed(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setParsed(data)
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'OCR 처리 중 오류가 발생했습니다.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (formData) => {
    saveToLocalStorage(formData)
    navigate('/')
  }

  const handleCancel = () => {
    setParsed(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">영수증 업로드</h1>
          <p className="mt-1 text-sm text-gray-500">영수증 이미지나 PDF를 업로드하면 AI가 자동으로 파싱합니다.</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* 드롭존 — 파싱 중이거나 결과가 있으면 숨김 */}
          {!parsed && (
            <DropZone onFile={handleFile} disabled={loading} />
          )}

          {/* 진행 표시 */}
          <ProgressBar active={loading} />

          {/* 오류 배너 */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 animate-fade-in">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">파싱 실패</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
              <button
                onClick={handleCancel}
                className="text-xs font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
              >
                재시도
              </button>
            </div>
          )}

          {/* 파싱 결과 미리보기 */}
          {parsed && (
            <ParsePreview data={parsed} onSave={handleSave} onCancel={handleCancel} />
          )}
        </div>
      </main>
    </div>
  )
}
