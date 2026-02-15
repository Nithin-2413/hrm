import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Upload, History, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import apiClient from '../utils/api';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalResumes: 0,
    totalScreenings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const jobsResponse = await apiClient.get('/jobs?status=active');
      const screeningsResponse = await apiClient.get('/screenings');
      setStats({
        activeJobs: jobsResponse.data.length,
        totalScreenings: screeningsResponse.data.length,
        totalResumes: 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="dashboard-loading">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-container">
      <nav className="border-b glass-surface sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Recruit-AI</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                <Button 
                  variant="ghost"
                  className="text-foreground font-medium"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/jobs')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Jobs
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/screening')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Screening
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/history')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  History
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Welcome to Recruit-AI</h1>
            <p className="text-lg text-muted-foreground">Let's find your next great hire</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-8 p-8 rounded-xl border bg-card hover:shadow-md transition-shadow"
              data-testid="quick-actions-card"
            >
              <h2 className="text-2xl font-semibold mb-6 tracking-tight">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  data-testid="action-create-jd-button"
                  variant="outline"
                  className="h-auto py-6 flex-col items-start text-left hover:border-primary transition-colors"
                  onClick={() => navigate('/jobs')}
                >
                  <FileText className="h-6 w-6 mb-2 text-primary" />
                  <div>
                    <div className="font-semibold text-base mb-1">Create Job Description</div>
                    <div className="text-sm text-muted-foreground font-normal">Define role requirements</div>
                  </div>
                </Button>

                <Button
                  data-testid="action-upload-resume-button"
                  variant="outline"
                  className="h-auto py-6 flex-col items-start text-left hover:border-primary transition-colors"
                  onClick={() => navigate('/screening')}
                >
                  <Upload className="h-6 w-6 mb-2 text-primary" />
                  <div>
                    <div className="font-semibold text-base mb-1">Upload Resumes</div>
                    <div className="text-sm text-muted-foreground font-normal">Single or bulk screening</div>
                  </div>
                </Button>

                <Button
                  data-testid="action-view-history-button"
                  variant="outline"
                  className="h-auto py-6 flex-col items-start text-left hover:border-primary transition-colors"
                  onClick={() => navigate('/history')}
                >
                  <History className="h-6 w-6 mb-2 text-primary" />
                  <div>
                    <div className="font-semibold text-base mb-1">Screening History</div>
                    <div className="text-sm text-muted-foreground font-normal">Review past analyses</div>
                  </div>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="md:col-span-4 p-8 rounded-xl border bg-secondary/20"
              data-testid="stats-card"
            >
              <h2 className="text-2xl font-semibold mb-6 tracking-tight">Your Stats</h2>
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold mb-1">{stats.totalScreenings}</div>
                  <div className="text-sm text-muted-foreground">Resumes Screened</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">{stats.activeJobs}</div>
                  <div className="text-sm text-muted-foreground">Active Jobs</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">0</div>
                  <div className="text-sm text-muted-foreground">Interviews Scheduled</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 p-8 rounded-xl border bg-card"
            data-testid="recent-activity-card"
          >
            <h2 className="text-2xl font-semibold mb-4 tracking-tight">Recent Activity</h2>
            <div className="text-center py-12 text-muted-foreground">
              <p>No screening activity yet. Upload your first resume to get started!</p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
