import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-cyan-400 tracking-tight">
          🎯 Interview Coach
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm">
            Dashboard
          </Link>
          <Link to="/interview" className="text-slate-300 hover:text-white transition-colors text-sm">
            New Interview
          </Link>
          {user && (
            <span className="text-slate-400 text-sm">{user.email}</span>
          )}
          <button
            onClick={handleLogout}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
