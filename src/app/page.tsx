import Link from 'next/link'
import { ArrowRight, MessageSquare, Bot, LineChart } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span>Agentic<span className="text-primary">AI</span></span>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg text-muted hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border-primary/30 animate-pulse-slow">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-primary">LangGraph Orchestration v2.0 Live</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold text-foreground mb-8 tracking-tight leading-tight">
            AI Customer Support.<br />
            <span className="gradient-text">Agentic & Intelligent.</span>
          </h1>
          <p className="text-xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
            Resolve issues instantly with state-of-the-art AI agents. Powered by hybrid semantic RAG and multi-agent deterministic routing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/chat"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-lg shadow-[0_0_30px_rgba(139,92,246,0.4)]"
            >
              <MessageSquare className="w-5 h-5" />
              Try the AI Demo
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl glass-card text-foreground font-semibold hover:bg-surface-hover transition-all flex items-center justify-center gap-2 text-lg"
            >
              View Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Bot className="w-6 h-6 text-primary" />,
              title: 'Multi-Agent Routing',
              desc: 'Specialized LangGraph agents handle intent classification, retrieval, and generation independently.',
            },
            {
              icon: <MessageSquare className="w-6 h-6 text-accent" />,
              title: 'pgvector Hybrid RAG',
              desc: 'Eliminates hallucinations by strictly grounding responses using BM25 and semantic vector search.',
            },
            {
              icon: <LineChart className="w-6 h-6 text-emerald-400" />,
              title: 'Deep Observability',
              desc: 'Every token and agent transition is traced in real-time via Langfuse and Prometheus metrics.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 glass-card"
            >
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center mb-6 border border-border">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-muted leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
