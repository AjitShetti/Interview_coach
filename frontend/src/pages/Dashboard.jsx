import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSessions, deleteSession } from '../api/interviews'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { animate, stagger } from 'animejs'
import { Mic, Code, ChevronRight, X } from 'lucide-react'
import Header from '../components/Header'

const STATUS_BADGE = {
  in_progress: 'bg-primary-container/10 text-primary-container border-primary-container/20',
  completed: 'bg-success/10 text-success border-success/20',
  abandoned: 'bg-surface-raised text-text-secondary border-border-base',
}

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const listRef = useRef(null)
  const headerRef = useRef(null)

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

  useEffect(() => {
    if (!loading) {
      if (headerRef.current) {
        animate(headerRef.current, {
          translateY: [12, 0],
          opacity: [0, 1],
          ease: 'outQuad',
          duration: 400,
          delay: 80
        })
      }

      if (sessions.length > 0 && listRef.current) {
        const elements = listRef.current.querySelectorAll('.session-card')
        animate(elements, {
          translateY: [12, 0],
          opacity: [0, 1],
          ease: 'outQuad',
          duration: 400,
          delay: stagger(80, { start: 160 })
        })
      }
    }
  }, [loading, sessions])

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
    <div className="min-h-screen bg-background flex flex-col font-body">
      <Header />
      
      <main className="flex-1 w-full">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16 flex flex-col gap-16">
          {/* Dashboard Header */}
          <section ref={headerRef} className="flex flex-col gap-6 opacity-0">
            <div className="flex flex-col gap-2">
              <h2 className="text-[48px] md:text-[72px] font-display text-on-surface leading-tight tracking-tight">
                Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.
              </h2>
              <p className="text-body-lg font-body text-text-secondary max-w-2xl">
                Ready to prepare for your next interview? Jump back into a session or start a new one.
              </p>
            </div>
            <div>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-primary-container text-on-primary-container hover:bg-accent-hover font-body font-semibold px-8 py-3 rounded-lg transition-colors duration-200 active:scale-[0.98]"
              >
                Start Practicing
              </button>
            </div>
          </section>

          {/* Past Sessions */}
          <section className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-4">
              <h3 className="font-display text-[32px] text-on-surface">Recent Sessions</h3>
            </div>

            {loading ? (
              <div className="text-text-secondary font-body py-10">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-text-secondary font-body py-10 border border-dashed border-border-base rounded-xl p-8 text-center bg-surface-raised/30">
                No recent sessions. Start an interview above to see your history.
              </div>
            ) : (
              <div ref={listRef} className="grid grid-cols-1 gap-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/report/${session.id}`)}
                    className="session-card opacity-0 bg-surface border border-border-base rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-outline-variant transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-raised border border-border-base items-center justify-center hidden md:flex text-text-secondary">
                        {session.interview_type === 'audio' ? <Mic size={20} strokeWidth={1.5} /> : <Code size={20} strokeWidth={1.5} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-body text-[18px] font-medium text-on-surface capitalize">
                            {session.position || 'General Prep'}
                          </h4>
                          <span className={`text-[12px] font-body uppercase tracking-wider px-2 py-1 rounded border ${STATUS_BADGE[session.status]}`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-mono text-[13px] text-text-disabled">
                          {new Date(session.started_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })} • {session.questions_asked} Qs
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8">
                      <div className="flex flex-col md:items-end">
                        <span className="text-[12px] font-body text-text-disabled uppercase tracking-wider font-semibold mb-1">Type</span>
                        <span className="font-mono text-[16px] text-on-surface capitalize">{session.interview_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleDelete(session.id, e)}
                          className="bg-transparent hover:bg-error-container/10 text-text-secondary hover:text-error text-sm font-body font-medium px-4 py-2 rounded transition-colors duration-200"
                        >
                          Delete
                        </button>
                        <button className="bg-surface-raised border border-border-base hover:bg-surface-bright text-on-surface text-sm font-body font-medium px-4 py-2 rounded transition-colors duration-200 active:scale-[0.98]">
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Start Practice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border-base rounded-2xl p-6 md:p-8 w-full max-w-4xl relative shadow-xl shadow-black/50 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-text-secondary hover:text-on-surface transition-colors focus:outline-none"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
            
            <h3 className="font-display text-[32px] text-on-surface mb-8">Choose Interview Type</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voice Interview Card */}
              <div className="bg-[#141414] border border-border-base rounded-xl p-6 flex flex-col relative overflow-hidden group cursor-pointer hover:border-outline-variant transition-all duration-200">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.05),transparent_60%)] pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-surface-raised flex items-center justify-center border border-border-base">
                    <Mic className="text-primary-container" size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] font-body text-text-disabled uppercase tracking-wider font-semibold">AI Coach</span>
                </div>
                
                <div className="relative z-10 flex-1">
                  <h4 className="font-display text-[28px] text-on-surface mb-2">Voice Interview</h4>
                  <p className="text-body font-body text-text-secondary mb-8">Simulate a real-time behavioral or product sense interview with conversational AI.</p>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <button onClick={() => navigate('/interview/audio')} className="w-full bg-primary-container hover:bg-accent-hover text-[#131313] font-body font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 active:scale-[0.98]">
                    <span>Start Voice Session</span>
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Technical Interview Card */}
              <div className="bg-[#141414] border border-border-base rounded-xl p-6 flex flex-col relative overflow-hidden group cursor-pointer hover:border-outline-variant transition-all duration-200">
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-surface-raised flex items-center justify-center border border-border-base">
                    <Code className="text-on-surface" size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] font-body text-text-disabled uppercase tracking-wider font-semibold">Coding & Design</span>
                </div>
                
                <div className="relative z-10 flex-1">
                  <h4 className="font-display text-[28px] text-on-surface mb-2">Technical Interview</h4>
                  <p className="text-body font-body text-text-secondary mb-8">Practice algorithms, data structures, and system design with an interactive editor.</p>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <button onClick={() => navigate('/interview')} className="w-full bg-transparent border border-border-base text-on-surface hover:bg-surface-raised font-body font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 active:scale-[0.98]">
                    <span>Start Technical Session</span>
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
