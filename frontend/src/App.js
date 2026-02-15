import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Screening from "./pages/Screening";
import History from "./pages/History";
import Calendar from "./pages/Calendar";
import EmailDrafts from "./pages/EmailDrafts";
import { Toaster } from "./components/ui/sonner";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/screening" element={<Screening />} />
      <Route path="/history" element={<History />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/emails" element={<EmailDrafts />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
