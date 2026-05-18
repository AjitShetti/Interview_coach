from dotenv import load_dotenv
from chains.interviewer import create_interviewer_chain

load_dotenv()

INTERVIEW_TYPES = {
    "behavioral": """Focus on STAR method questions.
        Ask about past experiences, challenges, teamwork.""",

    "system_design": """Ask about architecture, scalability,
        trade-offs. Start high-level, then dive deep.""",

    "coding": """Present coding problems. Ask for approach first,
        then implementation details. Probe for edge cases.""",

    "technical": """Test domain knowledge. Mix conceptual
        questions with practical scenarios."""
}

def run_basic_interview():
    interviewer = create_interviewer_chain()

    interview_mode = "technical"

    config = {
        "interview_type": interview_mode,
        "level":"Senoir",
        "focus_area": "Python fundamentals, OOP, and best practices",
        "total_questions": 5,
    }

    print("=" * 50)
    print("AI Interview Coach - Basic Mode")
    print("=" * 50)
    print("Type 'quit' to exit\n")

    response = interviewer.invoke({
        **config,
        "question_number":1,
        "input":"Start the interview with your first question"
    })
    print(f"Interviewer: {response}\n")

    question_num = 1
    while question_num < config['total_questions']:
        answer = input("You : " )
        if answer.lower() == 'quit':
            break
        question_num += 1

    
        response = interviewer.invoke({
            **config,
            "question_number":question_num,
            "input":f"The candidate answered: {answer}\n\nAcknowledge briefly and ask question {question_num}."
        })

        print(f"\nInterviewer : {response}\n")
    
    print("\nInterview Complete, thankyou for participating!")

if __name__=="__main__":
    run_basic_interview()