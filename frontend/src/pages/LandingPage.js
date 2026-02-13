import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Brain, CheckCircle2, Zap, Calendar, FileText, TrendingUp, Star, Users, Shield, Award, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        // User is authenticated, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        // User is not authenticated, stay on landing page
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const response = await axios.get(`${API}/auth/google/login`);
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Failed to initiate Google login:', error);
    }
  };

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated background gradient orbs - optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-60 dark:opacity-40">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            x: mousePosition.x * -1.5,
            y: mousePosition.y * -1.5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
            x: mousePosition.x * 1,
            y: mousePosition.y * 1,
          }}
        />
      </div>

      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="44" height="44" rx="12" fill="url(#logo-gradient)" />
                  <path d="M22 12L28 18L22 24L16 18L22 12Z" fill="white" opacity="0.9" />
                  <path d="M22 20L28 26L22 32L16 26L22 20Z" fill="white" opacity="0.6" />
                  <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="44" y2="44">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)',
                    opacity: 0.3,
                    filter: 'blur(8px)',
                  }}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                Recruit-AI
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <ThemeToggle />
              <Button
                data-testid="nav-login-button"
                onClick={handleLogin}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:via-purple-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 rounded-full px-6 h-11 font-semibold transition-all"
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8 z-10"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">AI-Powered Recruitment Platform</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  <span className="text-slate-900 dark:text-white">Transform Your</span>
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                    Hiring Process
                  </span>
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Screen thousands of resumes in seconds with AI precision. Find the perfect candidates 10x faster with intelligent automation and zero bias.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  data-testid="hero-get-started-button"
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:via-purple-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/30 dark:shadow-indigo-500/20 rounded-full px-8 h-14 text-lg font-bold group transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-14 text-lg border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">5,000+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Companies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">1M+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Resumes Screened</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">94%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy Rate</div>
                </div>
              </div>
            </motion.div>

            {/* Right: Floating Cards - Properly Structured */}
            <div className="relative h-[600px] hidden lg:block">
              {/* Card 1: Top Right - Perfect Match */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  x: mousePosition.x * 0.5,
                  y: mousePosition.y * 0.5,
                }}
                className="absolute top-0 right-0 w-80 p-6 rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-500/10"
                data-testid="floating-card-candidate"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">96%</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Perfect Match</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">Alex Rivera</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Senior Full Stack Engineer</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800">
                      React • Node.js
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800">
                      8 YoE
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Middle Left - AI Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  x: mousePosition.x * -0.3,
                  y: mousePosition.y * 0.3,
                }}
                className="absolute top-32 left-0 w-72 p-6 rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/10"
                data-testid="floating-card-analysis"
              >
                <Brain className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <div className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Deep Scan Active</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">Analyzing 847 resumes...</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span>Progress</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">73%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: '73%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Bottom Right - Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  x: mousePosition.x * 0.4,
                  y: mousePosition.y * -0.4,
                }}
                className="absolute bottom-0 right-12 w-64 p-5 rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-purple-500/10"
                data-testid="floating-card-stats"
              >
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Last 30 Days</span>
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">2,847</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">Candidates Screened</div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Time Saved</span>
                    <span className="font-bold text-slate-900 dark:text-white">142 hrs</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Hire Smarter
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful AI-driven features that transform your recruitment workflow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Screening",
                description: "Deep semantic analysis that understands context, skills, and cultural fit beyond keywords",
                gradient: "from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20",
                iconBg: "from-indigo-500 to-blue-500",
                border: "border-indigo-200 dark:border-indigo-800"
              },
              {
                icon: Zap,
                title: "Lightning Fast Processing",
                description: "Screen 1,000+ resumes in under 60 seconds with 94% accuracy rate",
                gradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20",
                iconBg: "from-amber-500 to-orange-500",
                border: "border-amber-200 dark:border-amber-800"
              },
              {
                icon: FileText,
                title: "Universal File Support",
                description: "Perfect parsing of PDF, Word, and plain text files with zero formatting loss",
                gradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
                iconBg: "from-purple-500 to-pink-500",
                border: "border-purple-200 dark:border-purple-800"
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Auto-generate interview invites and sync with Google Calendar instantly",
                gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
                iconBg: "from-emerald-500 to-teal-500",
                border: "border-emerald-200 dark:border-emerald-800"
              },
              {
                icon: Shield,
                title: "Bias-Free Evaluation",
                description: "Objective scoring based purely on qualifications, experience, and skills",
                gradient: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20",
                iconBg: "from-blue-500 to-cyan-500",
                border: "border-blue-200 dark:border-blue-800"
              },
              {
                icon: Award,
                title: "Team Collaboration",
                description: "Share insights, export beautiful PDF reports, and collaborate seamlessly",
                gradient: "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
                iconBg: "from-rose-500 to-pink-500",
                border: "border-rose-200 dark:border-rose-800"
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br ${feature.gradient} border ${feature.border} shadow-lg hover:shadow-2xl transition-all group`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 lg:p-16 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-700 dark:via-purple-700 dark:to-violet-700 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            <div className="relative text-center text-white space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                Join 5,000+ companies who've reduced time-to-hire by 80% with AI-powered screening
              </p>
              <Button
                data-testid="cta-get-started-button"
                onClick={handleLogin}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-slate-100 shadow-xl rounded-full px-10 h-16 text-lg font-bold group mt-4"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="text-indigo-100 text-sm pt-2">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 dark:border-slate-800 py-12 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="44" height="44" rx="10" fill="url(#footer-logo-gradient)" />
              <path d="M22 12L28 18L22 24L16 18L22 12Z" fill="white" opacity="0.9" />
              <path d="M22 20L28 26L22 32L16 26L22 20Z" fill="white" opacity="0.6" />
              <defs>
                <linearGradient id="footer-logo-gradient" x1="0" y1="0" x2="44" y2="44">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Recruit-AI</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {'© 2026 Recruit-AI. The future of intelligent hiring.'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
