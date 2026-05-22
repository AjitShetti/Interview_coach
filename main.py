from dotenv import load_dotenv
load_dotenv()

import argparse
from rich.console import Console
from rich.panel import Panel
from interview_coach import InterviewCoach

console = Console()


def run_cli():
    parser = argparse.ArgumentParser(description="AI Interview Coach")
    parser.add_argument("--job", "-j", help="Path to job description file")
    parser.add_argument("--type", "-t", default="technical", help="Interview type")
    parser.add_argument("--level", "-l", default="senior", help="Position level")
    parser.add_argument("--position", "-p", default="Senior Python Developer", help="Job position")
    parser.add_argument("--questions", "-q", type=int, default=5, help="Number of questions")
    args = parser.parse_args()

    console.print(Panel.fit(
        "[bold cyan]AI Interview Coach[/bold cyan]\n"
        "Practice technical interviews with AI feedback",
        border_style="cyan"
    ))

    coach = InterviewCoach(
        job_description_path=args.job,
        interview_type=args.type,
        level=args.level,
        position=args.position
    )

    session_id = "cli_session"
    topics = ["Python", "system design", "algorithms", "best practices", "behavioral"]

    welcome = coach.start_interview(session_id, topics[:args.questions])
    console.print(f"\n[bold green]Interviewer:[/bold green] {welcome}\n")

    while True:
        answer = console.input("[bold blue]You:[/bold blue] ")

        if answer.lower() in ["quit", "exit", "q"]:
            console.print("[yellow]Interview ended early.[/yellow]")
            break

        result = coach.submit_answer(session_id, answer)

        if "error" in result:
            console.print(f"[red]Error:[/red] {result['error']}")
            break

        feedback = result["feedback"]
        console.print(
            f"\n[dim]Score: {feedback.score}/10 | {feedback.understanding}[/dim]"
        )

        if result["is_complete"]:
            console.print("\n[bold]Generating your interview report...[/bold]\n")
            report = coach.generate_report(session_id)

            strengths = "\n".join(f"  • {s}" for s in report.strengths)
            improvements = "\n".join(f"  • {a}" for a in report.areas_to_improve)
            topics_to_study = "\n".join(f"  📚 {t}" for t in report.suggested_topics_to_study)

            console.print(Panel(
                f"[bold]Overall Score: {report.overall_score}/10[/bold]\n"
                f"Recommendation: [cyan]{report.recommendation.upper()}[/cyan]\n\n"
                f"{report.summary}\n\n"
                f"[green]Strengths:[/green]\n{strengths}\n\n"
                f"[yellow]Areas to Improve:[/yellow]\n{improvements}\n\n"
                f"[blue]Suggested Topics to Study:[/blue]\n{topics_to_study}",
                title="Interview Report",
                border_style="green"
            ))
            break

        console.print(f"\n[bold green]Interviewer:[/bold green] {result['next_question']}\n")
        console.print(f"[dim](<{result['questions_remaining']} questions remaining>)[/dim]\n")


if __name__ == "__main__":
    run_cli()