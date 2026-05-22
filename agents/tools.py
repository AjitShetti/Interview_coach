from langchain_core.tools import tool
from typing import Literal
import json

interview_state = {
    "difficulty": "medium",
    "scores": [],
    "questions_asked": 0,
    "topics_covered": []
}

@tool
def get_easy_questions(topic: str) -> str:
    """Get an easy/foundational question about a topic.
    Use when candidate is struggling (avg score < 5)."""

    questions = {
        "python": "What are the basic data types in Python?",
        "async": "What's the difference between sync and async code?",
        "databases": "What is a primary key in a database?",
        "api": "What does REST stand for?",
    }

    return questions.get(topic.lower(), f"Explain the basics of {topic}")

@tool
def get_hard_questions(topic: str) -> str:
    """Get a challenging question about a topic.
    Use when candidate is performing well (avg score > 7)."""
    questions = {
        "python": "How would you implement a custom metaclass? Give a use case.",
        "async": "Design an async rate limiter using asyncio primitives.",
        "databases": "Explain transaction isolation levels and when to use each.",
        "api": "How would you handle eventual consistency in a microservices API?",
    }

    return questions.get(topic.lower(), f"Explain advanced topics in {topic}")


@tool
def evaluate_answer(answer: str, question:str) -> str:
    """Evaluate a candidate's answer and return score with feedback.
    Always use this after receiving an answer."""

    word_count = len(answer.split())

    if word_count < 10:
        score = 3
        feedback = "Answer too brief, needs more detail"
    elif word_count < 30:
        score = 5
        feedback = "Decent answer, could elaborate more"
    elif word_count < 60:
        score = 7
        feedback = "Good explanation with solid understanding"
    else:
        score = 8
        feedback = "Comprehensive answer showing expertise"

    interview_state['scores'].append(score)

    return json.dumps({
        "score": score,
        "feedback": feedback,
        "avg_score": sum(interview_state["scores"]) / len(interview_state["scores"])
    })


@tool
def get_interview_status() -> str:
    """Get current interview status including average score and questions asked.
    Use this to decide difficulty level."""
    scores = interview_state["scores"]
    return json.dumps({
        "questions_asked": len(scores),
        "average_score": sum(scores) / len(scores) if scores else 0,
        "current_difficulty": interview_state["difficulty"],
        "should_increase_difficulty": len(scores) >= 2 and sum(scores[-2:]) / 2 > 7,
        "should_decrease_difficulty": len(scores) >= 2 and sum(scores[-2:]) / 2 < 5
    })


@tool
def set_difficulty(level: Literal["easy", "medium", "hard"]) -> str:
    """Set the interview difficulty level.
    Use based on candidate performance."""
    interview_state["difficulty"] = level
    return f"Difficulty set to {level}"