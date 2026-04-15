import { useEffect, useState } from 'react'

const STEPS = [
  '파일 업로드 중...',
  'OCR 텍스트 추출 중...',
  'AI가 영수증을 분석 중...',
  '데이터 구조화 중...',
]

export default function ProgressBar({ active }) {
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    if (!active) {
      setProgress(0)
      setStepIdx(0)
      return
    }

    // 진행률 서서히 채우기 (90%까지만 — 실제 완료 시 100%)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90 }
        return prev + Math.random() * 4 + 1
      })
    }, 400)

    // 단계 메시지 순환
    const stepInterval = setInterval(() => {
      setStepIdx(prev => (prev + 1) % STEPS.length)
    }, 2500)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [active])

  if (!active) return null

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-indigo-700 font-medium">{STEPS[stepIdx]}</span>
        <span className="text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
