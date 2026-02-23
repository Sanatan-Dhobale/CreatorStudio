import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import { LoginPage } from "./pages/LoginPage";
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import InquiriesPage from './pages/InquiriesPage';
import AffiliatePage from './pages/AffiliatePage';
import MediaKitPage from './pages/MediaKitPage';
import PublicInquiryForm from './pages/PublicInquiryForm';
import './App.css';
import AffiliateRedirect from './pages/AffiliateRedirect';


const PrivateRoute = ({ children }) => {
  const { creator, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#FAFAFA'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #6C63FF', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );
  return creator ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '10px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' },
            success: { iconTheme: { primary: '#6C63FF', secondary: '#fff' } }
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public brand inquiry form */}
          <Route path="/collab/:username" element={<PublicInquiryForm />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard/inquiries" element={<PrivateRoute><InquiriesPage /></PrivateRoute>} />
          <Route path="/dashboard/affiliate" element={<PrivateRoute><AffiliatePage /></PrivateRoute>} />
          <Route path="/dashboard/media-kit" element={<PrivateRoute><MediaKitPage /></PrivateRoute>} />
          <Route path="/p/:slug" element={<AffiliateRedirect />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
