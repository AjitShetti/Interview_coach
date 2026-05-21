from dotenv import load_dotenv
load_dotenv()

from chains.interviewer import create_interviewer_with_history, get_session_history
from chains.evaluator import create_evaluator_simple, create_report_generator
from rag.setup import setup_interview_rag
from chains.topic_extractor import create_topic_extractor


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
    "interview_type": INTERVIEW_TYPES["technical"], 
    "level": "senior",
    "focus_area": "Python internals",
    "interviewer_style": INTERVIEWER_STYLES["neutral"], 
    "total_questions": 5
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
        # Inner loop so 'history' command doesn't waste a question turn
        while True:
            answer = input("You: ")

            if answer.lower() == 'quit':
                break

            if answer.lower() == 'history':
                print("\n" + "-" * 40)
                print("CONVERSATION HISTORY")
                print("-" * 40)
                history_object = get_session_history(session_id)
                for msg in history_object.messages:
                    if msg.type != "system":
                        role = "Interviewer" if msg.type == "ai" else "You"
                        print(f"[{role}]: {msg.content}\n")
                print("-" * 40 + "\n")
                continue  # Loop back — same question, no turn wasted

            break  # Normal answer — exit inner loop and proceed to evaluation

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

    # Guard: only generate report if at least 1 question was answered
    if not scores:
        print("\nNo answers recorded. Exiting without generating a report.")
        return

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

    print(f"\nSkill Breakdown:")
    print(f"  Technical Skills:     {report.technical_skills}/10")
    print(f"  Communication Skills: {report.communication_skills}/10")
    print(f"  Problem Solving:      {report.problem_solving}/10")

    print(f"\nSuggested Topics to Study:")
    for topic in report.suggested_topics_to_study:
        print(f"  📚 {topic}")


def run_rag_interview():
    # Extract topics automatically from the JD

    print("Extracting topics from job description...")
    extractor = create_topic_extractor()

    jd_text = open("data/job_descriptions/senior_python.txt").read()

    topics_obj = extractor.invoke(f"Extract interview topics from this JD:\n\n{jd_text}")

    # Use must_have topics for the interview
    topics = topics_obj.must_have[:5]  # Limit to 5
    print(f"Topics to cover: {topics}")

    # Setup RAG
    rag_components = setup_interview_rag("data/job_descriptions/senior_python.txt")
    question_gen = rag_components["question_generator"]
    previous_questions = []
    print("\n" + "=" * 50)
    print("RAG-Powered Interview")
    print("=" * 50)

    for i, topic in enumerate(topics, 1):
        question = question_gen.invoke({
            "topic": topic,
            "difficulty": "senior",
            "previous_questions": ", ".join(previous_questions) if previous_questions else "None"
        })

        print(f"\nQ{i} ({topic}):\n{question}")
        previous_questions.append(question[:50] + "...")
        answer = input("\nYour answer: ")

        if answer.lower() == 'quit':
            break

        print("-" * 30)

if __name__ == "__main__":
    mode = input("Choose mode - (1) Standard Interview  (2) RAG Interview: ").strip()
    if mode == "2":
        run_rag_interview()
    else:
        run_interview_with_feedback()