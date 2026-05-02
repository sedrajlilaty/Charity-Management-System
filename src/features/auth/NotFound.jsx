
import { useNavigate } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <AlertTriangle size={48} className="text-gray-300" />
      <h1 className="text-2xl font-bold text-gray-700">404</h1>
      <p className="text-gray-500">This page is not found </p>
      <button onClick={() => navigate('/')} className="btn-primary mt-2">
        <Home size={15} />
       Back to home
      </button>
    </div>
  )
}
