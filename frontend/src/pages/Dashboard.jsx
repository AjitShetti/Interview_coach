import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { listSessions, deleteSession } from '../api/interviews'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  abandoned: 'bg-slate-600 text-slate-400',
}

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const fetchSessions = async () => {
    try {
      const { data } = await listSessions()
      setSessions(data)
    } catch {
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this session?')) return
    try {
      await deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Session deleted')
    } catch {
      toast.error('Failed to delete session')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
          </h1>
          <p className="text-slate-400 mt-1">Your interview sessions</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/interview"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            + Text Interview
          </Link>
          <Link
            to="/interview/audio"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            + Audio Interview
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-700 rounded-2xl">
          <p className="text-slate-400 text-lg mb-4">No interviews yet</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/interview"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Start Text Interview
            </Link>
            <Link
              to="/interview/audio"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Start Audio Interview
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => navigate(`/report/${session.id}`)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:border-cyan-700 hover:bg-slate-800 transition-all group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">{session.position}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[session.status]}`}>
                    {session.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  {session.level} · {session.interview_type} · {session.questions_asked} questions
                </p>
                <p className="text-slate-600 text-xs">
                  {new Date(session.started_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-sm opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
                <span className="text-slate-600 group-hover:text-cyan-400 transition-colors">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
