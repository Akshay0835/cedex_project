import AuditorForm from '@/components/forms/AuditorForm';
import Navbar from '@/components/Navbar';
import { ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background bg-grid-pattern overflow-hidden flex flex-col justify-between">
      {/* Background visual elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      {/* Header / Nav */}
      <Navbar />

      {/* Main Hero & Form */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12 md:py-20 space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <TrendingDown className="h-3.5 w-3.5" />
            AI Subscription Audit
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-sans tracking-tight leading-[1.1] text-foreground">
            Stop Overpaying for <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI Seat Licenses</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Audit your team's spend on Cursor, ChatGPT, Claude, and Gemini in seconds. Detect redundancy, over-provisioning, and switch to API billing.
          </p>
        </div>

        {/* Auditor Form */}
        <section id="auditor-form" className="relative z-10">
          <AuditorForm />
        </section>

        {/* Features Checklist */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="glass-card p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Defensible Audit Rules</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on active team sizes and primary use cases. Detects redundancy (Cursor Pro + GitHub Copilot) and license bloat.
            </p>
          </div>
          <div className="glass-card p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Stateless Share Links</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No registration or databases required. Generate a direct base64 encoded URL with Open Graph preview meta tags.
            </p>
          </div>
          <div className="glass-card p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Witty AI Summaries</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pipes audit statistics to Claude to produce a witty, 100-word financial analysis on your SaaS efficiency.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SaaSlytics Spend Auditor. Powered by Cedex.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-muted">Stateless & Secure</span>
            <span className="text-xs text-muted">No DB Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
