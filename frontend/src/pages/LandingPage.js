import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Brain, CheckCircle2, Zap, Calendar, FileText, TrendingUp, Star, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const FloatingOrb = ({ delay = 0, duration = 20, size = 'large' }) => {
  const sizes = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
    xlarge: 'w-96 h-96'
  };

  return (
    <motion.div
      className={`absolute ${sizes[size]} rounded-full blur-3xl opacity-40`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -100, 50, 0],
        scale: [1, 1.2, 0.8, 1],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

const ParticleField = () => {
  const particles = Array.from({ length: 30 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const smoothX = useSpring(0, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
      smoothX.set((clientX - window.innerWidth / 2) / 25);
      smoothY.set((clientY - window.innerHeight / 2) / 25);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [smoothX, smoothY]);

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Gemini-style animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-purple-950 to-pink-950">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3), transparent 50%)',
            x: smoothX,
            y: smoothY,
          }}
        />
      </div>

      {/* Floating orbs - antigravity effect */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb delay={0} duration={25} size="xlarge" />
        <FloatingOrb delay={5} duration={20} size="large" />
        <FloatingOrb delay={10} duration={30} size="medium" />
        <FloatingOrb delay={15} duration={22} size="large" />
      </div>

      {/* Particle field */}
      <ParticleField />

      {/* Glass navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 blur-md"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white shadow-lg shadow-blue-500/50 rounded-full px-6 h-11 font-semibold relative overflow-hidden group"
              >
                <span className="relative z-10">Sign In</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/30"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </motion.div>

            {/* Main headline with antigravity effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ y: y1 }}
            >
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight mb-6">
                <motion.span
                  className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  The Future of
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Intelligent Hiring
                </motion.span>
              </h1>

              <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
                AI-powered resume screening that analyzes thousands of candidates 
                in seconds with superhuman precision.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button
                data-testid="hero-get-started-button"
                onClick={handleLogin}
                size="lg"
                className="relative group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-full px-10 h-16 text-lg font-bold shadow-2xl shadow-blue-500/50 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 h-16 text-lg border-2 border-blue-400/30 text-blue-100 hover:bg-blue-500/10 hover:border-blue-400/50 backdrop-blur-xl"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Floating 3D Cards */}
            <motion.div
              style={{ y: y2 }}
              className="relative mt-20 h-[400px]"
            >
              {/* Card 1 - Perfect Match */}
              <motion.div
                className="absolute left-1/4 top-0 w-80 p-6 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-2xl"
                animate={{
                  y: [0, -20, 0],
                  rotateY: [0, 5, 0],
                  rotateX: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  x: smoothX,
                  y: smoothY,
                }}
                data-testid="floating-card-candidate"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">96%</div>
                    <div className="text-sm text-emerald-300">Perfect Match</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">Alex Rivera</div>
                  <div className="text-sm text-blue-200">Senior Full Stack Engineer</div>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1.5 rounded-full bg-blue-500/30 text-cyan-300 text-xs font-medium border border-blue-400/30">
                      React • Node.js
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-purple-500/30 text-purple-300 text-xs font-medium border border-purple-400/30">
                      8 YoE
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 - AI Analysis */}
              <motion.div
                className="absolute right-1/4 top-20 w-72 p-6 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 shadow-2xl"
                animate={{
                  y: [0, 20, 0],
                  rotateY: [0, -5, 0],
                  rotateX: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  x: smoothX,
                  y: smoothY,
                }}
                data-testid="floating-card-analysis"
              >
                <Brain className="w-10 h-10 text-cyan-400 mb-4" />
                <div className="text-xl font-bold text-white mb-2">AI Deep Scan Active</div>
                <div className="text-sm text-blue-200 mb-4">Analyzing 847 resumes...</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-blue-300">
                    <span>Progress</span>
                    <span className="font-bold">73%</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: '73%' }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - Stats */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 w-64 p-5 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-400/30 shadow-2xl"
                animate={{
                  y: [0, -15, 0],
                  rotateZ: [0, 2, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                data-testid="floating-card-stats"
              >
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-8 h-8 text-pink-400" />
                  <span className="text-xs text-pink-300 font-medium">Last 30 Days</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">2,847</div>
                <div className="text-sm text-pink-200">Candidates Screened</div>
                <div className="mt-3 pt-3 border-t border-pink-400/30">
                  <div className="flex justify-between text-xs text-pink-300">
                    <span>Time Saved</span>
                    <span className="font-bold text-white">142 hrs</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section with 3D cards */}
      <section className="relative py-32 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Superpowers
              </span>
              <span className="text-white"> for Hiring</span>
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Features that make recruitment feel like magic
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description: "Deep semantic understanding that goes beyond keyword matching",
                gradient: "from-cyan-500/20 to-blue-500/20",
                border: "border-cyan-400/30",
                iconColor: "text-cyan-400"
              },
              {
                icon: Zap,
                title: "Lightning Speed",
                description: "Process 1,000+ resumes in under 60 seconds",
                gradient: "from-yellow-500/20 to-orange-500/20",
                border: "border-yellow-400/30",
                iconColor: "text-yellow-400"
              },
              {
                icon: FileText,
                title: "Smart Parsing",
                description: "Handles PDF, Word, and plain text with perfect accuracy",
                gradient: "from-purple-500/20 to-pink-500/20",
                border: "border-purple-400/30",
                iconColor: "text-purple-400"
              },
              {
                icon: Calendar,
                title: "Auto Scheduling",
                description: "Generate interview invites and sync calendars instantly",
                gradient: "from-emerald-500/20 to-teal-500/20",
                border: "border-emerald-400/30",
                iconColor: "text-emerald-400"
              },
              {
                icon: Star,
                title: "Bias-Free Scoring",
                description: "Objective evaluation based purely on skills and experience",
                gradient: "from-blue-500/20 to-indigo-500/20",
                border: "border-blue-400/30",
                iconColor: "text-blue-400"
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Share insights and export beautiful PDF reports",
                gradient: "from-pink-500/20 to-rose-500/20",
                border: "border-pink-400/30",
                iconColor: "text-pink-400"
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`p-8 rounded-3xl backdrop-blur-2xl bg-gradient-to-br ${feature.gradient} border ${feature.border} shadow-2xl group cursor-pointer`}
              >
                <feature.icon className={`w-12 h-12 ${feature.iconColor} mb-6 group-hover:scale-110 transition-transform`} />
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-blue-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-16 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-400/30 overflow-hidden"
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 100%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 0%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative text-center">
              <motion.h2
                className="text-4xl lg:text-6xl font-bold text-white mb-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Ready to <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Transform</span> Hiring?
              </motion.h2>
              <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                Join 5,000+ companies using AI to hire smarter, faster, and better
              </p>
              <Button
                data-testid="cta-get-started-button"
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-full px-12 h-20 text-xl font-bold shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-shadow group"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <div className="mt-6 text-blue-300 text-sm">
                No credit card • Free 14-day trial • Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Recruit-AI
            </span>
          </div>
          <p className="text-blue-300">
            © 2026 Recruit-AI. Powered by Emergent AI. The future of intelligent hiring.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
