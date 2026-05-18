from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
import os

INTERVIEWER_SYSTEM_PROMPT = """You are an expert technical interviewer conducting a {interview_type} interview.

Your role:
- Ask one clear, focused question at a time
- Questions should be appropriate for a {level} position
- Be professional but encouraging
- After the candidate answers, provide brief acknowledgment before the next question

Interview focus: {focus_area}

Current question number: {question_number} of {total_questions}
"""

interviewer_prompt = ChatPromptTemplate.from_messages([
    ("system", INTERVIEWER_SYSTEM_PROMPT),
    MessagesPlaceholder(variable_name="history", optional=True),
    ("human", "{input}")
])

def create_interviewer_chain(
        model: str = "gemini-2.5-flash",
        temperature: float = 0.7
):
    """Creating the interviewer chain."""

    llm = ChatOpenAI(
        model=model,
        temperature=temperature,
        api_key=lambda: os.environ["GEMINI_API_KEY"],
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"

    )

    chain = interviewer_prompt | llm | StrOutputParser()

    return chain