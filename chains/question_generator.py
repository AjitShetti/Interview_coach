from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import SecretStr
import os

def format_docs(docs):
    """Format retrieved documents for the prompt"""

    return "\n\n".join(doc.page_content for doc in docs)

def create_question_generator(retriever):
    """Create a RAG chain for generating interview questions."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert technical interviewer.
Generate a relevant interview question based on the job requirements below.
The question should:
- Test specific skills mentioned in the job description
- Be appropriate for the candidate's level
- Be clear and focused on one topic
Job Requirements Context:
{context}
"""),
        ("human", """Generate a {difficulty} level question about {topic}.
Previous questions asked: {previous_questions}
Ensure this question is different from previous ones.""")
    ])

    llm = ChatOpenAI(
        model="gemini-2.5-flash",
        temperature=0.7,
        api_key=SecretStr(os.environ.get("GEMINI_API_KEY", " ")),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    chain = (
        {
            "context": lambda x: format_docs(retriever.invoke(x["topic"])),
            "difficulty": lambda x: x["difficulty"],
            "topic": lambda x: x["topic"],
            "previous_questions": lambda x: x.get("previous_questions", "None")
        }
        | prompt
        | llm
        | StrOutputParser()

    )

    return chain
    