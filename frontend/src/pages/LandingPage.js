import React from 'react';
import { ArrowRight, Sparkles, Zap, Target, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-background fixed inset-0 opacity-40" />
      
      <nav className="fixed top-0 left-0 right-0 z-20 glass-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Recruit-AI</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                data-testid="nav-login-button"
                onClick={handleLogin}
                variant="outline"
                className="rounded-full"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-24 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-secondary/20 text-secondary-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by AI
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
              Stop Drowning in Resumes.
              <br />
              <span className="text-gradient">Start Finding Talent.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Intelligent AI-powered resume screening that analyzes hundreds of candidates
              in seconds, so you can focus on what matters: connecting with great talent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                data-testid="hero-get-started-button"
                onClick={handleLogin}
                size="lg"
                className="ai-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 text-base font-semibold h-12"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                data-testid="hero-learn-more-button"
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base h-12"
              >
                Learn More
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 py-24"
          >
            <div className="p-8 rounded-xl border bg-card hover:shadow-lg transition-shadow duration-200" data-testid="feature-card-speed">
              <div className="w-12 h-12 rounded-lg ai-gradient flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 tracking-tight">Lightning Fast</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Screen hundreds of resumes in seconds. AI analyzes qualifications,
                experience, and fit against your job description instantly.
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-card hover:shadow-lg transition-shadow duration-200" data-testid="feature-card-accuracy">
              <div className="w-12 h-12 rounded-lg ai-gradient flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 tracking-tight">Precision Matching</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Get detailed scoring (0-100) with clear recommendations.
                Never miss great candidates buried in your inbox.
              </p>
            </div>

            <div className="p-8 rounded-xl border bg-card hover:shadow-lg transition-shadow duration-200" data-testid="feature-card-automation">
              <div className="w-12 h-12 rounded-lg ai-gradient flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 tracking-tight">Full Automation</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                From screening to scheduling. Generate interview emails and
                calendar invites automatically for top candidates.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="py-24 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tight">Ready to Transform Your Hiring?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Join innovative companies who've cut their screening time by 90%</p>
            <Button
              data-testid="cta-get-started-button"
              onClick={handleLogin}
              size="lg"
              className="ai-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8 text-base font-semibold h-12"
            >
              Start Screening Smarter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </main>

      <footer className="border-t py-8 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Recruit-AI. Powered by Emergent AI Technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;