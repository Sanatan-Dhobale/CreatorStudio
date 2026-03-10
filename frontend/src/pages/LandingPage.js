import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '📬',
      title: 'Brand Inquiry CRM',
      desc: 'Professional brand deal intake system. Track inquiries from New → Negotiating → Closed with automated email notifications.',
      color: '#EEF0FF',
      accent: '#6C63FF'
    },
    {
      icon: '🔗',
      title: 'Affiliate Link Tracker',
      desc: 'Create short links, track clicks by device & country, visualize performance with heatmaps and daily charts.',
      color: '#ECFDF5',
      accent: '#059669'
    },
    {
      icon: '📄',
      title: 'Media Kit Generator',
      desc: 'Auto-generate professional PDF media kits with your stats, demographics, brand logos and pricing.',
      color: '#FFF8E6',
      accent: '#D97706'
    }
  ];

  const stats = [
    { value: '500+', label: 'Active Creators' },
    { value: '₹12L+', label: 'Deals Tracked' },
    { value: '2.4M+', label: 'Clicks Tracked' },
    { value: '3K+', label: 'Media Kits Generated' }
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Import fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div className="landing-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18
            }}>⚡</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A2E' }}>CreatorStudio</span>
          </div>
          <div className="landing-nav-actions">
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 20px', background: 'transparent', border: '1.5px solid #E5E7EB',
                borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1A1A2E',
                fontFamily: 'inherit'
              }}
            >Sign In</button>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '8px 20px', background: '#6C63FF', border: 'none',
                borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'white',
                fontFamily: 'inherit'
              }}
            >Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#EEF0FF', color: '#6C63FF', padding: '6px 16px',
          borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24
        }}>
          ✨ The Professional Creator Toolkit
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 700, color: '#1A1A2E', lineHeight: 1.15, marginBottom: 20
        }}>
          Turn your influence into
          <br />
          <span style={{ background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            a professional business
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#6B7280', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Manage brand deals, track affiliate revenue, and generate stunning media kits — all from one dashboard built for Indian creators.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '14px 32px', background: '#6C63FF', border: 'none',
              borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 700, color: 'white',
              fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(108, 99, 255, 0.35)'
            }}
          >Start for Free →</button>
          <button
            onClick={() => navigate('/collab/demo')}
            style={{
              padding: '14px 32px', background: 'transparent', border: '1.5px solid #E5E7EB',
              borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#1A1A2E',
              fontFamily: 'inherit'
            }}
          >See Sample Page</button>
        </div>

        {/* Stats strip */}
        <div style={{ marginTop: 60, borderTop: '1px solid #E5E7EB', paddingTop: 40 }}>
          <div className="landing-stats">
            {stats.map(s => (
              <div key={s.value} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#6C63FF' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" style={{ background: '#FAFAFA' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#1A1A2E' }}>
            Everything you need to go pro
          </h2>
          <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: 48, fontSize: 16 }}>
            Three powerful tools. One platform. Zero complexity.
          </p>

          <div className="landing-features-grid">
            {features.map(f => (
              <div key={f.title} style={{
                background: 'white', borderRadius: 16, padding: 28,
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
              >
                <div style={{
                  width: 52, height: 52, background: f.color, borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 16
                }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ color: '#6B7280', lineHeight: 1.65, fontSize: 14 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: '0 auto' }} className="landing-features">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 48, color: '#1A1A2E' }}>
          Built for the Indian creator economy
        </h2>
        <div className="landing-steps-grid">
          {[
            { step: '01', title: 'Share your collab link', desc: 'Add your /collab/username link to Instagram bio' },
            { step: '02', title: 'Brands fill the form', desc: 'Professional intake form captures all deal details' },
            { step: '03', title: 'Manage in dashboard', desc: 'Track, negotiate and close deals in your CRM' },
            { step: '04', title: 'Get paid, track revenue', desc: 'Monitor all earnings and generate media kit' }
          ].map(item => (
            <div key={item.step} style={{ textAlign: 'center', padding: 20 }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700,
                color: '#EEF0FF', WebkitTextStroke: '2px #6C63FF', marginBottom: 12
              }}>{item.step}</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{item.title}</h4>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta" style={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%)'
      }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 12 }}>
          Ready to get professional?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 28, fontSize: 15 }}>
          Join 500+ Indian creators who use CreatorStudio to manage their brand deals
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '14px 36px', background: 'white', border: 'none',
            borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 700,
            color: '#6C63FF', fontFamily: 'inherit'
          }}
        >Create Free Account →</button>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px 16px', borderTop: '1px solid #E5E7EB', color: '#9CA3AF', fontSize: 13 }}>
        © 2024 CreatorStudio • Built for Indian Creators ⚡
      </footer>
    </div>
  );
};

export default LandingPage;
