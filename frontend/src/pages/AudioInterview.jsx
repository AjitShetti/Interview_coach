import { useState, useRef, useEffect } from 'react'
import SetupForm from '../components/SetupForm'
import { submitAnswer, getTTSAudio } from '../api/interviews'
import { generateReport } from '../api/reports'
import useInterviewStore from '../store/interviewStore'
import ReportView from '../components/ReportView'
import toast from 'react-hot-toast'
import { animate, stagger } from 'animejs'
import { Mic, User, Bot } from 'lucide-react'
import Header from '../components/Header'
import { useNavigate } from 'react-router-dom'

export default function AudioInterview() {
  const [started, setStarted] = useState(false)
  const [inputText, setInputText] = useState('')
  const [report, setReport] = useState(null)
  const [abVariant, setAbVariant] = useState('A') // A/B Test state
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // 50/50 split for A/B testing
    // Variant A: Hidden Transcript (Control)
    // Variant B: Visible Transcript
    const assignedVariant = Math.random() < 0.5 ? 'A' : 'B'
    setAbVariant(assignedVariant)
    
    // Mock Analytics Event Tracking
    console.log(`[Analytics] User assigned to A/B Test Variant: ${assignedVariant}`)
  }, [])

  // Audio / Voice state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const audioRef = useRef(null)
  const recognitionRef = useRef(null)
  const lastPlayedIndex = useRef(-1)

  const [displayedInterviewerMsg, setDisplayedInterviewerMsg] = useState("Let's begin.")

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
      audioRef.current.play().catch(() => {})
    }
  }

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

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setInputText((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : ''
            return prev + separator + finalTranscript + ' '
          })
        }
      }

      recognitionRef.current.onend = () => setIsListening(false)
      recognitionRef.current.onerror = () => setIsListening(false)
    }
  }, [SpeechRecognition])

  useEffect(() => {
    if (messages.length === 0) return

    const newMessages = messages
      .slice(lastPlayedIndex.current + 1)
      .filter((msg) => msg.role === 'interviewer')

    if (newMessages.length > 0) {
      const combinedText = newMessages.map((m) => m.content).join('. ')
      
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop()
      }

      const fetchAndPlay = async () => {
        try {
          const url = await getTTSAudio(combinedText)
          setDisplayedInterviewerMsg(combinedText) // Show text exactly when audio is ready
          audioRef.current.src = url
          setIsPlaying(true)
          await audioRef.current.play()
          audioRef.current.onended = () => setIsPlaying(false)
        } catch (err) {
          console.error('TTS error', err)
          setDisplayedInterviewerMsg(combinedText)
          setIsPlaying(false)
        }
      }

      fetchAndPlay()
      
      lastPlayedIndex.current = messages.length - 1
    }
  }, [messages])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser. Try Chrome.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      }
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSend = async () => {
    const answer = inputText.trim()
    if (!answer || isLoading) return

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setInputText('')
    addUserMessage(answer)
    setLoading(true)

    try {
      const { data } = await submitAnswer(sessionId, answer)
      
      if (data.is_complete) {
        setComplete()
        addInterviewerMessage('Interview complete! Generating your report...', data.feedback)
        const { data: reportData } = await generateReport(sessionId)
        setReport(reportData)
      } else {
        setQuestionsRemaining(data.questions_remaining)
        addInterviewerMessage(data.next_question, data.feedback)
      }
    } catch (err) {
      toast.error('Error submitting answer')
    } finally {
      setLoading(false)
    }
  }

  const handleEndPractice = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
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

  useEffect(() => {
    if (containerRef.current) {
      animate('.audio-interview-panel', {
        translateY: [20, 0],
        opacity: [0, 1],
        ease: 'outExpo',
        duration: 800,
        delay: stagger(100)
      })
    }
  }, [started])
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col relative overflow-hidden" ref={containerRef}>
        <audio ref={audioRef} className="hidden" />

      {!started ? (
        <div className="audio-interview-panel flex-1 flex flex-col items-center justify-center p-8 bg-background">
          <div className="w-full max-w-lg bg-surface border border-border-base rounded-2xl p-8 shadow-sm">
            <h2 className="text-headline-md font-headline-md text-on-surface mb-6 text-center">Voice Practice</h2>
            <SetupForm 
              onInteract={unlockAudio}
              onStarted={() => setStarted(true)} 
            />
          </div>
        </div>
      ) : isComplete && report ? (
        <div className="audio-interview-panel flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-4xl mx-auto bg-surface border border-border-base rounded-2xl p-8">
            <ReportView report={report} />
          </div>
        </div>
      ) : (
        <div className="audio-interview-panel flex-1 flex flex-col items-center justify-center p-8 max-w-[1120px] mx-auto w-full gap-16 relative">
          
          {/* Context Header */}
          <div className="text-center space-y-2 z-10 mt-12">
            <span className="inline-block px-3 py-1 rounded-full bg-surface border border-border-base text-mono-sm font-mono-sm text-text-secondary">
              Questions Remaining: {questionsRemaining}
            </span>
            <h2 className="text-headline-md font-headline-md italic text-on-surface">
              {isLoading ? 'Processing...' : 'Your turn to speak.'}
            </h2>
          </div>

          {/* Central Visualizer & Mic Area */}
          <div className="relative flex flex-col items-center justify-center h-64 w-full max-w-md z-10">
            {/* Dynamic Audio Visualizer (Background) - shows when playing or listening */}
            <div className={`absolute inset-0 flex items-center justify-center gap-1 opacity-60 transition-opacity duration-300 ${isPlaying || isListening ? 'opacity-100' : 'opacity-0'}`}>
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 rounded-full ${i % 2 === 0 ? 'bg-primary-container' : i % 3 === 0 ? 'bg-primary' : 'bg-surface-variant'} audio-bar`} 
                  style={{ height: `${Math.max(16, Math.random() * 80 + 20)}px` }}
                ></div>
              ))}
            </div>

            {/* Main Mic Toggle */}
            <button 
              onClick={toggleMic}
              disabled={isLoading || isPlaying}
              className={`relative z-20 w-24 h-24 rounded-full border-2 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group ${
                isListening 
                  ? 'border-error bg-surface glow-active' 
                  : isPlaying
                  ? 'border-primary-container bg-surface opacity-50 cursor-not-allowed'
                  : 'border-primary bg-surface hover:bg-surface-raised'
              }`}
            >
              <div className={`absolute inset-0 rounded-full transition-colors ${isListening ? 'bg-error/10' : 'bg-primary/5 group-hover:bg-primary/10'}`}></div>
              <Mic size={40} className={isListening ? "text-error" : "text-primary"} strokeWidth={1.5} />
            </button>
            
            <p className={`mt-6 text-mono-sm font-mono-sm tracking-widest uppercase transition-colors ${isListening ? 'text-error' : 'text-primary'}`}>
              {isListening ? 'Listening...' : isPlaying ? 'Speaking...' : 'Tap to speak'}
            </p>

            {/* Send Answer Button */}
            {inputText && !isListening && (
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="mt-4 px-6 py-2 bg-primary text-on-primary hover:bg-primary-hover active:scale-95 transition-all duration-200 rounded-full text-sm font-medium z-20 flex items-center gap-2 shadow-md"
              >
                Send Response
              </button>
            )}
          </div>

          {/* Live Transcription Feed - A/B Test Conditionally rendered for Variant B only */}
          {abVariant === 'B' && (
            <div className="w-full max-w-2xl h-64 bg-surface border border-border-base rounded-xl p-6 overflow-y-auto z-10 relative flex flex-col gap-6 mask-image-bottom">
            
            {/* AI Transcript */}
            <div className="flex flex-col gap-2 items-start max-w-[80%]">
              <span className="text-mono-sm font-mono-sm text-text-secondary flex items-center gap-2">
                <Bot size={14} /> Coach
              </span>
              <p className="text-body font-body text-text-cream leading-relaxed whitespace-pre-wrap">
                {displayedInterviewerMsg}
              </p>
            </div>

            {/* User Transcript (Live) */}
            {(inputText || isListening) && (
              <div className="flex flex-col gap-2 items-end self-end max-w-[80%]">
                <span className="text-mono-sm font-mono-sm text-primary flex items-center gap-2">
                  You <User size={14} />
                </span>
                <p className="text-body font-body text-text-secondary leading-relaxed text-right">
                  {inputText || '...'} 
                  {isListening && <span className="animate-pulse inline-block w-2 h-4 bg-primary/50 ml-1 translate-y-1"></span>}
                </p>
              </div>
            )}
            </div>
          )}

          {/* End Session Control */}
          <div className="fixed bottom-12 z-20">
            <button 
              onClick={handleEndPractice}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-transparent border border-border-base text-text-secondary text-mono-sm font-mono-sm hover:bg-error hover:text-on-error hover:border-error transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'End Practice Session'}
            </button>
          </div>

        </div>
      )}
      {/* Required styles for the Audio component visualization */}
      <style>{`
        .audio-bar {
            animation: pulse-bar 1s infinite alternate ease-in-out;
        }
        @keyframes pulse-bar {
            0% { transform: scaleY(0.2); }
            100% { transform: scaleY(1); }
        }
        .audio-bar:nth-child(even) { animation-duration: 0.8s; }
        .audio-bar:nth-child(3n) { animation-duration: 1.2s; animation-delay: 0.2s; }
        .audio-bar:nth-child(5n) { animation-duration: 0.9s; animation-delay: 0.4s; }
        
        .glow-active {
            box-shadow: 0 0 40px rgba(184, 92, 92, 0.2);
        }
        .mask-image-bottom {
            -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
      `}</style>
      </main>
    </div>
  )
}
