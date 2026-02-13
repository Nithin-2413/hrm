import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, Target, Brain, Users, TrendingUp, CheckCircle2, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", damping: 30 }}
        />
        <motion.div
          className="absolute top-1/3 -left-20 w-80 h-80 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -0.01,
            y: mousePosition.y * 0.015,
          }}
          transition={{ type: "spring", damping: 30 }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-64 h-64 bg-pink-400/20 dark:bg-pink-600/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.015,
            y: mousePosition.y * -0.01,
          }}
          transition={{ type: "spring", damping: 30 }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-slate-950/60 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Recruit-AI</span>
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
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 rounded-full px-6 h-11 font-semibold"
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <main className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
                <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Trusted by 500+ Companies</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="text-slate-900 dark:text-white">Hire Smarter,</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Not Harder</span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                AI that reads 1,000 resumes while you grab coffee. Zero bias. 
                100% precision. Your next hire is already in your inbox—we'll find them.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  data-testid="hero-get-started-button"
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/30 rounded-full px-8 h-14 text-lg font-bold group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-14 text-lg border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white font-bold text-sm">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-slate-900 dark:text-white">5,000+ HR Professionals</div>
                  <div className="text-slate-600 dark:text-slate-400">Screening smarter every day</div>
                </div>
              </div>
            </motion.div>

            {/* Right Visual - Interactive Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative h-[600px] hidden lg:block"
            >
              {/* Floating Card 1 - Top */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-72 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl"
                data-testid="floating-card-match"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">98%</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Match Score</div>
                  </div>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">Sarah Chen</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">Senior Frontend Engineer</div>
                <div className="flex gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium">React</span>
                  <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-medium">5 YoE</span>
                </div>
              </motion.div>

              {/* Floating Card 2 - Middle */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-40 left-0 w-64 p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/30"
                data-testid="floating-card-stats"
              >
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <div className="text-white/80 text-xs font-medium">Last 7 Days</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">247</div>
                <div className="text-white/80 text-sm">Resumes Screened</div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Time Saved</span>
                    <span className="font-bold text-white">18.5 hrs</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 3 - Bottom Right */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-8 w-56 p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl"
                data-testid="floating-card-automated"
              >
                <Zap className="w-8 h-8 text-amber-500 mb-3" />
                <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">Fully Automated</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Screening → Scoring → Scheduling
                </div>
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                  ))}
                </div>
              </motion.div>

              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>

        {/* Features Section - Bento Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Dominate Hiring</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features that transform how you discover and hire talent
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 border border-indigo-100 dark:border-indigo-900 hover:shadow-2xl transition-all duration-300 group"
              data-testid="feature-ai-analysis"
            >
              <Brain className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">AI-Powered Deep Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                Our AI doesn't just match keywords. It understands context, evaluates experience depth, 
                and predicts cultural fit with 94% accuracy.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-200 dark:border-indigo-800">
                  Semantic Understanding
                </span>
                <span className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 text-sm font-semibold border border-violet-200 dark:border-violet-800">
                  Context-Aware Scoring
                </span>
                <span className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 text-sm font-semibold border border-purple-200 dark:border-purple-800">
                  Bias Detection
                </span>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300"
              data-testid="feature-bulk-processing"
            >
              <Upload className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Bulk Processing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Upload 1,000 resumes. Get results in 90 seconds. Yes, really.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">1,000+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Resumes per batch</div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300"
              data-testid="feature-smart-scheduling"
            >
              <Target className="w-10 h-10 text-violet-600 dark:text-violet-400 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Smart Scheduling</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Auto-generate interview invites and sync with Google Calendar instantly.
              </p>
            </motion.div>

            {/* Feature 4 - Wide */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950 text-white border border-slate-800 hover:shadow-2xl transition-all duration-300"
              data-testid="feature-export"
            >
              <div className="flex items-center justify-between">
                <div className="max-w-lg">
                  <h3 className="text-3xl font-bold mb-3">Export & Share</h3>
                  <p className="text-slate-300 text-lg">
                    Beautiful PDF reports with detailed analysis. Share with your team in one click.
                  </p>
                </div>
                <Users className="w-16 h-16 text-indigo-400 opacity-50" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto px-6 lg:px-12 mt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE5YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOS4wNiAwIDE5czguMDYgMTggMTggMThoMWMtLjA2IDAtLjE0LS4wMi0uMi0uMDItLjA2IDAgLjE0LjAyLjIuMDJabTE4IDBoMS0xWiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Revolutionize Your Hiring?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join 500+ companies who've reduced their time-to-hire by 80%
              </p>
              <Button
                data-testid="cta-get-started-button"
                onClick={handleLogin}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-slate-100 shadow-2xl rounded-full px-10 h-16 text-lg font-bold group"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="mt-6 text-indigo-200 text-sm">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Recruit-AI</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            © 2026 Recruit-AI. Powered by Emergent AI. Built for the future of hiring.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
