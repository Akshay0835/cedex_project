'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingDown, Share2, AlertTriangle, BadgeAlert, CheckCircle2, 
  Sparkles, DollarSign, Calendar, Copy, Check 
} from 'lucide-react';
import { AuditResult } from '@/types/audit';
import LeadCaptureForm from './LeadCaptureForm';

interface ResultsDashboardProps {
  auditResult: AuditResult;
}

export default function ResultsDashboard({ auditResult }: ResultsDashboardProps) {
  const { 
    payload, 
    totalCurrentSpend, 
    totalRecommendedSpend, 
    totalMonthlySavings, 
    totalAnnualSavings, 
    recommendations 
  } = auditResult;

  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(auditResult),
        });
        const data = await res.json();
        if (data.summary) {
          setAiSummary(data.summary);
        } else {
          setAiSummary('Failed to compile summary. Check pricing structures manually.');
        }
      } catch (e) {
        console.error(e);
        setAiSummary('Failed to connect to the summary generator service.');
      } finally {
        setLoadingSummary(false);
      }
    }
    fetchSummary();
  }, [auditResult]);

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <div className="space-y-10 pb-20">
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
            Audit for: <strong className="text-foreground">{payload.companyName}</strong> (Team Size: {payload.teamSize})
          </span>
        </div>
        <button
          type="button"
          onClick={copyShareLink}
          className="flex items-center gap-2 text-sm font-semibold bg-secondary hover:bg-secondary-hover border border-border px-4 py-2 rounded-lg cursor-pointer transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-primary" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Share Audit Link
            </>
          )}
        </button>
      </div>

      {/* Hero section with large, bold savings metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Savings Hero (Money Shot) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-card to-secondary/30 relative overflow-hidden flex flex-col justify-between min-h-[250px]"
        >
          {/* Decorative glow overlay */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="space-y-1.5">
            <span className="text-sm font-medium tracking-wide uppercase text-primary flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4" />
              Total Identified Waste
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
              ${totalMonthlySavings.toLocaleString()}<span className="text-xl sm:text-2xl font-medium text-muted-foreground">/mo</span>
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              We recommend immediately trimming licensing structures.
            </p>
          </div>

          <div className="mt-8 border-t border-border/50 pt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Annualized Savings</p>
              <p className="text-2xl font-bold text-emerald-400 font-sans mt-0.5">
                ${totalAnnualSavings.toLocaleString()}/yr
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Optimized Total Spend</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                ${totalRecommendedSpend.toLocaleString()}/mo
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current vs Optimized Spend Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col justify-between bg-card/50"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Spend Ratio</h3>
            
            {/* Visual ratio bar */}
            {totalCurrentSpend > 0 ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Optimized (${totalRecommendedSpend})</span>
                  <span className="text-red-400">Waste (${totalMonthlySavings})</span>
                </div>
                <div className="w-full h-4 bg-red-950/20 rounded-full overflow-hidden flex border border-border/20">
                  <div 
                    style={{ width: `${(totalRecommendedSpend / totalCurrentSpend) * 100}%` }}
                    className="bg-primary h-full"
                  />
                  <div 
                    style={{ width: `${(totalMonthlySavings / totalCurrentSpend) * 100}%` }}
                    className="bg-red-500/80 h-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center pt-1">
                  You are wasting {Math.round((totalMonthlySavings / totalCurrentSpend) * 100)}% of your AI budget.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active spend tool config added.</p>
            )}
          </div>

          <div className="border-t border-border/50 pt-4 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Cost:</span>
              <span className="font-semibold text-foreground">${totalCurrentSpend}/mo</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Summary and CTAs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 glass-card p-6 md:p-8 space-y-4 bg-gradient-to-br from-card to-card/70 border-primary/10"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-bold text-lg font-sans text-foreground">AI Auditor Summary</h3>
          </div>
          
          {loadingSummary ? (
            <div className="space-y-3 py-4">
              <div className="h-4 bg-secondary animate-pulse rounded-md w-full" />
              <div className="h-4 bg-secondary animate-pulse rounded-md w-11/12" />
              <div className="h-4 bg-secondary animate-pulse rounded-md w-9/12" />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed font-mono">
              {aiSummary}
            </p>
          )}
        </motion.div>

        {/* Right: Unified Lead Capture & Save Audit Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <LeadCaptureForm auditResult={auditResult} />
        </motion.div>
      </div>

      {/* Detailed Audit findings list */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold font-sans tracking-tight text-foreground">Detailed Optimization Findings</h3>
          <p className="text-muted-foreground text-sm">
            We discovered the following actionable opportunities in your AI stack.
          </p>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 flex flex-col justify-between bg-card/60 relative overflow-hidden"
              >
                {/* Visual marker line based on severity */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                  rec.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
                }`} />

                <div className="pl-2 space-y-4">
                  {/* Badge Row */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">{rec.tool}</span>
                      <h4 className="font-bold text-foreground text-base leading-snug">{rec.title}</h4>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                      rec.severity === 'high' 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {rec.severity} priority
                    </span>
                  </div>

                  {/* Recommendation Details */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                {/* Savings summary bar */}
                <div className="mt-6 pl-2 border-t border-border/40 pt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground block">Monthly Leak</span>
                    <span className="font-semibold text-red-400 text-sm">${rec.currentCost}/mo</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Consolidated</span>
                    <span className="font-semibold text-foreground text-sm">${rec.recommendedCost}/mo</span>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded px-2.5 py-1 text-right">
                    <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Savings</span>
                    <span className="font-extrabold text-primary text-sm">${rec.monthlySavings}/mo</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-3 bg-secondary/10">
            <CheckCircle2 className="h-12 w-12 text-primary animate-pulse" />
            <h4 className="text-lg font-bold text-foreground">Zero Leaks Detected!</h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              Incredible. Your AI stack configuration has no redundant seat allocations or subscription waste. You're fully optimized.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
