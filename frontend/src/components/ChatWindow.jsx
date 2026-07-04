import { useEffect, useRef } from 'react'
import FeedbackCard from './FeedbackCard'
import { Bot, User } from 'lucide-react'

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col gap-6 overflow-y-auto flex-1 pr-1">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {msg.role === 'user' ? (
            <div className="w-8 h-8 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center flex-shrink-0 text-text-secondary overflow-hidden">
              <User size={18} strokeWidth={1.5} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-variant border border-border-subtle flex items-center justify-center flex-shrink-0">
              <Bot size={18} strokeWidth={1.5} className="text-text-secondary" />
            </div>
          )}
          
          <div className="flex-1 flex flex-col justify-end">
            <div
              className={`max-w-[90%] p-4 text-body font-body text-on-surface shadow-sm ${
                msg.role === 'user'
                  ? 'bg-surface-container-high border border-border-subtle rounded-lg rounded-tr-none self-end'
                  : 'bg-surface-container border border-border-subtle rounded-lg rounded-tl-none'
              }`}
            >
              {msg.role === 'interviewer' && (
                <p className="text-primary-container text-xs font-semibold mb-2 uppercase tracking-wide">
                  Interviewer
                </p>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.feedback && <FeedbackCard feedback={msg.feedback} />}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-surface-variant border border-border-subtle flex items-center justify-center flex-shrink-0">
            <Bot size={18} strokeWidth={1.5} className="text-text-secondary" />
          </div>
          <div className="bg-surface-container border border-border-subtle rounded-lg rounded-tl-none p-4 shadow-sm flex items-center gap-1.5 h-12">
            <span className="w-2 h-2 bg-primary-container rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-primary-container rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-primary-container rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
