import { useState } from 'react'
import Badge from './Badge'

const PAYMENT_OPTIONS = ['신용카드', '체크카드', '현금', '계좌이체', '기타']
const CATEGORY_OPTIONS = [
  '식료품', '식비', '교통', '의류', '의료', '생활', '전자제품', '문화', '교육', '카페', '기타',
]

function Field({ label, value, onChange, type = 'text', options, readOnly }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {readOnly ? (
        <p className="px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">{value || '-'}</p>
      ) : options ? (
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      )}
    </div>
  )
}

export default function EditForm({ data, onSave, saving }) {
  const [form, setForm] = useState({ ...data, items: data.items ? [...data.items] : [] })

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }))

  const setItem = (idx, key, val) => {
    setForm(prev => {
      const items = prev.items.map((it, i) =>
        i === idx ? { ...it, [key]: key === 'name' ? val : Number(val) } : it
      )
      // total_price 자동 계산
      if (key === 'quantity' || key === 'unit_price') {
        const item = items[idx]
        items[idx] = { ...item, total_price: (item.quantity || 0) * (item.unit_price || 0) }
      }
      return { ...prev, items }
    })
  }

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unit_price: 0, total_price: 0 }],
    }))
  }

  const removeItem = (idx) => {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">기본 정보</p>
          <Badge category={form.category} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="상호명" value={form.store_name} onChange={set('store_name')} />
          <Field label="영수증 날짜" value={form.receipt_date} onChange={set('receipt_date')} type="date" />
          <Field label="영수증 시간" value={form.receipt_time} onChange={set('receipt_time')} type="time" />
          <Field label="카테고리" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
          <Field label="결제 수단" value={form.payment_method} onChange={set('payment_method')} options={PAYMENT_OPTIONS} />
          <Field label="합계 금액 (원)" value={form.total_amount} onChange={set('total_amount')} type="number" />
        </div>
      </div>

      {/* 품목 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">품목 목록</p>
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            품목 추가
          </button>
        </div>

        {form.items.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">품목이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_60px_80px_80px_32px] gap-2 items-center">
                <input
                  value={item.name}
                  onChange={e => setItem(i, 'name', e.target.value)}
                  placeholder="품목명"
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => setItem(i, 'quantity', e.target.value)}
                  placeholder="수량"
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={e => setItem(i, 'unit_price', e.target.value)}
                  placeholder="단가"
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <p className="text-sm text-right text-gray-600 font-medium">
                  {(item.total_price || 0).toLocaleString()}
                </p>
                <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={() => onSave(form)}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm transition-colors"
      >
        {saving ? '저장 중...' : '수정 저장'}
      </button>
    </div>
  )
}
