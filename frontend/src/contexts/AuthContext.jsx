import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(() => Boolean(localStorage.getItem('token')))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api
      .get('/auth/me')
      .then((resposta) => setUsuario(resposta.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setCarregando(false))
  }, [])

  async function login(matricula, senha) {
    const resposta = await api.post('/auth/login', { matricula, senha })
    localStorage.setItem('token', resposta.data.token)
    setUsuario(resposta.data.usuario)
    return resposta.data.usuario
  }

  function logout() {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return <AuthContext.Provider value={{ usuario, carregando, login, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de acesso ao contexto, não um componente
export function useAuth() {
  return useContext(AuthContext)
}
