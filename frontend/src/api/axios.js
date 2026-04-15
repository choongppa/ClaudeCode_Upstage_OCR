import axios from 'axios'

// 개발: VITE_API_BASE_URL=http://localhost:8002 (.env)
// 프로덕션: VITE_API_BASE_URL= (빈값 → 같은 도메인 상대 경로)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export default api
