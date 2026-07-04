import { create } from 'zustand'

const useInterviewStore = create((set, get) => ({
  sessionId: null,
  messages: [],       // { role: 'interviewer'|'user', content, feedback? }
  isComplete: false,
  questionsRemaining: 0,
  isLoading: false,
  error: null,

  setSession: (sessionId, firstQuestion, welcomeMessage, numQuestions) =>
    set({
      sessionId,
      isComplete: false,
      error: null,
      questionsRemaining: numQuestions,
      messages: [
        { role: 'interviewer', content: `${welcomeMessage}\n\n${firstQuestion}` },
      ],
    }),

  addUserMessage: (content) =>
    set((state) => ({
      messages: [...state.messages, { role: 'user', content }],
    })),

  addInterviewerMessage: (content, feedback) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: 'interviewer', content, feedback },
      ],
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setComplete: () => set({ isComplete: true, questionsRemaining: 0 }),

  setQuestionsRemaining: (n) => set({ questionsRemaining: n }),

  reset: () =>
    set({
      sessionId: null,
      messages: [],
      isComplete: false,
      questionsRemaining: 0,
      isLoading: false,
      error: null,
    }),
}))

export default useInterviewStore
