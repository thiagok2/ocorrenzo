import { Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-fundo">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
