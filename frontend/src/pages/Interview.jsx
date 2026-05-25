import { useState, useRef } from 'react'
import SetupForm from '../components/SetupForm'
import ChatWindow from '../components/ChatWindow'
import { submitAnswer } from '../api/interviews'
import { generateReport } from '../api/reports'
import useInterviewStore from '../store/interviewStore'
import ReportView from '../components/ReportView'
import toast from 'react-hot-toast'

export default function Interview() {
  const [started, setStarted] = useState(false)
  const [inputText, setInputText] = useState('')
  const [report, setReport] = useState(null)
  const inputRef = useRef(null)

  const {
    sessionId,
    messages,
    isComplete,
    isLoading,
    questionsRemaining,
    addUserMessage,
    addInterviewerMessage,
    setLoading,
    setComplete,
    setQuestionsRemaining,
  } = useInterviewStore()

  const handleSend = async () => {
    const answer = inputText.trim()
    if (!answer || isLoading) return

    setInputText('')
    addUserMessage(answer)
    setLoading(true)

    try {
      const { data } = await submitAnswer(sessionId, answer)
      const fb = data.feedback

      if (data.is_complete) {
        setComplete()
        addInterviewerMessage('Interview complete! Generating your report...', fb)
        // Auto-generate report
        const { data: reportData } = await generateReport(sessionId)
        setReport(reportData)
      } else {
        setQuestionsRemaining(data.questions_remaining)
        addInterviewerMessage(data.next_question, fb)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error submitting answer')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">

        {/* Left panel — setup */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-700 rounded-2xl p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <h2 className="text-lg font-semibold text-white">Interview Setup</h2>
          </div>
          <SetupForm onStarted={() => setStarted(true)} />

          {started && !isComplete && questionsRemaining > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm text-center">
                {questionsRemaining} question{questionsRemaining !== 1 ? 's' : ''} remaining
              </p>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                <div
                  className="bg-cyan-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${100 - (questionsRemaining / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right panel — chat or report */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
          {!started ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              Configure your interview and click <strong className="text-slate-300 mx-1">Start Interview</strong>
            </div>
          ) : isComplete && report ? (
            <div className="flex-1 overflow-y-auto p-6">
              <ReportView report={report} />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                <ChatWindow messages={messages} isLoading={isLoading} />
              </div>

              {/* Input */}
              {!isComplete && (
                <div className="border-t border-slate-700 p-4 flex gap-3">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    disabled={isLoading}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-50 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-5 rounded-xl font-semibold transition-colors self-end py-2.5"
                  >
                    Send
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
