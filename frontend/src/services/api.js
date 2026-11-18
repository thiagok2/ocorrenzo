import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401 && !erro.config.url.includes('/auth/login')) {
      localStorage.removeItem('token')
      window.location.assign('/login')
    }
    return Promise.reject(erro)
  },
)

export default api
