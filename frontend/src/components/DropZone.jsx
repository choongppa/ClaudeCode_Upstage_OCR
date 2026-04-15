import { useRef, useState } from 'react'

const ACCEPT = '.jpg,.jpeg,.png,.bmp,.tiff,.heic,.pdf'

export default function DropZone({ onFile, disabled }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFile(file)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed
        p-12 text-center cursor-pointer select-none transition-all duration-200
        ${dragging
          ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
          : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <div className={`p-4 rounded-full transition-colors ${dragging ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
        <svg className={`w-10 h-10 ${dragging ? 'text-indigo-600' : 'text-indigo-400'}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div>
        <p className="text-base font-semibold text-gray-700">
          {dragging ? '여기에 놓으세요!' : '영수증을 드래그 앤 드롭'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          또는 <span className="text-indigo-600 font-medium">클릭하여 파일 선택</span>
        </p>
        <p className="mt-2 text-xs text-gray-400">JPG, PNG, PDF 지원 · 최대 10MB</p>
      </div>
    </div>
  )
}
