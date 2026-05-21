'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Briefcase, Users, Building2, ShieldAlert, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { AuditResult } from '@/types/audit';

interface LeadCaptureFormProps {
  auditResult: AuditResult;
}

export default function LeadCaptureForm({ auditResult }: LeadCaptureFormProps) {
  const { payload, totalMonthlySavings } = auditResult;

  // Form states
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState(payload.companyName || '');
  const [teamSize, setTeamSize] = useState(payload.teamSize || '');
  const [role, setRole] = useState('');
  const [honeypot, setHoneypot] = useState(''); // website_confirm_field

  // Submission/UI States
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Determine copy based on savings tier
  const isHighSavings = totalMonthlySavings > 500;
  const isMediumSavings = totalMonthlySavings >= 100 && totalMonthlySavings <= 500;
  const isLowSavings = totalMonthlySavings < 100;

  let title = 'Save Your Spend Audit';
  let badgeText = 'Save Report';
  let badgeColor = 'bg-primary/10 border-primary/20 text-primary';
  let description = 'Enter your details to receive your customized optimization report via email and stay updated on licensing changes.';
  let buttonText = 'Email My Report';

  if (isHighSavings) {
    title = 'Unlock Enterprise Savings';
    badgeText = 'Critical Savings Target';
    badgeColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    description = `Your team is wasting over $${totalMonthlySavings.toLocaleString()}/mo. Submit below to receive your report and schedule a consultation with a Cedex Spend Architect to recover this waste.`;
    buttonText = 'Claim Savings & Report';
  } else if (isMediumSavings) {
    title = 'Consolidate & Save';
    badgeText = 'Moderate Waste Detected';
    badgeColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    description = `We found $${totalMonthlySavings.toLocaleString()}/mo in potential savings. Get your full breakdown and schedule a spend review.`;
    buttonText = 'Email Report & Save';
  } else if (isLowSavings) {
    title = 'Keep Your Spend Optimized';
    badgeText = 'Fully Optimized';
    badgeColor = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    description = 'Your AI spend is currently in excellent shape. Get your current report emailed and subscribe to future pricing updates.';
    buttonText = 'Keep Me Optimized';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Build report URL dynamically based on window location
      const reportUrl = typeof window !== 'undefined' ? window.location.href : '';

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          companyName,
          teamSize: Number(teamSize) || null,
          role,
          monthlySavings: totalMonthlySavings,
          auditUrl: reportUrl,
          website_confirm_field: honeypot, // Honeypot field
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit details. Please try again.');
      }

      setStatus('success');
    } catch (err: any) {
      console.error('Lead submission error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="glass-card-glow p-6 md:p-8 space-y-6 relative overflow-hidden bg-card/90">
      {/* Decorative background flare */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="space-y-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badgeColor}`}>
          {badgeText}
        </span>
        <h4 className="text-2xl font-bold tracking-tight text-white">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center py-8 space-y-4"
          >
            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h5 className="text-lg font-bold text-foreground">Report Dispatched!</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We have emailed the full PDF/interactive spend breakdown to <strong className="text-foreground">{email}</strong>.
                {isHighSavings && (
                  <span className="block mt-2 text-emerald-400 font-semibold">
                    A Spend Architect will reach out to you shortly to assist with consolidation.
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Honeypot field (hidden from humans, visible to bots) */}
            <div 
              style={{ position: 'absolute', opacity: 0, top: 0, left: 0, height: 0, width: 0, zIndex: -1, overflow: 'hidden' }}
              aria-hidden="true"
            >
              <label htmlFor="website_confirm_field">Do not fill this out if you are a human</label>
              <input
                id="website_confirm_field"
                type="text"
                name="website_confirm_field"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Work Email (Required) */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Work Email <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    disabled={status === 'loading'}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/80 border border-border rounded-lg text-sm py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 text-foreground transition-all disabled:opacity-50"
                  />
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                </div>
              </div>

              {/* Company Name (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={status === 'loading'}
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-secondary/80 border border-border rounded-lg text-sm py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 text-foreground transition-all disabled:opacity-50"
                  />
                  <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                </div>
              </div>

              {/* Team Size (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Team Size
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={status === 'loading'}
                    placeholder="10"
                    min="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full bg-secondary/80 border border-border rounded-lg text-sm py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 text-foreground transition-all disabled:opacity-50"
                  />
                  <Users className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                </div>
              </div>

              {/* Role (Optional) */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={status === 'loading'}
                    placeholder="CTO, Engineering Manager, CFO"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-secondary/80 border border-border rounded-lg text-sm py-2.5 pl-10 pr-4 outline-none focus:border-primary/50 text-foreground transition-all disabled:opacity-50"
                  />
                  <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
                </div>
              </div>
            </div>

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-red-400"
              >
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Submission Failed:</span> {errorMessage}
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/10 hover:shadow-primary/20"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  {buttonText}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
