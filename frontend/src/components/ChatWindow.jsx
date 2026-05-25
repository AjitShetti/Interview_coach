import { useEffect, useRef } from 'react'
import FeedbackCard from './FeedbackCard'

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-cyan-600 text-white rounded-br-sm'
                : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-sm'
            }`}
          >
            {msg.role === 'interviewer' && (
              <p className="text-cyan-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                Interviewer
              </p>
            )}
            {msg.content}
            {msg.feedback && <FeedbackCard feedback={msg.feedback} />}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-5 py-3">
            <div className="flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
