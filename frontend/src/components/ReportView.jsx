import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { Activity, MessageSquare, Terminal, TrendingUp, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react'

export default function ReportView({ report }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      animate('.report-stagger-item', {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(100),
        easing: 'easeOutExpo'
      })
    }
  }, [report])

  if (!report) return null

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-[#D4A853]'
    if (score >= 6) return 'bg-[#D4A853]/70'
    return 'bg-error/70'
  }

  const metrics = [
    { label: 'Technical Skills', score: report.technical_skills ?? 0, icon: Terminal },
    { label: 'Communication', score: report.communication_skills ?? 0, icon: MessageSquare },
    { label: 'Problem Solving', score: report.problem_solving ?? 0, icon: Activity },
  ]

  return (
    <div className="space-y-12" ref={containerRef}>
      {/* Hero Header */}
      <header className="report-stagger-item flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#2A2A2A] pb-8 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-[#1C1C1C] rounded text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#8A8277] border border-[#2A2A2A]">
              Interview Report
            </span>
            <span className="text-[#4A4744] text-[10px] md:text-xs font-bold uppercase tracking-wider border-l border-[#2A2A2A] pl-2">
              {report.recommendation?.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-[#e5e2e1]">Performance Analysis</h1>
          <p className="text-sm md:text-base text-[#8A8277] max-w-2xl leading-relaxed">
            {report.summary}
          </p>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 flex flex-col items-end shrink-0 relative overflow-hidden shadow-[0_0_40px_rgba(212,168,83,0.05)]">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4A853]/5 rounded-full blur-2xl"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8277] mb-1">Overall Score</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-5xl text-[#D4A853]">{report.overall_score ?? 0}</span>
            <span className="text-2xl text-[#8A8277]">/10</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A9B6F]">
            <TrendingUp size={14} />
            <span>Completed</span>
          </div>
        </div>
      </header>

      {/* Core Competencies */}
      <section className="report-stagger-item">
        <div className="flex items-center gap-3 mb-6">
          <Activity size={20} className="text-[#8A8277]" strokeWidth={1.5} />
          <h2 className="text-xl font-medium text-[#e5e2e1]">Core Competencies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, i) => {
            const Icon = metric.icon
            const percentage = (metric.score / 10) * 100
            return (
              <div key={i} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#D4A853]/50 transition-colors duration-300 flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8277]">{metric.label}</span>
                  <Icon size={18} className="text-[#4A4744] group-hover:text-[#D4A853] transition-colors" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-mono text-[#e5e2e1] mb-6">{metric.score}/10</div>
                <div className="mt-auto">
                  <div className="w-full bg-[#1C1C1C] h-1.5 rounded-full overflow-hidden">
                    <div className={`${getScoreColor(metric.score)} h-full rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Strengths & Improvements */}
      <section className="report-stagger-item grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#4A9B6F]"></div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-[#4A9B6F]" strokeWidth={1.5} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">Key Strengths</h3>
          </div>
          <ul className="space-y-3">
            {report.strengths?.map((s, i) => (
              <li key={i} className="text-sm text-[#8A8277] flex gap-3">
                <span className="text-[#4A9B6F] opacity-70 mt-1 text-[10px]">■</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#A87B3A]"></div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-[#A87B3A]" strokeWidth={1.5} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#e5e2e1]">Areas for Growth</h3>
          </div>
          <ul className="space-y-3">
            {report.areas_to_improve?.map((a, i) => (
              <li key={i} className="text-sm text-[#8A8277] flex gap-3">
                <span className="text-[#A87B3A] opacity-70 mt-1 text-[10px]">■</span>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Action Plan */}
      {report.suggested_topics?.length > 0 && (
        <section className="report-stagger-item border-t border-[#2A2A2A] pt-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={20} className="text-[#8A8277]" strokeWidth={1.5} />
            <h2 className="text-xl font-medium text-[#e5e2e1]">Suggested Study Topics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.suggested_topics.map((topic, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#D4A853]/50 transition-colors">
                <div className="w-8 h-8 rounded bg-[#141414] flex items-center justify-center shrink-0 border border-[#2A2A2A]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A853]">{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#e5e2e1] mb-1">{topic}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
