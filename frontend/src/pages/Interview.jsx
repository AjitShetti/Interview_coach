import { useState, useRef, useEffect } from 'react'
import SetupForm from '../components/SetupForm'
import ChatWindow from '../components/ChatWindow'
import { submitAnswer } from '../api/interviews'
import { generateReport } from '../api/reports'
import useInterviewStore from '../store/interviewStore'
import ReportView from '../components/ReportView'
import CodeEditorPanel from '../components/CodeEditorPanel'
import toast from 'react-hot-toast'
import { animate, stagger } from 'animejs'
import { Bell, Settings, Timer, Info, Code, Mic, Send, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Header from '../components/Header'

export default function Interview() {
  const [started, setStarted] = useState(false)
  const [inputText, setInputText] = useState('')
  const [report, setReport] = useState(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

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

  const handleCodeSubmit = (formattedAnswer) => {
    setShowCodeEditor(false)
    setInputText(formattedAnswer)
    if (isLoading) return
    addUserMessage(formattedAnswer)
    setLoading(true)

    submitAnswer(sessionId, formattedAnswer).then(({ data }) => {
      const fb = data.feedback
      if (data.is_complete) {
        setComplete()
        addInterviewerMessage('Interview complete! Generating your report...', fb)
        return generateReport(sessionId).then(({ data: reportData }) => {
          setReport(reportData)
        })
      } else {
        setQuestionsRemaining(data.questions_remaining)
        addInterviewerMessage(data.next_question, fb)
      }
    }).catch(err => {
      toast.error(err.response?.data?.detail || 'Error submitting answer')
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleEndPractice = async () => {
    const answer = inputText.trim()
    const hasUserAnswers = messages.some(msg => msg.role === 'user') || !!answer

    if (!hasUserAnswers) {
      navigate('/dashboard')
      return
    }

    if (answer && !isLoading) {
      addUserMessage(answer)
      setInputText('')
      try {
        await submitAnswer(sessionId, answer)
      } catch (err) {
        console.error(err)
      }
    }
    
    setLoading(true)
    try {
      setComplete()
      addInterviewerMessage('Interview complete! Generating your report...')
      const { data: reportData } = await generateReport(sessionId)
      setReport(reportData)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error generating report')
    } finally {
      setLoading(false)
    }
  }

  const containerRef = useRef(null)

  useEffect(() => {
    if (started && containerRef.current) {
      animate('.interview-panel', {
        translateY: [20, 0],
        opacity: [0, 1],
        ease: 'outExpo',
        duration: 800,
        delay: stagger(100)
      })
    }
  }, [started, showCodeEditor])

  return (
    <div className="bg-background text-on-surface h-screen flex flex-col overflow-hidden font-body">
      {/* TopAppBar */}
      <Header 
        leftContent={
          started && !isComplete && (
            <span className="px-2 py-1 bg-surface-container text-text-secondary font-mono-sm text-mono-sm rounded flex items-center gap-1 ml-4 border border-border-subtle">
              <Timer size={14} /> 45:00
            </span>
          )
        }
        rightContent={
          <>
            <button className="p-2 text-text-secondary hover:text-primary transition-colors duration-200 active:scale-[0.98]">
              <Bell size={20} strokeWidth={1.5} />
            </button>
            <button className="p-2 text-text-secondary hover:text-primary transition-colors duration-200 active:scale-[0.98]">
              <Settings size={20} strokeWidth={1.5} />
            </button>
            
            {started && !isComplete && (
              <button 
                onClick={handleEndPractice}
                className="px-4 py-2 bg-error-container text-on-error-container font-body-sm text-body-sm rounded border border-error transition-all duration-200 active:scale-[0.98] hover:bg-error hover:text-on-error"
              >
                End Session
              </button>
            )}
          </>
        }
      />

      {/* Main Split View */}
      <main className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {!started ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
            <div className="w-full max-w-lg bg-surface border border-border-base rounded-2xl p-8 shadow-sm">
              <h2 className="text-headline-md font-headline-md text-on-surface mb-6 text-center">Technical Prep</h2>
              <SetupForm onStarted={() => setStarted(true)} />
            </div>
          </div>
        ) : isComplete && report ? (
          <div className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="max-w-4xl mx-auto bg-surface border border-border-base rounded-2xl p-8">
              <ReportView report={report} />
            </div>
          </div>
        ) : (
          <>
            {/* Left Panel: AI Chat */}
            <section className={`flex flex-col border-b lg:border-b-0 lg:border-r border-border-subtle bg-background transition-all duration-300 ${showCodeEditor ? 'h-1/2 lg:h-auto lg:w-[400px] lg:flex-shrink-0' : 'flex-1'}`}>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container">
                <div>
                  <h2 className="font-body-lg text-body-lg text-on-surface font-medium">Technical Interview</h2>
                  <p className="font-body-sm text-body-sm text-text-secondary mt-1">Problem Solving & Algorithms</p>
                </div>
                <div className="flex items-center gap-2">
                  {!showCodeEditor && (
                    <button
                      onClick={() => setShowCodeEditor(true)}
                      className="px-3 py-1.5 bg-primary-container text-on-primary-container font-body-sm text-body-sm rounded hover:bg-accent-hover transition-colors flex items-center gap-2"
                    >
                      <Code size={16} /> Open Editor
                    </button>
                  )}
                  <button className="text-text-secondary hover:text-on-surface transition-colors p-2">
                    <Info size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-6 bg-background">
                <ChatWindow messages={messages} isLoading={isLoading} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border-subtle bg-surface-container">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="w-full bg-surface border border-border-subtle rounded-lg px-4 py-3 text-body font-body text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container placeholder:text-text-disabled resize-none disabled:opacity-50 transition-colors pr-24"
                    placeholder="Type your response..."
                    rows={3}
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button className="p-1.5 text-text-secondary hover:text-on-surface transition-colors disabled:opacity-50" disabled={isLoading}>
                      <Mic size={18} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !inputText.trim()}
                      className="p-1.5 bg-primary-container text-on-primary-container rounded transition-transform active:scale-[0.98] disabled:opacity-50 disabled:bg-surface-variant disabled:text-text-disabled"
                    >
                      <Send size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Panel: Code Editor */}
            {showCodeEditor && (
              <section className="flex-1 flex flex-col bg-surface relative interview-panel">
                <CodeEditorPanel 
                  onClose={() => setShowCodeEditor(false)} 
                  onSubmit={handleCodeSubmit} 
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
