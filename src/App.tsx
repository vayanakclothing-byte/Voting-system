import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { ParticlesBackground } from './components/ParticlesBackground';
import { SplashScreen } from './components/SplashScreen';
import { Login } from './pages/Login';
import { Voting } from './pages/Voting';
import { Confirmation } from './pages/Confirmation';
import { AdminDashboard } from './pages/AdminDashboard';
import { LiveResults } from './pages/LiveResults';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/voting" element={<PageTransition><Voting /></PageTransition>} />
        <Route path="/confirmation" element={<PageTransition><Confirmation /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/results" element={<PageTransition><LiveResults /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="relative min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden bg-slate-950 font-['Outfit',sans-serif]">
          <SplashScreen />
          
          <ParticlesBackground />
          <AnnouncementBanner />
          <Navbar />

          <div className="flex-1 relative z-10 w-full">
            <AnimatedRoutes />
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                borderRadius: '1rem',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(79, 70, 229, 0.3)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
