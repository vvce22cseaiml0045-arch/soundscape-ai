import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import UploadAudio from "./components/UploadAudio";
import ResultCard from "./components/ResultCard";
import NoiseGraphs from "./components/NoiseGraphs";
import PredictionHistory from "./components/PredictionHistory";
import AccuracyGraph from "./components/AccuracyGraph";
import NoiseRouteMap from "./components/NoiseRouteMap";
import LogoutDialog from "./components/LogoutDialog";
import ThemeToggle from "./components/ThemeToggle";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    const loginTime = localStorage.getItem('soundscape_login_time');
    const isLoggedIn = localStorage.getItem('soundscape_logged_in') === 'true';
    const currentSessionActive = sessionStorage.getItem('soundscape_session_active') === 'true';

    // If there is no active session in this tab/window, force a logout
    if (isLoggedIn && !currentSessionActive) {
      localStorage.removeItem('soundscape_logged_in');
      localStorage.removeItem('soundscape_login_time');
      return false;
    }

    if (isLoggedIn && loginTime) {
      const elapsed = (new Date().getTime() - parseInt(loginTime, 10)) / 1000;
      if (elapsed >= 3600) { // 3600 seconds = 1 hour
        localStorage.removeItem('soundscape_logged_in');
        localStorage.removeItem('soundscape_login_time');
        sessionStorage.removeItem('soundscape_session_active');
        return false;
      }
      return true;
    }
    return isLoggedIn;
  });
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('soundscape_active_section') || "upload";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [result, setResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('soundscape_analysis_result');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [cnnData, setCNNData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('soundscape_analysis_cnn');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (result) sessionStorage.setItem('soundscape_analysis_result', JSON.stringify(result));
    else sessionStorage.removeItem('soundscape_analysis_result');
  }, [result]);

  useEffect(() => {
    if (cnnData) sessionStorage.setItem('soundscape_analysis_cnn', JSON.stringify(cnnData));
    else sessionStorage.removeItem('soundscape_analysis_cnn');
  }, [cnnData]);

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  const { toast } = useToast();

  // Persist login state
  const handleLogin = () => {
    setLoggedIn(true);
    setActiveSection("upload"); // Always start with upload page after login
    localStorage.setItem('soundscape_logged_in', 'true');
    localStorage.setItem('soundscape_login_time', new Date().getTime().toString());
    localStorage.setItem('soundscape_active_section', 'upload');
    sessionStorage.setItem('soundscape_session_active', 'true');
  };

  // Handle logout
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('soundscape_logged_in');
    localStorage.removeItem('soundscape_login_time');
    localStorage.removeItem('soundscape_active_section'); // Clear active section on logout
    sessionStorage.removeItem('soundscape_session_active');
    // Clear any cached data
    setResult(null);
    setCNNData(null);
    setStats(null);
    setHistory([]);
    setActiveSection("upload"); // Reset to upload page
    setShowLogoutDialog(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const fetchData = useCallback(async () => {
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch history
      const historyRes = await fetch(`${API_URL}/history`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Data Loading Error",
        description: "Unable to load dashboard data. Please check your connection.",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (loggedIn) {
      fetchData();

      // Periodic session check
      const interval = setInterval(() => {
        const loginTime = localStorage.getItem('soundscape_login_time');
        if (loginTime) {
          const elapsed = (new Date().getTime() - parseInt(loginTime, 10)) / 1000;
          if (elapsed >= 3600) {
            setLoggedIn(false);
            localStorage.removeItem('soundscape_logged_in');
            localStorage.removeItem('soundscape_login_time');
            sessionStorage.removeItem('soundscape_session_active');
            setResult(null);
            setCNNData(null);
            setStats(null);
            setHistory([]);
            setActiveSection("upload");
            toast({
              variant: "destructive",
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
            });
          }
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [loggedIn, result, fetchData, toast]);

  // Persist active section
  useEffect(() => {
    localStorage.setItem('soundscape_active_section', activeSection);
  }, [activeSection]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* LOGIN */
  if (!loggedIn) {
    return (
      <ThemeProvider>
        <Login setLoggedIn={handleLogin} />
        <Toaster />
      </ThemeProvider>
    );
  }

  /* DASHBOARD */
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          hasAnalysis={!!(result || cnnData)}
        />

        {/* Theme Toggle - Top Right Corner */}
        <div className="fixed top-4 right-4 z-40">
          <ThemeToggle
            variant="outline"
            size="sm"
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-lg"
          />
        </div>

        <motion.div
          className={`p-4 md:p-6 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-16 md:ml-64"
            }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3 text-gray-800 dark:text-gray-100">
            <Volume2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> Soundscape AI Dashboard
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload + Result */}
            {(activeSection === "upload" || activeSection === "all") && (
              <div className="lg:col-span-2 space-y-6">
                <UploadAudio
                  fileInputKey={fileInputKey}
                  currentFileName={result?.fileName || cnnData?.fileName}
                  setResult={setResult}
                  setCNNData={setCNNData}
                />
                <ResultCard 
                  result={result || cnnData} 
                  onClear={() => {
                    setResult(null);
                    setCNNData(null);
                    setFileInputKey(prev => prev + 1);
                  }}
                />
              </div>
            )}

            {(activeSection === "route" || activeSection === "all") && (
              <div className="lg:col-span-2">
                <NoiseRouteMap
                  noiseLevel={
                    result?.noise_level ||
                    result?.ml_result?.noise_level ||
                    "Low"
                  }
                  hasAnalysis={!!(result || cnnData)}
                />
              </div>
            )}

            {/* Accuracy Comparison */}
            {(activeSection === "accuracy" || activeSection === "all") && (
              <AccuracyGraph />
            )}

            {/* Stats */}
            {(activeSection === "stats" || activeSection === "all") && (
              <div className="lg:col-span-2">
                <NoiseGraphs stats={stats} />
              </div>
            )}

            {/* History */}
            {(activeSection === "history" || activeSection === "all") && (
              <div className="lg:col-span-2">
                <PredictionHistory history={history} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Logout Confirmation Dialog */}
        <LogoutDialog
          isOpen={showLogoutDialog}
          onClose={cancelLogout}
          onConfirm={confirmLogout}
        />

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;