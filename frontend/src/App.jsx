import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import PatientAllocation from "./pages/PatientAllocation";
import TherapyPlans from "./pages/TherapyPlans";
import Sessions from "./pages/Sessions";
import ProgressReports from "./pages/ProgressReports";
import Evaluations from "./pages/Evaluations";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import "./App.css";
import "./styles/common.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <SignedOut>
            <div className="auth-container">
              <div className="auth-card">
                <h1>Therapy Case Management</h1>
                <p>Please sign in to access the case management system.</p>
                <div className="auth-buttons">
                  <SignInButton mode="modal">
                    <button className="auth-button primary">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="auth-button secondary">Sign Up</button>
                  </SignUpButton>
                </div>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="app-layout">
              <Navigation />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patient-allocation" element={<PatientAllocation />} />
                  <Route path="/therapy-plans" element={<TherapyPlans />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/progress-reports" element={<ProgressReports />} />
                  <Route path="/evaluations" element={<Evaluations />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </SignedIn>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
