import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnalysisProvider } from './context/AnalysisContext';

import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CodeAnalyzer } from './pages/CodeAnalyzer';
import { AnalysisResults } from './pages/AnalysisResults';
import { AnalysisHistory } from './pages/AnalysisHistory';

import './App.css';

// Scroll to top upon navigating to a new route
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AnalysisProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Landing Page */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Internal Dashboard & Tools */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyzer" element={<CodeAnalyzer />} />
            <Route path="/results" element={<AnalysisResults />} />
            <Route path="/history" element={<AnalysisHistory />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </AnalysisProvider>
  );
}

export default App;
