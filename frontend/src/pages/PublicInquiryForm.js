import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CAMPAIGN_TYPES = ['Reel', 'Story', 'Post', 'YouTube Video', 'Blog', 'Live', 'Multiple'];
const BUDGET_RANGES = ['Under ₹5K', '₹5K–₹15K', '₹15K–₹50K', '₹50K–₹1L', 'Above ₹1L', 'To be discussed'];

const PublicInquiryForm = () => {
  const { username } = useParams();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    brandName: '', contactPerson: '', email: '', phone: '',
    budgetRange: '', campaignType: [], timeline: '',
    message: '', category: ''
  });

  useEffect(() => {
    axios.get(`/api/creators/${username}`)
      .then(res => setCreator(res.data.creator))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const toggleCampaignType = (type) => {
    setForm(prev => ({
      ...prev,
      campaignType: prev.campaignType.includes(type)
        ? prev.campaignType.filter(t => t !== type)
        : [...prev.campaignType, type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.campaignType.length === 0) {
      toast.error('Please select at least one campaign type');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => formData.append(k, item));
        else formData.append(k, v);
      });

      await axios.post(`/api/brand-inquiry/${username}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F9FAFB' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #6C63FF', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#F9FAFB' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>😕</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 8 }}>Creator not found</h2>
        <p style={{ color: '#6B7280' }}>This page doesn't exist. Double check the link.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'DM Sans', sans-serif", padding: 16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ textAlign: 'center', padding: 48, background: 'white', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', maxWidth: 440, width: '100%' }}>
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>✓</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 12 }}>Inquiry Sent!</h2>
        <p style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: 24 }}>
          Your collaboration inquiry has been sent to <strong>{creator?.name}</strong>. They'll review it and get back to you within <strong>48–72 hours</strong>.
        </p>
        <div style={{ background: '#F8F9FF', borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#4B5563' }}>
            ✅ Inquiry received by {creator?.name}<br />
            📧 Auto-reply sent to your email<br />
            ⏳ Response in 48–72 hours
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#9CA3AF' }}>Powered by <strong>CreatorStudio</strong></p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-input, .form-select, .form-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #E5E7EB; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1A1A2E; background: white; transition: border-color 0.15s, box-shadow 0.15s; outline: none; box-sizing: border-box; }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #6C63FF; box-shadow: 0 0 0 3px rgba(108,99,255,0.12); }
        .form-textarea { resize: vertical; min-height: 100px; }
        .chip { display: inline-flex; align-items: center; padding: 7px 16px; border-radius: 20px; border: 1.5px solid #E5E7EB; cursor: pointer; font-size: 13px; font-weight: 500; color: #6B7280; transition: all 0.15s; user-select: none; background: white; margin: 3px; }
        .chip.selected { border-color: #6C63FF; background: #EEF0FF; color: #6C63FF; }
        .chip:hover { border-color: #6C63FF; }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%)',
        padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700, color: 'white',
          margin: '0 auto 12px', position: 'relative'
        }}>
          {creator?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 5vw, 26px)', color: 'white', marginBottom: 4, position: 'relative' }}>
          Work with {creator?.name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, position: 'relative' }}>
          @{creator?.instagramHandle || creator?.username} • {creator?.niche}
        </p>
        {creator?.bio && (
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, maxWidth: 420, margin: '10px auto 0', lineHeight: 1.6, position: 'relative' }}>
            {creator.bio}
          </p>
        )}
      </div>

      {/* Form */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 'clamp(20px, 4vw, 32px)' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>Brand Collaboration Inquiry</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Fill in your details to start a conversation about collaborating.</p>

          <form onSubmit={handleSubmit}>
            {/* Brand info */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 14 }}>Brand Information</h4>
              <div className="inquiry-form-grid">
                <div style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Brand Name *</label>
                  <input className="form-input" placeholder="Your Brand Name" value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Contact Person *</label>
                  <input className="form-input" placeholder="Your Name" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Email *</label>
                  <input className="form-input" type="email" placeholder="brand@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Phone (optional)</label>
                  <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Campaign details */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 14 }}>Campaign Details</h4>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Campaign Type * <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(select all that apply)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  {CAMPAIGN_TYPES.map(type => (
                    <span
                      key={type}
                      className={`chip ${form.campaignType.includes(type) ? 'selected' : ''}`}
                      onClick={() => toggleCampaignType(type)}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="inquiry-form-grid">
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Budget Range *</label>
                  <select className="form-select" value={form.budgetRange} onChange={e => setForm({ ...form, budgetRange: e.target.value })} required>
                    <option value="">Select budget range</option>
                    {BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Timeline *</label>
                  <input className="form-input" placeholder="e.g. March 2024, ASAP, 2 weeks" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} required />
                </div>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9CA3AF', fontWeight: 600, marginBottom: 14 }}>Your Message</h4>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Campaign Brief *</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 120 }}
                  placeholder="Tell us about your brand, the campaign idea, product to promote, target audience, and any other relevant details..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                />
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                  The more detail you provide, the better {creator?.name} can respond to your needs.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                border: 'none', borderRadius: 10, color: 'white', fontSize: 16, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: submitting ? 0.8 : 1
              }}
            >
              {submitting ? (
                <>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                  Sending...
                </>
              ) : 'Send Collaboration Inquiry →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 14 }}>
              Your inquiry will be reviewed by {creator?.name}. An auto-reply will be sent to your email. 🔒 No spam, ever.
            </p>
          </form>
        </div>

        <div style={{ textAlign: 'center', padding: 24, fontSize: 12, color: '#9CA3AF' }}>
          Powered by <strong style={{ color: '#6C63FF' }}>CreatorStudio</strong> — Professional Creator Toolkit
        </div>
      </div>
    </div>
  );
};

export default PublicInquiryForm;
