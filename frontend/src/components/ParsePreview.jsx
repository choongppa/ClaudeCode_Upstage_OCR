import { useState } from 'react'
import Badge from './Badge'

const PAYMENT_OPTIONS = ['신용카드', '체크카드', '현금', '계좌이체', '기타']
const CATEGORY_OPTIONS = [
  '식료품', '식비', '교통', '의류', '의료', '생활', '전자제품', '문화', '교육', '카페', '기타',
]

function Field({ label, value, onChange, type = 'text', options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {options ? (
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

export default function ParsePreview({ data, onSave, onCancel }) {
  const [form, setForm] = useState({ ...data })

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }))

  const totalAmount = Number(form.total_amount) || 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-scale-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">OCR 파싱 완료</p>
            <p className="text-xs text-gray-400">내용을 확인하고 수정해 주세요</p>
          </div>
        </div>
        <Badge category={form.category} />
      </div>

      {/* 폼 */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <Field label="상호명" value={form.store_name} onChange={set('store_name')} />
        <Field label="영수증 날짜" value={form.receipt_date} onChange={set('receipt_date')} type="date" />
        <Field label="영수증 시간" value={form.receipt_time} onChange={set('receipt_time')} type="time" />
        <Field label="카테고리" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
        <Field label="결제 수단" value={form.payment_method} onChange={set('payment_method')} options={PAYMENT_OPTIONS} />
        <Field label="합계 금액 (원)" value={form.total_amount} onChange={set('total_amount')} type="number" />
      </div>

      {/* 품목 목록 */}
      {form.items && form.items.length > 0 && (
        <div className="px-6 pb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">품목</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">품목명</th>
                  <th className="px-3 py-2 text-right font-medium">수량</th>
                  <th className="px-3 py-2 text-right font-medium">단가</th>
                  <th className="px-3 py-2 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-700">{item.name}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{item.unit_price?.toLocaleString()}원</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-800">{item.total_price?.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-indigo-50">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold text-indigo-700">합계</td>
                  <td className="px-3 py-2 text-right text-sm font-bold text-indigo-700">
                    {totalAmount.toLocaleString()}원
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          onClick={() => onSave(form)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          저장하고 대시보드로
        </button>
      </div>
    </div>
  )
}
