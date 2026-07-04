from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from pydantic import SecretStr

from config import settings

INTERVIEWER_SYSTEM_PROMPT = """You are an expert technical interviewer conducting a {interview_type} interview.

Your role:
- Ask one clear, focused question at a time
- Reference previous answers when relevant
- Build on the conversation naturally
- For Behavioural interviews: gently guide the candidate to use the STAR method (Situation, Task, Action, Result).
- For DSA/Code submissions: if the candidate submits code, verify its logic, and ask follow-ups on edge cases or readability.
- Be professional but encouraging
- IMPORTANT: Do NOT say "Good question", "That's a great question", or similar fillers. Go straight to your question.

Interview type: {interview_type}
Interviewer style: {interviewer_style}
Position level: {level}
Focus area: {focus_area}
Total questions: {total_questions}

You have access to the full conversation history.
Use it to avoid repeating questions and ask relevant follow-ups.
"""

# Module-level session store — keyed by session_id, cleaned up when sessions end
_session_store: dict[str, InMemoryChatMessageHistory] = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """Get or create in-memory chat history for a session."""
    if session_id not in _session_store:
        _session_store[session_id] = InMemoryChatMessageHistory()
    return _session_store[session_id]


def clear_session_history(session_id: str) -> None:
    """Remove a session's history from memory (call when interview ends)."""
    _session_store.pop(session_id, None)


def create_interviewer_with_history():
    """Create an interviewer chain with automatic per-session message history."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", INTERVIEWER_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ])

    llm = ChatOpenAI(
        model=settings.model_name,
        api_key=SecretStr(settings.gemini_api_key),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )

    chain = prompt | llm | StrOutputParser()

    return RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history",
    )