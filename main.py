
from dotenv import load_dotenv
from chains.interviewer import create_interviewer_with_history, get_session_history
from chains.evaluator import create_evaluator_simple, create_report_generator

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
INTERVIEWER_STYLES = {
    "friendly": "Be warm, encouraging, help candidates feel comfortable.",
    "challenging": "Push back on answers, ask follow-ups, test depth.",
    "neutral": "Professional and straightforward, minimal feedback."
}

def run_interview_with_feedback():
    interviewer = create_interviewer_with_history()
    evaluator = create_evaluator_simple()

    session_id = "interview_001"
    config = {"configurable": {"session_id": session_id}}

    interview_config = {
        "interview_type": "technical Python",
        "level": "senior",
        "focus_area": "Python internals"
    }

    scores = []
    transcript = []

    # Start interview
    question = interviewer.invoke(
        {**interview_config, "input": "Start the interview"},
        config=config
    )
    print(f"\nInterviewer: {question}\n")
    current_question = question

    for i in range(5):  # 5 questions
        answer = input("You: ")
        if answer.lower() == 'quit':
            break

        # Evaluate the answer
        feedback = evaluator.invoke({
            "question": current_question,
            "level": "senior",
            "answer": answer
        })

        scores.append(feedback.score)
        transcript.append(f"Q: {current_question}\nA: {answer}")

        # Show score
        print(f"\n[Score: {feedback.score}/10 - {feedback.understanding}]")
        if feedback.improvements:
            print(f"[Tip: {feedback.improvements[0]}]")

        # Get next question
        next_input = f"The candidate answered: {answer}"
        if feedback.follow_up_question:
            next_input += f"\n\nConsider asking this follow-up: {feedback.follow_up_question}"

        question = interviewer.invoke(
            {**interview_config, "input": next_input},
            config=config
        )
        print(f"\nInterviewer: {question}\n")
        current_question = question

    # Generate final report
    print("\n" + "=" * 50)
    print("INTERVIEW REPORT")
    print("=" * 50)

    report_gen = create_report_generator()
    report = report_gen.invoke({
        "position": "Senior Python Developer",
        "level": "senior",
        "interview_type": "technical",
        "transcript": "\n\n".join(transcript),
        "scores": scores
    })

    print(f"\nOverall Score: {report.overall_score}/10")
    print(f"Recommendation: {report.recommendation.upper()}")
    print(f"\nSummary: {report.summary}")
    print(f"\nStrengths:")
    for s in report.strengths:
        print(f"  ✓ {s}")
    print(f"\nAreas to Improve:")
    for a in report.areas_to_improve:
        print(f"  • {a}")