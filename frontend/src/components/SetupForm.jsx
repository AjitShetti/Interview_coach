import { useState } from 'react'
import { startInterview } from '../api/interviews'
import useInterviewStore from '../store/interviewStore'
import toast from 'react-hot-toast'

const LEVELS = ['junior', 'mid', 'senior', 'staff']
const TYPES = ['technical', 'behavioral', 'system_design']

export default function SetupForm({ onStarted, onInteract }) {
  const [form, setForm] = useState({
    position: 'Senior Python Developer',
    level: 'senior',
    interview_type: 'technical',
    num_questions: 5,
    job_description: '',
  })
  const [loading, setLoading] = useState(false)
  const { setSession, reset } = useInterviewStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (onInteract) onInteract() // Synchronously unlock audio context!
    
    setLoading(true)
    reset()
    try {
      const { data } = await startInterview({
        ...form,
        num_questions: Number(form.num_questions),
        job_description: form.job_description || null,
      })
      setSession(data.session_id, data.first_question, data.welcome_message)
      onStarted()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-400 mb-1">Position</label>
        <input
          name="position"
          value={form.position}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Level</label>
        <select
          name="level"
          value={form.level}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Interview Type</label>
        <select
          name="interview_type"
          value={form.interview_type}
          onChange={handleChange}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Questions: {form.num_questions}
        </label>
        <input
          type="range"
          name="num_questions"
          min={3}
          max={10}
          value={form.num_questions}
          onChange={handleChange}
          className="w-full accent-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Job Description <span className="text-slate-600">(optional)</span>
        </label>
        <textarea
          name="job_description"
          value={form.job_description}
          onChange={handleChange}
          rows={4}
          placeholder="Paste JD for targeted questions..."
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading ? 'Starting...' : 'Start Interview'}
      </button>
    </form>
  )
}
