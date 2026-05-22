from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from pydantic import SecretStr
import os

from agents.tools import (
    get_easy_questions,
    get_hard_questions,
    get_interview_status,
    evaluate_answer,
    set_difficulty
)

AGENT_SYSTEM_PROMPT = """
You are an adaptive technical interview coach.

Your job is to conduct a fair but thorough interview that adjusts to the candidate's level.

Strategy:
1. Start with medium difficulty
2. If avg_score > 7 for 2+ questions, increase difficulty
3. If avg_score < 5 for 2+ questions, decrease difficulty
4. Always evaluate answers before asking next question
5. Cover different topics throughout the interview

Be encouraging but honest.
After each answer, briefly acknowledge it before moving on.
"""

def create_interview_agent():

    tools = [
        get_easy_questions,
        get_hard_questions,
        get_interview_status,
        evaluate_answer,
        set_difficulty
    ]

    llm = ChatOpenAI(
        model="gemini-2.5-flash-lite",
        temperature=0.5,
        max_completion_tokens=400,
        api_key=SecretStr(os.environ.get("GEMINI_API_KEY", "")),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    agent = create_react_agent(
        model=llm,
        tools=tools,
        state_modifier=AGENT_SYSTEM_PROMPT,
    )


    return agent