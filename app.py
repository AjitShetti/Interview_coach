from dotenv import load_dotenv
load_dotenv()

import streamlit as st
import uuid
from interview_coach import InterviewCoach, TOPIC_DEFAULTS

st.set_page_config(page_title="AI Interview Coach", page_icon="🎯", layout="wide")

# --- Session State Init ---
if "coach" not in st.session_state:
    st.session_state.coach = None
if "session_id" not in st.session_state:
    st.session_state.session_id = None
if "messages" not in st.session_state:
    st.session_state.messages = []
if "interview_complete" not in st.session_state:
    st.session_state.interview_complete = False

# --- Sidebar ---
with st.sidebar:
    st.header("🎯 Interview Setup")

    position = st.text_input("Position", "Senior Python Developer")
    level = st.selectbox("Level", ["junior", "mid", "senior", "staff"])
    interview_type = st.selectbox(
        "Type",
        ["technical", "behavioral", "system_design", "dsa"],
        format_func=lambda t: t.replace("_", " ").title(),
    )
    job_desc = st.text_area(
        "Job Description (optional)",
        placeholder="Paste a job description for targeted questions...",
    )
    num_questions = st.slider("Number of Questions", 3, 10, 5)

    if st.button("Start Interview", type="primary"):
        st.session_state.coach = InterviewCoach(
            job_description=job_desc if job_desc.strip() else None,
            interview_type=interview_type,
            level=level,
            position=position,
        )
        st.session_state.session_id = str(uuid.uuid4())
        st.session_state.messages = []
        st.session_state.interview_complete = False

        # Topics are derived from interview_type; custom JD will further refine questions via RAG
        topics = TOPIC_DEFAULTS.get(interview_type, TOPIC_DEFAULTS["technical"])
        welcome = st.session_state.coach.start_interview(
            st.session_state.session_id,
            topics[:num_questions],
        )
        st.session_state.messages.append({"role": "assistant", "content": welcome})
        st.rerun()

# --- Main Area ---
st.title("🎯 AI Interview Coach")

if st.session_state.coach is None:
    st.info("👈 Configure your interview in the sidebar and click **Start Interview**")
else:
    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.write(message["content"])
            if "feedback" in message:
                with st.expander("View Feedback"):
                    fb = message["feedback"]
                    col1, col2 = st.columns(2)
                    col1.metric("Score", f"{fb.score}/10")
                    col2.write(f"**Improvements:** {fb.improvements}")

    # Chat input
    if not st.session_state.interview_complete:
        if prompt := st.chat_input("Type your answer here..."):
            st.session_state.messages.append({"role": "user", "content": prompt})

            result = st.session_state.coach.submit_answer(
                st.session_state.session_id, prompt
            )

            if "error" in result:
                st.error(result["error"])
            elif result["is_complete"]:
                st.session_state.interview_complete = True
                report = st.session_state.coach.generate_report(st.session_state.session_id)

                report_md = f"""
## Interview Complete! 🎉

**Overall Score: {report.overall_score}/10** | **Recommendation: {report.recommendation.upper()}**

### Summary
{report.summary}

### ✅ Strengths
{chr(10).join('- ' + s for s in report.strengths)}

### 🔧 Areas to Improve
{chr(10).join('- ' + a for a in report.areas_to_improve)}

### 📚 Suggested Topics to Study
{chr(10).join('- ' + t for t in report.suggested_topics_to_study)}
"""
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": report_md,
                })
            else:
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": result["next_question"],
                    "feedback": result["feedback"],
                })

            st.rerun()
    else:
        st.success("✅ Interview complete! See the report above.")
        if st.button("Start New Interview"):
            for key in ["coach", "session_id", "messages", "interview_complete"]:
                st.session_state[key] = None if key != "messages" else []
            st.session_state.interview_complete = False
            st.rerun()