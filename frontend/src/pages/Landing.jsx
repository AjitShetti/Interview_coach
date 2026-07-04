import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { Mic, ArrowRight, PlayCircle, Terminal, Brain, Activity } from 'lucide-react';

export default function Landing() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const elements = containerRef.current.querySelectorAll('.stagger-item');
    animate(elements, {
      translateY: [12, 0],
      opacity: [0, 1],
      ease: 'outQuad',
      duration: 400,
      delay: stagger(80),
    });
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border-base transition-all duration-300">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-display tracking-tight text-text-primary flex items-center gap-2 hover:text-primary transition-colors duration-200">
            <Mic className="text-primary-container" size={24} strokeWidth={1.5} />
            Interview Coach
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden md:flex ml-2 bg-transparent border border-border-base text-text-primary hover:bg-surface-raised font-body text-sm px-4 py-2 rounded transition-all duration-200 active:scale-[0.98]">
            Log In
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary-container/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        {/* Hero Section */}
        <section className="max-w-[1120px] mx-auto px-12 pt-24 pb-32 flex flex-col items-center text-center relative z-10 grid-pattern min-h-[716px] justify-center border-b border-border-base">
          <div className="stagger-item opacity-0 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-base bg-surface-raised mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-body text-sm text-text-secondary">GPT-4 Powered Intelligence</span>
          </div>
          
          <h1 className="stagger-item opacity-0 font-display text-5xl md:text-[72px] leading-[1.05] tracking-tight text-text-primary mb-4 max-w-4xl">
            Master Your Next Interview with AI
          </h1>
          
          <p className="stagger-item opacity-0 font-body text-lg text-text-secondary mb-8 max-w-2xl leading-[1.7]">
            Experience highly realistic, technical, and behavioral interview simulations. Get immediate, actionable feedback on your tone, structure, and technical accuracy to land your dream role.
          </p>
          
          <div className="stagger-item opacity-0 flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-primary-container text-on-primary-container font-body text-sm px-8 py-4 rounded-lg hover:bg-accent-hover transition-colors duration-200 active:scale-[0.98] flex items-center gap-2 shadow-[0_0_20px_rgba(212,168,83,0.15)]"
            >
              Start Practicing
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
            <button className="bg-transparent border border-border-base text-text-primary hover:bg-surface-raised font-body text-sm px-8 py-4 rounded-lg transition-all duration-200 active:scale-[0.98] flex items-center gap-2">
              <PlayCircle size={18} strokeWidth={1.5} />
              Watch Demo
            </button>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="max-w-[1120px] mx-auto px-12 py-32">
          <div className="stagger-item opacity-0 mb-8 text-center">
            <h2 className="font-display text-[48px] text-text-primary">Precision Training Modules</h2>
            <p className="font-body text-base text-text-secondary mt-1">Tailored environments for every stage of the hiring process.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Feature 1: Voice AI (Tall Card) */}
            <div className="stagger-item opacity-0 bg-surface border border-border-base rounded-lg p-8 flex flex-col group hover:border-outline transition-colors duration-300 relative overflow-hidden md:col-span-4 md:row-span-2">
              <div className="absolute inset-0 bg-gradient-to-b from-surface-raised/50 to-transparent opacity-50 z-0"></div>
              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 rounded-lg bg-surface-raised border border-border-base flex items-center justify-center mb-4 group-hover:bg-accent-subtle transition-colors duration-300">
                  <Mic className="text-primary-container" size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-[32px] text-text-primary mb-2">Conversational Voice AI</h3>
                <p className="font-body text-base text-text-secondary mb-8">
                  Engage in fluid, real-time voice conversations. Our AI detects hesitation, assesses your tone, and evaluates the clarity of your spoken responses just like a human recruiter.
                </p>
              </div>
              <div className="relative z-10 w-full h-32 mt-auto border-t border-border-base pt-4 flex items-end justify-between gap-1 opacity-60">
                <div className="w-full bg-border-base rounded-t-sm h-[20%] animate-[pulse_2s_ease-in-out_infinite]"></div>
                <div className="w-full bg-border-base rounded-t-sm h-[60%] animate-[pulse_2.5s_ease-in-out_infinite]"></div>
                <div className="w-full bg-primary-container rounded-t-sm h-[100%] shadow-[0_0_10px_rgba(212,168,83,0.3)]"></div>
                <div className="w-full bg-border-base rounded-t-sm h-[40%] animate-[pulse_3s_ease-in-out_infinite]"></div>
                <div className="w-full bg-border-base rounded-t-sm h-[70%] animate-[pulse_2.2s_ease-in-out_infinite]"></div>
                <div className="w-full bg-border-base rounded-t-sm h-[30%] animate-[pulse_2.8s_ease-in-out_infinite]"></div>
              </div>
            </div>

            {/* Feature 2: Technical Coding (Wide Card) */}
            <div className="stagger-item opacity-0 md:col-span-8 bg-surface border border-border-base rounded-lg p-8 flex flex-col md:flex-row gap-6 group hover:border-outline transition-colors duration-300 items-center overflow-hidden relative">
              <div className="flex-1 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-surface-raised border border-border-base flex items-center justify-center mb-4 group-hover:bg-accent-subtle transition-colors duration-300">
                  <Terminal className="text-primary-container" size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-[32px] text-text-primary mb-2">Technical Coding Interviews</h3>
                <p className="font-body text-base text-text-secondary">
                  Tackle algorithmic challenges in an integrated IDE. The AI acts as a collaborative interviewer, offering hints when you're stuck and evaluating your time/space complexity tradeoffs.
                </p>
              </div>
              <div className="flex-1 w-full bg-code-bg border border-border-base rounded-lg p-4 font-mono text-sm text-text-secondary shadow-inner relative z-10">
                <div className="flex items-center gap-2 mb-2 border-b border-border-base pb-2">
                  <div className="w-2 h-2 rounded-full bg-border-base"></div>
                  <div className="w-2 h-2 rounded-full bg-border-base"></div>
                  <div className="w-2 h-2 rounded-full bg-border-base"></div>
                  <span className="text-[10px] ml-2">solution.py</span>
                </div>
                <div className="text-primary-container inline">def</div> <div className="inline text-text-primary">two_sum(nums, target):</div><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<div className="inline text-text-secondary"># AI: Good choice using a hash map</div><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;seen = {'{}'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<div className="inline text-primary-container">for</div> i, num <div className="inline text-primary-container">in</div> enumerate(nums):<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;diff = target - num<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div className="inline text-primary-container">if</div> diff <div className="inline text-primary-container">in</div> seen:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div className="inline text-primary-container">return</div> [seen[diff], i]
              </div>
            </div>

            {/* Feature 3: STAR Method (Wide Card) */}
            <div className="stagger-item opacity-0 md:col-span-8 bg-surface border border-border-base rounded-lg p-8 flex flex-col justify-between group hover:border-outline transition-colors duration-300 relative overflow-hidden">
              <Brain className="absolute -right-8 -bottom-8 w-32 h-32 text-surface-raised opacity-40 pointer-events-none" strokeWidth={1} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-surface-raised border border-border-base flex items-center justify-center mb-4 group-hover:bg-accent-subtle transition-colors duration-300">
                  <Activity className="text-primary-container" size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-[32px] text-text-primary mb-2">STAR Method Analytics</h3>
                <p className="font-body text-base text-text-secondary max-w-lg mb-4">
                  Stop rambling. Our NLP engine breaks down your behavioral answers into Situation, Task, Action, and Result components, scoring you on narrative coherence and impact.
                </p>
              </div>
              <div className="flex gap-2 mt-auto relative z-10 flex-wrap">
                <span className="px-3 py-1 bg-surface-raised border border-border-base rounded font-body text-sm text-text-secondary">Situation Detected</span>
                <span className="px-3 py-1 bg-surface-raised border border-border-base rounded font-body text-sm text-text-secondary">Action Highlighted</span>
                <span className="px-3 py-1 bg-surface-raised border-border-base text-primary-container rounded font-body text-sm shadow-[0_0_8px_rgba(212,168,83,0.1)] border">Result Missing</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-base py-8 mt-12 bg-background text-center">
        <p className="font-body text-sm text-text-disabled">© 2024 Interview Coach. VoiceCoach Design System.</p>
      </footer>
    </div>
  );
}
