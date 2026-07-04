import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReport, generateReport } from '../api/reports'
import ReportView from '../components/ReportView'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Header from '../components/Header'

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
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 py-16">
        <div className="mb-12">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-text-secondary hover:text-on-surface transition-colors text-sm font-medium tracking-wide group"
          >
            <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-text-secondary text-center py-20 font-mono text-sm animate-pulse">Loading report data...</div>
        ) : report ? (
          <ReportView report={report} />
        ) : (
          <div className="text-center py-24 bg-surface border border-border-base rounded-xl shadow-sm">
            <p className="text-on-surface text-lg mb-2 font-medium">Report not generated yet</p>
            <p className="text-text-secondary text-sm mb-8 font-light">
              Complete your interview session first, or generate the report now.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full sm:w-auto bg-primary-container text-on-primary-container hover:scale-[0.98] disabled:bg-surface-variant disabled:text-text-disabled disabled:border-border-base disabled:cursor-not-allowed transition-all duration-200 rounded px-8 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto"
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
