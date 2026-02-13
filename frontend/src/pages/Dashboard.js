import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, FileText, Upload, History, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import axios from 'axios';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [isAuthenticated, setIsAuthenticated] = useState(location.state?.user ? true : null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalResumes: 0,
    scheduledInterviews: 0
  });

  useEffect(() => {
    if (location.state?.user) {
      loadStats();
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
        setIsAuthenticated(true);
        loadStats();
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    checkAuth();
  }, [location.state, navigate]);

  const loadStats = async () => {
    try {
      const jobsResponse = await axios.get(`${API}/jobs?status=active`, {
        withCredentials: true
      });
      setStats(prev => ({
        ...prev,
        activeJobs: jobsResponse.data.length
      }));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="dashboard-loading">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const userInitials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

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
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="user-menu-trigger">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback className="ai-gradient text-white">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none" data-testid="user-name">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground" data-testid="user-email">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="settings-menu-item">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Welcome back, {user?.name?.split(' ')[0]}</h1>
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
                  <div className="text-4xl font-bold mb-1">0</div>
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
