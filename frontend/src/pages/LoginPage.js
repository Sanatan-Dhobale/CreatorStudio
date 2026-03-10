import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthLayout = ({ children, title, subtitle, switchText, switchLink, switchLabel }) => (
  <div className="auth-layout" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

    {/* Left Panel */}
    <div className="auth-left-panel" style={{
      background: 'linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%)'
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
        borderRadius: '50%', background: 'rgba(255,255,255,0.06)'
      }} />

      <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          CreatorStudio
        </h1>
        <p style={{ opacity: 0.85, fontSize: 15, lineHeight: 1.7, maxWidth: 280 }}>
          The all-in-one professional toolkit for Indian content creators.
        </p>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Brand Inquiry CRM', 'Affiliate Link Tracker', 'Media Kit Generator'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 13
              }}>✓</div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Panel */}
    <div className="auth-right-panel">
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 36 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>CreatorStudio</span>
        </Link>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>{title}</h2>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>{subtitle}</p>

        {children}

        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 24 }}>
          {switchText}{' '}
          <Link to={switchLink} style={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}>{switchLabel}</Link>
        </p>
      </div>
    </div>
  </div>
);

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your CreatorStudio dashboard"
      switchText="Don't have an account?"
      switchLink="/register"
      switchLabel="Get started free"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@gmail.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15, marginTop: 8 }}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.username.toLowerCase(), form.email, form.password);
      toast.success('Account created! Welcome to CreatorStudio 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your creator business today"
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign in"
    >
      <form onSubmit={handleSubmit}>
        <div className="register-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="Priya Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="priya_creates" value={form.username} onChange={e => setForm({ ...form, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@gmail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>

        {form.username && (
          <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#059669' }}>
            🔗 Your collab link: <strong>creatorhub.app/collab/{form.username}</strong>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Create Free Account'}
        </button>
        <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 12 }}>
          By signing up, you agree to our Terms of Service
        </p>
      </form>
    </AuthLayout>
  );
};
