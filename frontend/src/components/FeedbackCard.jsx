import { CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'

export default function FeedbackCard({ feedback }) {
  if (!feedback) return null

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-[#4A9B6F] bg-[#4A9B6F]/10 border-[#4A9B6F]/20'
    if (score >= 5) return 'text-[#A87B3A] bg-[#A87B3A]/10 border-[#A87B3A]/20'
    return 'text-[#B85C5C] bg-[#B85C5C]/10 border-[#B85C5C]/20'
  }

  const scoreClass = getScoreColor(feedback.score)

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 mt-4 text-sm space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A8277]">AI Feedback</h3>
        <span className={`px-2 py-1 rounded text-xs font-bold border ${scoreClass}`}>
          Score: {feedback.score}/10
        </span>
      </div>

      {feedback.understanding && (
        <p className="text-[#e5e2e1] leading-relaxed">
          <span className="text-[#8A8277] font-medium mr-1">Understanding:</span>
          {feedback.understanding}
        </p>
      )}

      {feedback.strengths?.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-[#4A9B6F]" strokeWidth={1.5} />
            <p className="text-[#e5e2e1] text-xs font-bold uppercase tracking-wider">Strengths</p>
          </div>
          <ul className="space-y-1.5 pl-6">
            {Array.isArray(feedback.strengths) ? (
              feedback.strengths.map((s, i) => (
                <li key={i} className="text-[#8A8277] text-sm list-disc">
                  {s}
                </li>
              ))
            ) : (
              <li className="text-[#8A8277] text-sm list-disc">{feedback.strengths}</li>
            )}
          </ul>
        </div>
      )}

      {feedback.improvements?.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-[#A87B3A]" strokeWidth={1.5} />
            <p className="text-[#e5e2e1] text-xs font-bold uppercase tracking-wider">Areas to Improve</p>
          </div>
          <ul className="space-y-1.5 pl-6">
            {Array.isArray(feedback.improvements) ? (
              feedback.improvements.map((tip, i) => (
                <li key={i} className="text-[#8A8277] text-sm list-disc">
                  {tip}
                </li>
              ))
            ) : (
              <li className="text-[#8A8277] text-sm list-disc">{feedback.improvements}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
