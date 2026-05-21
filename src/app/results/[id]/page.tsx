import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { decodePayload } from '@/lib/encoding';
import { runAudit } from '@/lib/audit-engine';
import ResultsDashboard from '@/components/results/ResultsDashboard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const payload = decodePayload(id);
    if (!payload) {
      return {
        title: 'AI Spend Audit | SaaSlytics',
        description: 'Audit your AI subscription spends instantly.',
      };
    }

    const auditResult = runAudit(payload);
    const formattedSavings = auditResult.totalAnnualSavings.toLocaleString();
    const company = payload.companyName ? `for ${payload.companyName}` : '';

    return {
      title: `Audit: Save $${formattedSavings}/yr ${company} | SaaSlytics`,
      description: `SaaSlytics Spend Auditor flagged $${auditResult.totalMonthlySavings}/mo of license waste across ChatGPT, Claude, Gemini, and Cursor.`,
      openGraph: {
        title: `AI Spend Audit: Save $${formattedSavings}/yr ${company}`,
        description: `SaaSlytics Spend Auditor flagged $${auditResult.totalMonthlySavings}/mo of license waste across ChatGPT, Claude, Gemini, and Cursor.`,
        type: 'website',
        images: [
          {
            url: `https://saaslytics-auditor.vercel.app/api/og?savings=${auditResult.totalMonthlySavings}`,
            width: 1200,
            height: 630,
            alt: 'SaaSlytics Spend Auditor Report',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `AI Spend Audit: Save $${formattedSavings}/yr ${company}`,
        description: `SaaSlytics Spend Auditor flagged $${auditResult.totalMonthlySavings}/mo of license waste.`,
        images: [`https://saaslytics-auditor.vercel.app/api/og?savings=${auditResult.totalMonthlySavings}`],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'AI Spend Audit | SaaSlytics',
      description: 'Audit your AI subscription spends instantly.',
    };
  }
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  const payload = decodePayload(id);
  
  console.log('--- SaaSlytics Server Debug ---');
  console.log('Raw ID from URL:', id);
  console.log('Decoded Payload:', JSON.stringify(payload, null, 2));
  if (payload) {
    console.log('RunAudit Output:', JSON.stringify(runAudit(payload), null, 2));
  }
  console.log('--------------------------------');

  if (!payload) {
    return (
      <div className="relative min-h-screen bg-background bg-grid-pattern flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <div className="glass-card p-8 max-w-md w-full space-y-6 flex flex-col items-center border-red-500/20 shadow-lg shadow-red-500/5">
          <div className="p-3 rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Invalid Audit Link</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't decode the audit data in this URL. The link might be broken or incomplete.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-semibold bg-secondary hover:bg-secondary-hover text-foreground transition-all cursor-pointer border border-border"
          >
            <RefreshCw className="h-4 w-4" />
            Run a New Audit
          </Link>
        </div>
      </div>
    );
  }

  const auditResult = runAudit(payload);

  return (
    <div className="relative min-h-screen bg-background bg-grid-pattern overflow-hidden flex flex-col justify-between">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-background text-lg shadow-lg shadow-primary/20">
              S
            </span>
            <span className="font-extrabold text-xl font-sans tracking-tight bg-gradient-to-r from-white to-muted-foreground bg-clip-text text-transparent">
              SaaSlytics
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Auditor
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-10 relative z-10">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans text-foreground">
            Audit <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Report</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Detailed AI spend analysis, license consolidations, and pricing savings.
          </p>
        </div>

        <ResultsDashboard auditResult={auditResult} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 bg-background/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SaaSlytics Spend Auditor. Powered by Cedex.
          </p>
          <span className="text-xs text-muted">Protected under Cedex Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}
