'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Users, Sparkles, ArrowRight, ArrowLeft, 
  Check, Loader2, Code, FileText, Search, Cpu, Briefcase 
} from 'lucide-react';
import { UserPayload } from '@/types/audit';
import { encodePayload } from '@/lib/encoding';
import { PRICING_DATA } from '@/constants/pricing';

const STORAGE_KEY = 'saaslytics_form_state';

const initialPayload: UserPayload = {
  companyName: '',
  teamSize: 1,
  primaryUseCase: 'general',
  tools: {
    cursor: { tier: 'none', seats: 1 },
    chatgpt: { tier: 'none', seats: 1 },
    claude: { tier: 'none', seats: 1 },
    gemini: { tier: 'none', seats: 1 },
    copilot: { tier: 'none', seats: 1 },
  },
};

const useCases = [
  { id: 'coding', name: 'Software Development', icon: Code, desc: 'Writing code, IDE autocomplete, and debugging' },
  { id: 'content', name: 'Content & Marketing', icon: FileText, desc: 'Copywriting, blog posts, and graphics generation' },
  { id: 'research', name: 'Research & Analysis', icon: Search, desc: 'Summarizing papers, data lookup, and strategy' },
  { id: 'api_direct', name: 'API Direct Integration', icon: Cpu, desc: 'Connecting LLMs directly to custom software' },
  { id: 'general', name: 'General Productivity', icon: Briefcase, desc: 'Answering emails, quick chats, and support' },
] as const;

export default function AuditorForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [payload, setPayload] = useState<UserPayload>(initialPayload);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPayload(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever payload changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  }, [payload, isLoaded]);

  const handleNext = () => {
    if (step === 1 && !payload.companyName.trim()) {
      alert('Please enter a company or team name.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const triggerAudit = () => {
    setStep(3);
    const statuses = [
      'Ingesting SaaS tool tiers...',
      'Cross-referencing seat counts with team size...',
      'Calculating licensing redundancies...',
      'Running AuditEngine.ts rule constraints...',
      'Formulating saving recommendations...',
      'Compiling audit dashboard...',
    ];

    let currentStatusIndex = 0;
    setScanStatus(statuses[0]);

    const interval = setInterval(() => {
      currentStatusIndex++;
      if (currentStatusIndex < statuses.length) {
        setScanStatus(statuses[currentStatusIndex]);
      } else {
        clearInterval(interval);
        const encoded = encodePayload(payload);
        router.push(`/results/${encoded}`);
      }
    }, 800);
  };

  const updateToolTier = (toolKey: keyof UserPayload['tools'], tier: string) => {
    setPayload((prev) => {
      const updatedTools = { ...prev.tools };
      const defaultSeats = tier === 'none' ? 0 : prev.teamSize;
      updatedTools[toolKey] = {
        tier,
        seats: updatedTools[toolKey].seats > 0 ? updatedTools[toolKey].seats : defaultSeats,
      };
      return { ...prev, tools: updatedTools };
    });
  };

  const updateToolSeats = (toolKey: keyof UserPayload['tools'], seats: number) => {
    setPayload((prev) => {
      const updatedTools = { ...prev.tools };
      updatedTools[toolKey] = {
        ...updatedTools[toolKey],
        seats: Math.max(0, seats),
      };
      return { ...prev, tools: updatedTools };
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Slide transition config
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' as const }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' as const }
    })
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicators */}
      {step < 3 && (
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
              step >= 1 ? 'bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20' : 'bg-secondary text-muted'
            }`}>
              1
            </span>
            <span className={`text-sm ${step === 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Team Info
            </span>
          </div>
          <div className="flex-1 h-[2px] bg-secondary mx-4 rounded" />
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
              step >= 2 ? 'bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20' : 'bg-secondary text-muted'
            }`}>
              2
            </span>
            <span className={`text-sm ${step === 2 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Tool Tiers
            </span>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden min-h-[450px]">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass-card p-6 md:p-8 space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-sans tracking-tight">Tell us about your team</h2>
                <p className="text-muted-foreground text-sm">
                  We customize the audit criteria based on your size and core use case.
                </p>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Company or Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Engineering"
                  value={payload.companyName}
                  onChange={(e) => setPayload({ ...payload, companyName: e.target.value })}
                  className="w-full bg-secondary border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg py-2.5 px-4 outline-none transition-all placeholder:text-muted"
                />
              </div>

              {/* Team Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Team Members using AI
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    min="1"
                    value={payload.teamSize}
                    onChange={(e) => setPayload({ ...payload, teamSize: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-32 bg-secondary border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg py-2.5 px-4 outline-none transition-all text-center font-semibold"
                  />
                  <span className="text-sm text-muted-foreground">
                    Licenses are matched against this size to flag overspending.
                  </span>
                </div>
              </div>

              {/* Primary Use Case */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground block flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Primary AI Use Case
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {useCases.map((uc) => {
                    const Icon = uc.icon;
                    const isSelected = payload.primaryUseCase === uc.id;
                    return (
                      <button
                        key={uc.id}
                        type="button"
                        onClick={() => setPayload({ ...payload, primaryUseCase: uc.id })}
                        className={`flex gap-3 text-left p-4 rounded-xl transition-all border ${
                          isSelected 
                            ? 'border-primary/50 bg-primary/5 shadow-md shadow-primary/5' 
                            : 'border-border bg-secondary/30 hover:bg-secondary/60 hover:border-border/80'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{uc.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{uc.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-hover text-primary-foreground transition-all cursor-pointer shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  Configure AI Tools
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="glass-card p-6 md:p-8 space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-sans tracking-tight">Add your AI subscriptions</h2>
                <p className="text-muted-foreground text-sm">
                  Specify the tiers and seat counts currently paid by your company.
                </p>
              </div>

              <div className="space-y-4">
                {Object.keys(PRICING_DATA).map((toolKey) => {
                  const toolInfo = PRICING_DATA[toolKey];
                  const currentConf = payload.tools[toolKey as keyof UserPayload['tools']];
                  const isToolActive = currentConf.tier !== 'none';
                  
                  return (
                    <div 
                      key={toolKey} 
                      className={`p-4 rounded-xl border transition-all ${
                        isToolActive 
                          ? 'border-primary/20 bg-secondary/20 shadow-sm' 
                          : 'border-border/60 bg-transparent'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Tool Info */}
                        <div className="flex items-center gap-3">
                          <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isToolActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {toolInfo.name.charAt(0)}
                          </span>
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">{toolInfo.name}</h3>
                            <p className="text-xs text-muted-foreground">Current Setup</p>
                          </div>
                        </div>

                        {/* Select Tiers & Seats */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Tier Selector */}
                          <select
                            value={currentConf.tier}
                            onChange={(e) => updateToolTier(toolKey as any, e.target.value)}
                            className="bg-secondary border border-border text-sm rounded-lg px-3 py-1.5 focus:border-primary/50 outline-none transition-all text-foreground font-medium"
                          >
                            {Object.values(toolInfo.tiers).map((tier) => (
                              <option key={tier.id} value={tier.id}>
                                {tier.name} {tier.pricePerSeat > 0 ? `($${tier.pricePerSeat}/seat)` : ''}
                              </option>
                            ))}
                          </select>

                          {/* Seat Selector (Only show if tool is active and tier is not hobby/free) */}
                          {isToolActive && currentConf.tier !== 'hobby' && currentConf.tier !== 'free' && currentConf.tier !== 'api' && (
                            <div className="flex items-center border border-border bg-secondary rounded-lg px-2 py-1 gap-2">
                              <span className="text-xs text-muted-foreground">Seats:</span>
                              <input
                                type="number"
                                min="1"
                                value={currentConf.seats}
                                onChange={(e) => updateToolSeats(toolKey as any, parseInt(e.target.value) || 0)}
                                className="w-12 bg-transparent text-center text-sm font-semibold outline-none text-foreground border-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-secondary hover:bg-secondary-hover text-secondary-foreground transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={triggerAudit}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-hover text-primary-foreground transition-all cursor-pointer shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  Run Audit Engine
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-glow p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 animate-pulse-glow"
            >
              <div className="relative">
                {/* Glowing ring animation */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-accent opacity-75 blur animate-pulse" />
                <div className="relative bg-background p-6 rounded-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-sans tracking-tight gradient-emerald">
                  Scanning AI Stack...
                </h2>
                <p className="text-muted-foreground text-sm font-medium tracking-wide">
                  SaaSlytics Spend Engine is auditing licenses
                </p>
              </div>

              {/* Running Status Tracker */}
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scanStatus}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-primary text-sm font-mono"
                  >
                    {scanStatus}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress Bar Mock */}
              <div className="w-full max-w-xs bg-secondary h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4.8, ease: 'easeInOut' }}
                  className="bg-primary h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
