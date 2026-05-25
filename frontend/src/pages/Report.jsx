import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReport, generateReport } from '../api/reports'
import ReportView from '../components/ReportView'
import toast from 'react-hot-toast'

export default function Report() {
  const { sessionId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await getReport(sessionId)
        setReport(data)
      } catch (err) {
        if (err.response?.status === 404) {
          // Report not generated yet — show generate button
          setReport(null)
        } else {
          toast.error('Failed to load report')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [sessionId])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data } = await generateReport(sessionId)
      setReport(data)
      toast.success('Report generated!')
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">Loading report...</div>
      ) : report ? (
        <ReportView report={report} />
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-700 rounded-2xl">
          <p className="text-slate-400 text-lg mb-2">Report not generated yet</p>
          <p className="text-slate-600 text-sm mb-6">
            Complete your interview session first, or generate the report now.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      )}
    </div>
  )
}
