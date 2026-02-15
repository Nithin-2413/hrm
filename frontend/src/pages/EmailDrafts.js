import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Copy, RefreshCw, Send, Sparkles, Home, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import apiClient from '../utils/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const EmailDrafts = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [formData, setFormData] = useState({
    email_type: 'interview_invitation',
    candidate_name: '',
    job_title: '',
    company_name: 'Our Company',
    interview_date: '',
    interview_time: '',
    interview_location: '',
    tone: 'professional',
    additional_details: ''
  });

  const emailTypeLabels = {
    interview_invitation: 'Interview Invitation',
    reschedule: 'Interview Reschedule',
    offer_letter: 'Job Offer Letter',
    rejection: 'Rejection Notice',
    follow_up: 'Follow-up After Interview'
  };

  const handleGenerate = async () => {
    if (!formData.candidate_name) {
      toast.error('Please enter candidate name');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await apiClient.post('/emails/generate-draft', formData);
      setGeneratedEmail(response.data);
      toast.success('Email draft generated successfully!');
    } catch (error) {
      console.error('Failed to generate email:', error);
      toast.error('Failed to generate email draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    
    const emailText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(emailText);
    toast.success('Copied to clipboard!');
  };

  const handleReset = () => {
    setGeneratedEmail(null);
    setFormData({
      email_type: 'interview_invitation',
      candidate_name: '',
      job_title: '',
      company_name: 'Our Company',
      interview_date: '',
      interview_time: '',
      interview_location: '',
      tone: 'professional',
      additional_details: ''
    });
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Glassmorphism Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Recruit-AI</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => navigate('/jobs')}>
                  Jobs
                </Button>
                <Button variant="ghost" onClick={() => navigate('/screening')}>
                  Screen Resumes
                </Button>
                <Button variant="ghost" onClick={() => navigate('/history')}>
                  History
                </Button>
                <Button variant="ghost" onClick={() => navigate('/calendar')}>
                  Calendar
                </Button>
                <Button variant="ghost" className="font-medium">
                  Email Drafts
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
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
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Email Draft Generator</h1>
            <p className="text-muted-foreground text-lg">
              Generate professional HR emails with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>Fill in the details to generate your email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email Type *</Label>
                  <Select
                    value={formData.email_type}
                    onValueChange={(value) => setFormData({ ...formData, email_type: value })}
                  >
                    <SelectTrigger className="ios-input mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(emailTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Candidate Name *</Label>
                    <Input
                      className="ios-input mt-1"
                      value={formData.candidate_name}
                      onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      className="ios-input mt-1"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      placeholder="Senior Developer"
                    />
                  </div>
                </div>

                <div>
                  <Label>Company Name</Label>
                  <Input
                    className="ios-input mt-1"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Tech Corp Inc."
                  />
                </div>

                {(formData.email_type === 'interview_invitation' || formData.email_type === 'reschedule') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Interview Date</Label>
                        <Input
                          type="date"
                          className="ios-input mt-1"
                          value={formData.interview_date}
                          onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label>Interview Time</Label>
                        <Input
                          type="time"
                          className="ios-input mt-1"
                          value={formData.interview_time}
                          onChange={(e) => setFormData({ ...formData, interview_time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Interview Location</Label>
                      <Input
                        className="ios-input mt-1"
                        value={formData.interview_location}
                        onChange={(e) => setFormData({ ...formData, interview_location: e.target.value })}
                        placeholder="Office or Zoom link"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>Tone</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => setFormData({ ...formData, tone: value })}
                  >
                    <SelectTrigger className="ios-input mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Additional Details</Label>
                  <Textarea
                    className="ios-input mt-1 min-h-[100px]"
                    value={formData.additional_details}
                    onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
                    placeholder="Any specific points to include in the email..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="ios-button-primary flex-1"
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.candidate_name}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Email
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="ios-button-secondary"
                    onClick={handleReset}
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Preview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Generated Email
                  </span>
                  {generatedEmail && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ios-button-secondary"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {generatedEmail
                    ? 'Your AI-generated email is ready'
                    : 'Fill the form and click Generate to see your email'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!generatedEmail && !isGenerating && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mb-4 shadow-lg">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-muted-foreground">
                      Configure your email settings and generate a professional draft
                    </p>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Generating your email...</p>
                  </div>
                )}

                {generatedEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* macOS Mail-inspired header */}
                    <div className="glass rounded-xl p-4 border">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground min-w-[60px]">To:</span>
                          <span className="text-sm">{formData.candidate_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Subject:</span>
                          <span className="text-sm font-semibold">{generatedEmail.subject}</span>
                        </div>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="glass rounded-xl p-6 border">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {generatedEmail.body}
                        </div>
                      </div>
                    </div>

                    {/* Success Badge */}
                    <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Email generated successfully! Copy and send when ready.
                      </span>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Email Templates Info */}
          <Card className="glass-card mt-6">
            <CardHeader>
              <CardTitle>Available Email Templates</CardTitle>
              <CardDescription>Choose from our AI-powered professional templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(emailTypeLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, email_type: key })}
                    className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                      formData.email_type === key
                        ? 'border-primary bg-primary/10'
                        : 'border-border glass hover:border-primary/50'
                    }`}
                  >
                    <Mail className="w-5 h-5 mb-2 text-primary" />
                    <div className="text-sm font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default EmailDrafts;
