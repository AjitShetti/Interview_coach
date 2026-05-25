import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts'

const RECOMMENDATION_COLORS = {
  hire: 'text-green-400',
  maybe: 'text-yellow-400',
  no_hire: 'text-red-400',
}

export default function ReportView({ report }) {
  if (!report) return null

  const radarData = [
    { skill: 'Technical', score: report.technical_skills ?? 0 },
    { skill: 'Communication', score: report.communication_skills ?? 0 },
    { skill: 'Problem Solving', score: report.problem_solving ?? 0 },
    { skill: 'Overall', score: report.overall_score ?? 0 },
  ]

  const recColor = RECOMMENDATION_COLORS[report.recommendation] ?? 'text-slate-300'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Interview Report</h2>
          <span className={`text-lg font-bold ${recColor} uppercase tracking-wide`}>
            {report.recommendation?.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl font-black text-cyan-400">{report.overall_score}</div>
          <div className="text-slate-400 text-sm">/ 10<br />Overall Score</div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{report.summary}</p>
      </div>

      {/* Radar Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Skill Breakdown</h3>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.25}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-green-400 font-semibold mb-3">✓ Strengths</h3>
          <ul className="space-y-2">
            {report.strengths?.map((s, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-green-500 mt-0.5">•</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-yellow-400 font-semibold mb-3">↑ Areas to Improve</h3>
          <ul className="space-y-2">
            {report.areas_to_improve?.map((a, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>{a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Topics to Study */}
      {report.suggested_topics?.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-blue-400 font-semibold mb-3">📚 Suggested Topics to Study</h3>
          <div className="flex flex-wrap gap-2">
            {report.suggested_topics.map((t, i) => (
              <span
                key={i}
                className="bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
