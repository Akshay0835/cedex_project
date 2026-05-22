"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    // Initialize scroll state on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isResultsPage = pathname.startsWith('/results');

  const navLinks = [
    { name: 'How it Works', href: '#features' },
    { name: 'Auditor Form', href: '#auditor-form' },
  ];

  const getHref = (href: string) => {
    if (isResultsPage) {
      return href.startsWith('#') ? `/${href}` : href;
    }
    return href;
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isResultsPage) return; // Let next/link handle routing back home
    
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 pointer-events-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-center">
        {/* Main Navbar Container */}
        <motion.div
          animate={{
            width: isScrolled ? '100%' : '100%',
            maxWidth: isScrolled ? '768px' : '1152px', // Shorter max-width on scroll for capsule look
            backgroundColor: isScrolled ? 'rgba(20, 20, 22, 0.75)' : 'rgba(9, 9, 11, 0.4)',
            backdropFilter: isScrolled ? 'blur(16px)' : 'blur(8px)',
            borderColor: isScrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: isScrolled 
              ? '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(255, 255, 255, 0.03), 0 0 15px rgba(16, 185, 129, 0.05)'
              : 'none',
            borderRadius: isScrolled ? '9999px' : '16px',
            paddingLeft: isScrolled ? '24px' : '16px',
            paddingRight: isScrolled ? '24px' : '16px',
            paddingTop: isScrolled ? '12px' : '16px',
            paddingBottom: isScrolled ? '12px' : '16px',
            y: isScrolled ? 10 : 0
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="w-full flex items-center justify-between border pointer-events-auto transition-shadow"
        >
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer select-none">
            <motion.span 
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary via-emerald-500 to-accent flex items-center justify-center font-bold text-background text-lg shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/35 transition-shadow"
            >
              S
            </motion.span>
            <span className="font-extrabold text-xl font-sans tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-primary transition-all duration-300">
              SaaSlytics
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isResultsPage ? (
            <div className="hidden md:flex items-center gap-1.5 bg-neutral-900/40 p-1 rounded-full border border-white/[0.04]">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.name}
                  href={getHref(link.href)}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="relative px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="relative z-10">{link.name}</span>
                  {hoveredIndex === idx && (
                    <motion.div
                      layoutId="hover-pill"
                      className="absolute inset-0 bg-white/[0.06] border border-white/[0.02] rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          ) : null}

          {/* Desktop CTA / Control Button */}
          <div className="hidden sm:flex items-center gap-4">
            {!isResultsPage ? (
              <>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-secondary border border-border text-primary uppercase tracking-wider relative overflow-hidden group">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  v1.0 (MVP)
                </span>
                <Link
                  href="#auditor-form"
                  onClick={(e) => handleScrollTo(e, '#auditor-form')}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-background transition-all duration-200 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95"
                >
                  <Zap className="h-3 w-3 fill-current" />
                  Analyze Spend
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:translate-x-[-2px] transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Auditor
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          {!isResultsPage ? (
            <div className="md:hidden flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border text-primary uppercase tracking-wider">
                <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                MVP
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          ) : (
            <div className="sm:hidden">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all p-1.5 rounded-lg border border-border bg-secondary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && !isResultsPage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 z-40 bg-zinc-950/95 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 pointer-events-auto md:hidden"
          >
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 mb-1">
                Navigation
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={getHref(link.href)}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-all"
                >
                  {link.name}
                  <Sparkles className="h-4 w-4 text-primary opacity-50" />
                </Link>
              ))}
            </div>

            <div className="border-t border-border/50 my-2" />

            <Link
              href="#auditor-form"
              onClick={(e) => handleScrollTo(e, '#auditor-form')}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold bg-primary hover:bg-primary-hover text-background text-center transition-all shadow-lg shadow-primary/10"
            >
              <Zap className="h-4 w-4 fill-current" />
              Analyze Your Spend
            </Link>
            
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-3 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Stateless & Secure
              </span>
              <span>v1.0 (MVP)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
