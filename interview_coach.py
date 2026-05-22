from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum

from chains.interviewer import create_interviewer_with_history
from chains.evaluator import create_report_generator, create_evaluator_simple, AnswerFeedback, InterviewReport
from rag.setup import setup_interview_rag
from config import settings

class InterviewPhase(Enum):
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"

@dataclass
class InterviewSession:
    """Holds all interview state."""
    session_id: str
    position: str
    level: str
    topics: List[str]
    phase: InterviewPhase = InterviewPhase.NOT_STARTED
    current_question: str = ""
    current_topic_index: int = 0
    questions_asked: List[str] = field(default_factory=list)
    answers: List[str] = field(default_factory=list)
    feedback: List[AnswerFeedback] = field(default_factory=list)
    transcript: List[dict] = field(default_factory=list)

class InterviewCoach:

    def __init__(
            self,
            job_description: str = None,
            job_description_path: str = None,
            interview_type: str = "technical",
            difficulty: str = "adaptive",
            position: str = "Software Engineer",
            level: str = "junior"
    ):
        self.interview_type = interview_type
        self.difficulty = difficulty
        self.position = position
        self.level = level

        #Initialize chains
        self.interviewer = create_interviewer_with_history()
        self.evaluator = create_evaluator_simple()
        self.report_generator = create_report_generator()

        #RAG Setup if JD provided
        self.rag_enabled = False
        self.questions_generator = None

        if job_description_path:
            rag_components = setup_interview_rag(job_description_path)
            self.questions_generator = rag_components["question_generator"]
            self.retriever = rag_components["retriever"]
            self.rag_enabled = True

        elif job_description:
            from rag.loader import create_docs_from_text, split_documents
            from rag.retriever import create_vector_store, create_retriever
            from chains.question_generator import create_question_generator

            docs = create_docs_from_text(job_description)
            chunks = split_documents(docs)
            vector_store = create_vector_store(chunks)
            self.retriever = create_retriever(vector_store)
            self.question_generator = create_question_generator(self.retriever)
            self.rag_enabled = True
    
        self.sessions : dict[str, InterviewSession] = {}



    def start_interview(self, session_id:str, topics:List[str] = None) -> str:
        """Start a new interview session."""
        if topics is None:
            topics = ["Python fundamentals", "async programming",
                      "system design", "problem solving", "best practices"]
        session = InterviewSession(
            session_id=session_id,
            position=self.position,
            level=self.level,
            topics=topics,
            phase=InterviewPhase.IN_PROGRESS
        )
        self.sessions[session_id] = session
        question = self._generate_question(session)
        session.current_question = question
        session.questions_asked.append(question)
        session.transcript.append({"role": "interviewer", "content": question})
        return f"Welcome! Let's begin your {self.level} {self.position} interview.\n\n{question}"
    

    
    def submit_answer(self, session_id: str, answer: str) -> dict:
        """Process candidate's answer and return feedback + next question."""
        session = self.sessions.get(session_id)
        if not session or session.phase != InterviewPhase.IN_PROGRESS:
            return {"error": "No active interview session"}
        session.answers.append(answer)
        session.transcript.append({"role": "candidate", "content": answer})
        # Evaluate answer
        feedback = self.evaluator.invoke({
            "question": session.current_question,
            "level": self.level,
            "answer": answer
        })
        session.feedback.append(feedback)
        # Check if interview is complete
        if len(session.questions_asked) >= settings.max_questions:
            session.phase = InterviewPhase.COMPLETED
            return {
                "feedback": feedback,
                "is_complete": True,
                "message": "Interview complete! Generating your report..."
            }
        # Adapt difficulty
        if self.difficulty == "adaptive":
            self._adjust_difficulty(session)
        # Next question
        session.current_topic_index += 1
        next_question = self._generate_question(session, previous_feedback=feedback)
        session.current_question = next_question
        session.questions_asked.append(next_question)
        session.transcript.append({"role": "interviewer", "content": next_question})
        return {
            "feedback": feedback,
            "next_question": next_question,
            "is_complete": False,
            "questions_remaining": settings.max_questions - len(session.questions_asked)
        }
    
    def _generate_question(
        self,
        session: InterviewSession,
        previous_feedback: AnswerFeedback = None
    ) -> str:
        """Generate the next interview question."""
        topic_index = session.current_topic_index % len(session.topics)
        topic = session.topics[topic_index]
        if self.rag_enabled and self.questions_generator:
            return self.questions_generator.invoke({
                "topic": topic,
                "difficulty": self.difficulty if self.difficulty != "adaptive" else "medium",
                "previous_questions": ", ".join(session.questions_asked[-3:]) or "None"
            })
        else:
            context = f"Ask a {self.difficulty} question about {topic}."
            if previous_feedback and previous_feedback.follow_up_question:
                context += f"\nConsider asking: {previous_feedback.follow_up_question}"
            return self.interviewer.invoke(
                {
                    "interview_type": self.interview_type,
                    "level": self.level,
                    "focus_area": topic,
                    "interviewer_style": "neutral",
                    "total_questions": settings.max_questions,
                    "input": context
                },
                config={"configurable": {"session_id": session.session_id}}
            )
        


    def _adjust_difficulty(self, session: InterviewSession):
        """Adjust difficulty based on recent performance."""
        if len(session.feedback) < 2:
            return
        recent_scores = [f.score for f in session.feedback[-2:]]
        avg = sum(recent_scores) / len(recent_scores)
        if avg >= 8:
            self.difficulty = "hard"
        elif avg <= 4:
            self.difficulty = "easy"
        else:
            self.difficulty = "medium"
    def generate_report(self, session_id: str) -> InterviewReport:
        """Generate final interview report for a session."""
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found")
        transcript_text = "\n\n".join([
            f"{'Q' if t['role'] == 'interviewer' else 'A'}: {t['content']}"
            for t in session.transcript
        ])
        scores = [f.score for f in session.feedback]
        return self.report_generator.invoke({
            "position": self.position,
            "level": self.level,
            "interview_type": self.interview_type,
            "transcript": transcript_text,
            "scores": scores
        })