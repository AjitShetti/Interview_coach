import { useState, useRef } from 'react'
import SetupForm from '../components/SetupForm'
import ChatWindow from '../components/ChatWindow'
import { submitAnswer, getTTSAudio } from '../api/interviews'
import { generateReport } from '../api/reports'
import useInterviewStore from '../store/interviewStore'
import { useEffect } from 'react'
import ReportView from '../components/ReportView'
import toast from 'react-hot-toast'

export default function AudioInterview() {
  const [started, setStarted] = useState(false)
  const [inputText, setInputText] = useState('')
  const [report, setReport] = useState(null)
  const inputRef = useRef(null)

  // Audio / Voice state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const audioRef = useRef(null)
  const recognitionRef = useRef(null)
  const lastPlayedIndex = useRef(-1)

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  // Unlock Audio context on first user interaction
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

  // Initialize Speech Recognition
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

  // Play TTS helper
  const playAudio = async (text) => {
    try {
      setIsPlaying(true)
      const url = await getTTSAudio(text)
      audioRef.current.src = url
      await audioRef.current.play()
      audioRef.current.onended = () => setIsPlaying(false)
    } catch (err) {
      console.error('TTS error', err)
      setIsPlaying(false)
    }
  }

  // Auto-play new interviewer messages
  useEffect(() => {
    if (!isVoiceEnabled || messages.length === 0) return

    // Find all new interviewer messages since last played
    const newMessages = messages
      .slice(lastPlayedIndex.current + 1)
      .filter((msg) => msg.sender === 'interviewer')

    if (newMessages.length > 0) {
      const combinedText = newMessages.map((m) => m.text).join('. ')
      
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop()
      }
      playAudio(combinedText)
      
      lastPlayedIndex.current = messages.length - 1
    }
  }, [messages, isVoiceEnabled, isListening])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser. Try Chrome.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      // Auto-stop any playing audio if we start talking
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
      <audio ref={audioRef} className="hidden" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">

        {/* Left panel — setup */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-700 rounded-2xl p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <h2 className="text-lg font-semibold text-white">Interview Setup</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Voice</span>
              <button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  isVoiceEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                } relative`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isVoiceEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <SetupForm 
            onInteract={unlockAudio}
            onStarted={() => setStarted(true)} 
          />

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
                <div className="border-t border-slate-700 p-4 flex gap-3 items-end">
                  <button
                    onClick={toggleMic}
                    disabled={isLoading}
                    title="Toggle Microphone"
                    className={`p-3 rounded-xl transition-colors disabled:opacity-50 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {/* SVG Mic Icon */}
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening..." : "Type your answer... (Enter to send)"}
                    rows={2}
                    disabled={isLoading}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-50 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-5 rounded-xl font-semibold transition-colors py-2.5"
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
