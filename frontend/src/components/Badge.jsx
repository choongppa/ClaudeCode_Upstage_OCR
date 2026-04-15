const COLORS = {
  식료품:   'bg-green-100 text-green-700',
  식비:     'bg-orange-100 text-orange-700',
  음식:     'bg-orange-100 text-orange-700',
  교통:     'bg-blue-100 text-blue-700',
  의류:     'bg-purple-100 text-purple-700',
  의료:     'bg-red-100 text-red-700',
  생활:     'bg-yellow-100 text-yellow-700',
  전자제품: 'bg-indigo-100 text-indigo-700',
  문화:     'bg-pink-100 text-pink-700',
  교육:     'bg-teal-100 text-teal-700',
  카페:     'bg-amber-100 text-amber-700',
  기타:     'bg-gray-100 text-gray-600',
}

export default function Badge({ category }) {
  const cls = COLORS[category] ?? COLORS['기타']
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {category ?? '기타'}
    </span>
  )
}
