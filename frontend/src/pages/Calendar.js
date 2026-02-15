import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, User, Trash2, Edit2, Home, Sparkles, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import apiClient from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'interview',
    start_datetime: '',
    end_datetime: '',
    location: '',
    candidate_name: '',
    candidate_email: '',
    status: 'scheduled',
    color_tag: 'blue'
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  const loadEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await apiClient.get('/calendar/events', {
        params: {
          start_date: startOfMonth.toISOString(),
          end_date: endOfMonth.toISOString()
        }
      });
      
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load calendar events');
    }
  };

  const handleCreateEvent = async () => {
    try {
      await apiClient.post('/calendar/events', formData);
      toast.success('Event created successfully');
      setIsDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async () => {
    try {
      await apiClient.put(`/calendar/events/${selectedEvent.event_id}`, formData);
      toast.success('Event updated successfully');
      setIsDialogOpen(false);
      setIsEditMode(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/calendar/events/${eventId}`);
      toast.success('Event deleted successfully');
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'interview',
      start_datetime: '',
      end_datetime: '',
      location: '',
      candidate_name: '',
      candidate_email: '',
      status: 'scheduled',
      color_tag: 'blue'
    });
    setSelectedEvent(null);
    setIsEditMode(false);
  };

  const openEditDialog = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_datetime: event.start_datetime.slice(0, 16),
      end_datetime: event.end_datetime.slice(0, 16),
      location: event.location || '',
      candidate_name: event.candidate_name || '',
      candidate_email: event.candidate_email || '',
      status: event.status,
      color_tag: event.color_tag
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                <Button variant="ghost" className="font-medium">
                  Calendar
                </Button>
                <Button variant="ghost" onClick={() => navigate('/emails')}>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Calendar</h1>
              <p className="text-muted-foreground">Schedule interviews and manage events</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ios-button-primary" onClick={resetForm}>
                  <Plus className="w-5 h-5 mr-2" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {isEditMode ? 'Edit Event' : 'Create New Event'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      className="ios-input mt-1"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Interview with candidate"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Event Type</Label>
                      <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                        <SelectTrigger className="ios-input mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Color Tag</Label>
                      <Select value={formData.color_tag} onValueChange={(value) => setFormData({ ...formData, color_tag: value })}>
                        <SelectTrigger className="ios-input mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date & Time *</Label>
                      <Input
                        type="datetime-local"
                        className="ios-input mt-1"
                        value={formData.start_datetime}
                        onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label>End Date & Time *</Label>
                      <Input
                        type="datetime-local"
                        className="ios-input mt-1"
                        value={formData.end_datetime}
                        onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Location</Label>
                    <Input
                      className="ios-input mt-1"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Conference Room A / Zoom Link"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Candidate Name</Label>
                      <Input
                        className="ios-input mt-1"
                        value={formData.candidate_name}
                        onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <Label>Candidate Email</Label>
                      <Input
                        type="email"
                        className="ios-input mt-1"
                        value={formData.candidate_email}
                        onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      className="ios-input mt-1 min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add any additional notes..."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      className="ios-button-primary flex-1"
                      onClick={isEditMode ? handleUpdateEvent : handleCreateEvent}
                      disabled={!formData.title || !formData.start_datetime || !formData.end_datetime}
                    >
                      {isEditMode ? 'Update Event' : 'Create Event'}
                    </Button>
                    <Button variant="outline" className="ios-button-secondary" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calendar Controls */}
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="ios-button-secondary"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <h2 className="text-2xl font-bold min-w-[200px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="ios-button-secondary"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="ios-button-secondary"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={view === 'month' ? 'default' : 'outline'}
                    className={view === 'month' ? 'ios-button-primary' : 'ios-button-secondary'}
                    onClick={() => setView('month')}
                  >
                    Month
                  </Button>
                  <Button
                    variant={view === 'week' ? 'default' : 'outline'}
                    className={view === 'week' ? 'ios-button-primary' : 'ios-button-secondary'}
                    onClick={() => setView('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={view === 'day' ? 'default' : 'outline'}
                    className={view === 'day' ? 'ios-button-primary' : 'ios-button-secondary'}
                    onClick={() => setView('day')}
                  >
                    Day
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <Card className="glass-card">
            <CardContent className="p-6">
              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDay(day.fullDate);
                  const isToday = day.fullDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`min-h-[120px] p-2 rounded-xl border transition-all hover:shadow-lg ${
                        day.isCurrentMonth
                          ? 'glass border-border'
                          : 'bg-muted/30 border-transparent'
                      } ${isToday ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                      } ${isToday ? 'text-primary font-bold' : ''}`}>
                        {day.date}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.event_id}
                            onClick={() => {
                              setSelectedEvent(event);
                            }}
                            className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium text-white ${
                              colorMap[event.color_tag] || 'bg-blue-500'
                            } hover:opacity-90 transition-opacity truncate`}
                          >
                            {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Event Details Sidebar */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="fixed right-0 top-0 h-full w-96 glass-card border-l p-6 overflow-y-auto z-40 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Event Details</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className={`w-full h-2 rounded-full mb-4 ${colorMap[selectedEvent.color_tag]}`} />
                    <h4 className="text-2xl font-bold mb-2">{selectedEvent.title}</h4>
                    {selectedEvent.description && (
                      <p className="text-muted-foreground">{selectedEvent.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {new Date(selectedEvent.start_datetime).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          to {new Date(selectedEvent.end_datetime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {selectedEvent.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>{selectedEvent.location}</div>
                      </div>
                    )}
                    
                    {selectedEvent.candidate_name && (
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="font-medium">{selectedEvent.candidate_name}</div>
                          {selectedEvent.candidate_email && (
                            <div className="text-sm text-muted-foreground">
                              {selectedEvent.candidate_email}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="ios-button-secondary flex-1"
                      onClick={() => openEditDialog(selectedEvent)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          handleDeleteEvent(selectedEvent.event_id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default Calendar;
