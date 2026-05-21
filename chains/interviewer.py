#chains//interviewer.py

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from pydantic import SecretStr
import os

INTERVIEWER_SYSTEM_PROMPT = """You are an expert technical interviewer conducting a {interview_type} interview.

Your role:
- Ask one clear, focused question at a time
- Reference previous answers when relevant
- Build on the conversation naturally
- Be professional but encouraging

Interview type: {interview_type}
interviewer_style:{interviewer_style}
Position level: {level}
Focus area: {focus_area}
total_questions:{total_questions}

Remember:
You have access to the full conversation history.
Use it to avoid repeating questions and ask relevant follow-ups.
"""



session_store: dict[str, InMemoryChatMessageHistory] = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """Get or create chat history for a session."""
    if session_id not in session_store:
        session_store[session_id] = InMemoryChatMessageHistory()
    return session_store[session_id]

def create_interviewer_with_history():
    """Create interviewer with automatic history management."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", INTERVIEWER_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])

    llm = ChatOpenAI(
    model="gemini-2.5-flash",
    api_key=SecretStr(os.environ.get("GEMINI_API_KEY", "")),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
    chain = prompt | llm | StrOutputParser()

    # Wrap with history management
    chain_with_history = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history"
    )

    return chain_with_history

# Usage
# The interviewer should be created and invoked by the application code.
# Avoid running `create_interviewer_with_history()` at import time.