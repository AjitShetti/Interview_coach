export default function FeedbackCard({ feedback }) {
  if (!feedback) return null

  const scoreColor =
    feedback.score >= 8
      ? 'text-green-400'
      : feedback.score >= 5
      ? 'text-yellow-400'
      : 'text-red-400'

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mt-2 text-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-medium">Feedback</span>
        <span className={`font-bold text-lg ${scoreColor}`}>
          {feedback.score}/10
        </span>
      </div>

      <p className="text-slate-300">
        <span className="text-slate-500">Understanding: </span>
        {feedback.understanding}
      </p>

      {feedback.strengths?.length > 0 && (
        <div>
          <p className="text-green-400 font-medium mb-1">✓ Strengths</p>
          <ul className="space-y-0.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-slate-300 pl-3">• {s}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback.improvements?.length > 0 && (
        <div>
          <p className="text-yellow-400 font-medium mb-1">↑ Improve</p>
          <ul className="space-y-0.5">
            {feedback.improvements.map((tip, i) => (
              <li key={i} className="text-slate-300 pl-3">• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
