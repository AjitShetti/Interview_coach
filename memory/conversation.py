from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from typing import List, Set

store={}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    
    return store[session_id]

class InterviewMemory:
    """Extended memory that tracks interview state."""

    def __init__(self):
        self.chat_history = InMemoryChatMessageHistory()
        self.topics_covered: Set[str] = set()
        self.question_count: int = 0
        self.scores: List[int] = []

    def add_exchange(self, question: str, answer: str, topic: str, score: int | None = None):
        """Record a Q&A exchange with metadata."""
        self.chat_history.add_ai_message(question)
        self.chat_history.add_user_message(answer)
        self.topics_covered.add(topic)
        self.question_count += 1
        if score is not None:
            self.scores.append(score)

    def get_context(self) -> dict:
        """Get current interview context."""
        return {
            "messages": self.chat_history.messages,
            "topics_covered": list(self.topics_covered),
            "questions_asked": self.question_count,
            "average_score": sum(self.scores) / len(self.scores) if self.scores else None
        }

    def should_wrap_up(self, max_questions: int = 5) -> bool:
        """Check if interview should end."""
        return self.question_count >= max_questions