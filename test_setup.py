from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatOpenAI(
    model="gemini-2.5-flash",
    api_key=lambda: os.environ["GEMINI_API_KEY"],
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
response = llm.invoke("Say 'Setup Complete!' If you can hear me.")
print(response.content)