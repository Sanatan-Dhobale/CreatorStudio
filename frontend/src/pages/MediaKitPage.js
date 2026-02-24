import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const THEMES = [
  { id: 'minimal', name: 'Minimal', desc: 'Clean & Professional', preview: ['#FFFFFF', '#6C63FF', '#1A1A2E'] },
  { id: 'bold', name: 'Bold', desc: 'Dark & Impactful', preview: ['#1A1A2E', '#FF6B6B', '#FFFFFF'] },
  { id: 'gradient', name: 'Gradient', desc: 'Vibrant & Modern', preview: ['#667eea', '#764ba2', '#FFD700'] },
  { id: 'elegant', name: 'Elegant', desc: 'Luxury & Refined', preview: ['#FDF8F0', '#C9A227', '#2C2C2C'] },
];

const AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45+'];

const MediaKitPage = () => {
  const { creator } = useAuth();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  const fetchKit = async () => {
    try {
      const res = await axios.get('/api/media-kit/me');
      setKit(res.data.mediaKit);
    } catch { toast.error('Failed to load media kit'); }
    setLoading(false);
  };

  useEffect(() => { fetchKit(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put('/api/media-kit/me', kit);
      setKit(res.data.mediaKit);
      toast.success('Media kit saved! ✅');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDownload = () => {
    // Opens a new tab with a styled HTML media kit page.
    // The page has a "Save as PDF" button that triggers window.print().
    // Token passed as query param since window.open() cannot set auth headers.
    const token = localStorage.getItem('creatorhub_token');
    if (!token) { toast.error('Please log in again.'); return; }
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.open(`${apiBase}/api/media-kit/download?token=${token}`, '_blank');
    toast.success('Opened! Click "Save as PDF" in the new tab.');
  };


  const togglePublic = async () => {
    const updated = { ...kit, isPublic: !kit.isPublic };
    setKit(updated);
    try {
      await axios.put('/api/media-kit/me', { isPublic: updated.isPublic });
      toast.success(updated.isPublic ? 'Media kit is now public! 🌐' : 'Media kit set to private');
    } catch {}
  };

  const updateKit = (path, value) => {
    const keys = path.split('.');
    setKit(prev => {
      const newKit = { ...prev };
      let obj = newKit;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newKit;
    });
  };

  const addBrand = () => {
    setKit(prev => ({ ...prev, brandsWorkedWith: [...(prev.brandsWorkedWith || []), { name: '', logoUrl: '', year: '' }] }));
  };

  const updateBrand = (idx, field, value) => {
    const brands = [...kit.brandsWorkedWith];
    brands[idx] = { ...brands[idx], [field]: value };
    setKit(prev => ({ ...prev, brandsWorkedWith: brands }));
  };

  const removeBrand = (idx) => {
    setKit(prev => ({ ...prev, brandsWorkedWith: prev.brandsWorkedWith.filter((_, i) => i !== idx) }));
  };

  const addService = () => {
    setKit(prev => ({ ...prev, services: [...(prev.services || []), { name: '', price: 0, description: '' }] }));
  };

  const updateService = (idx, field, value) => {
    const services = [...kit.services];
    services[idx] = { ...services[idx], [field]: field === 'price' ? Number(value) : value };
    setKit(prev => ({ ...prev, services }));
  };

  const removeService = (idx) => {
    setKit(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== idx) }));
  };

  const tabs = [
    { id: 'stats', label: '📊 Stats', },
    { id: 'audience', label: '👥 Audience' },
    { id: 'brands', label: '🏷️ Brands' },
    { id: 'services', label: '💼 Services' },
    { id: 'design', label: '🎨 Theme' },
  ];

  if (loading) return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
      </main>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Media Kit</h1>
            <p>Generate your professional creator media kit for brands</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {kit?.isPublic && (
              <a
                href={`/api/media-kit/public/${kit.publicSlug}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: 'var(--purple)', textDecoration: 'none', fontWeight: 500 }}
              >
                🌐 Public Link
              </a>
            )}
            <button className="btn btn-ghost btn-sm" onClick={togglePublic}>
              {kit?.isPublic ? '🔒 Make Private' : '🌐 Make Public'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner spinner-dark" style={{ width: 14, height: 14 }} /> : '💾 Save'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              ⬇️ Download PDF
            </button>
          </div>
        </div>

        {/* Preview strip */}
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: 12,
          padding: '16px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 20
            }}>{creator?.name?.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{creator?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{creator?.instagramHandle || creator?.username} • {kit?.niche || creator?.niche}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'Followers', value: (kit?.followers?.instagram || 0).toLocaleString() },
              { label: 'Engagement', value: `${kit?.engagementRate || 0}%` },
              { label: 'Avg Views', value: (kit?.avgViews?.reels || 0).toLocaleString() },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--purple)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            Theme: <strong style={{ textTransform: 'capitalize' }}>{kit?.theme || 'minimal'}</strong>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F3F4F6', padding: 4, borderRadius: 10, width: 'fit-content' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--purple)' : 'var(--text-muted)',
                boxShadow: activeTab === t.id ? 'var(--shadow-sm)' : 'none'
              }}
            >{t.label}</button>
          ))}
        </div>

        <div className="card">
          {/* Stats tab */}
          {activeTab === 'stats' && (
            <div>
              <h3 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Platform Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Instagram Followers</label>
                  <input className="form-input" type="number" placeholder="50000" value={kit?.followers?.instagram || ''} onChange={e => updateKit('followers.instagram', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">YouTube Subscribers</label>
                  <input className="form-input" type="number" placeholder="10000" value={kit?.followers?.youtube || ''} onChange={e => updateKit('followers.youtube', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Engagement Rate (%)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="4.5" value={kit?.engagementRate || ''} onChange={e => updateKit('engagementRate', Number(e.target.value))} />
                  <p className="form-hint">Average likes + comments / followers × 100</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Niche</label>
                  <input className="form-input" placeholder="Beauty, Fashion, Tech..." value={kit?.niche || ''} onChange={e => updateKit('niche', e.target.value)} />
                </div>
              </div>

              <h4 style={{ margin: '20px 0 12px', fontWeight: 600, fontSize: 14 }}>Average Views</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {['reels', 'stories', 'posts'].map(type => (
                  <div key={type} className="form-group">
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{type}</label>
                    <input className="form-input" type="number" placeholder="0" value={kit?.avgViews?.[type] || ''} onChange={e => updateKit(`avgViews.${type}`, Number(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audience tab */}
          {activeTab === 'audience' && (
            <div>
              <h3 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Audience Demographics</h3>

              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Age Groups (%)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
                {AGE_GROUPS.map(age => (
                  <div key={age} className="form-group">
                    <label className="form-label" style={{ textAlign: 'center' }}>{age}</label>
                    <input className="form-input" type="number" min="0" max="100" placeholder="0" value={kit?.demographics?.ageGroups?.[age] || ''} onChange={e => updateKit(`demographics.ageGroups.${age}`, Number(e.target.value))} style={{ textAlign: 'center' }} />
                  </div>
                ))}
              </div>

              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Gender Split (%)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div className="form-group">
                  <label className="form-label">Female %</label>
                  <input className="form-input" type="number" placeholder="60" value={kit?.demographics?.genderSplit?.female || ''} onChange={e => updateKit('demographics.genderSplit.female', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Male %</label>
                  <input className="form-input" type="number" placeholder="40" value={kit?.demographics?.genderSplit?.male || ''} onChange={e => updateKit('demographics.genderSplit.male', Number(e.target.value))} />
                </div>
              </div>

              <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Top Locations</h4>
              {(kit?.demographics?.topLocations || []).map((loc, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                  <input className="form-input" placeholder="City (e.g. Mumbai)" value={loc.city || ''} onChange={e => {
                    const locs = [...(kit.demographics?.topLocations || [])];
                    locs[idx] = { ...locs[idx], city: e.target.value };
                    updateKit('demographics.topLocations', locs);
                  }} />
                  <input className="form-input" type="number" placeholder="%" style={{ width: 80 }} value={loc.percentage || ''} onChange={e => {
                    const locs = [...(kit.demographics?.topLocations || [])];
                    locs[idx] = { ...locs[idx], percentage: Number(e.target.value) };
                    updateKit('demographics.topLocations', locs);
                  }} />
                  <button onClick={() => updateKit('demographics.topLocations', (kit.demographics?.topLocations || []).filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)', fontSize: 18 }}>×</button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={() => updateKit('demographics.topLocations', [...(kit?.demographics?.topLocations || []), { city: '', percentage: 0 }])}>+ Add Location</button>
            </div>
          )}

          {/* Brands tab */}
          {activeTab === 'brands' && (
            <div>
              <h3 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Brands Worked With</h3>
              {(kit?.brandsWorkedWith || []).length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>Add brands you've collaborated with to boost credibility.</p>
              )}
              {(kit?.brandsWorkedWith || []).map((brand, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                  <div>
                    {idx === 0 && <label className="form-label">Brand Name</label>}
                    <input className="form-input" placeholder="e.g. Mamaearth" value={brand.name} onChange={e => updateBrand(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    {idx === 0 && <label className="form-label">Year</label>}
                    <input className="form-input" placeholder="2024" value={brand.year} onChange={e => updateBrand(idx, 'year', e.target.value)} />
                  </div>
                  <div>
                    {idx === 0 && <label className="form-label">Logo URL</label>}
                    <input className="form-input" placeholder="https://..." value={brand.logoUrl} onChange={e => updateBrand(idx, 'logoUrl', e.target.value)} />
                  </div>
                  <button onClick={() => removeBrand(idx)} style={{ background: 'none', border: '1px solid var(--coral)', borderRadius: 6, cursor: 'pointer', color: 'var(--coral)', padding: '8px 10px', marginBottom: idx === 0 ? 0 : 0 }}>×</button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addBrand}>+ Add Brand</button>
            </div>
          )}

          {/* Services tab */}
          {activeTab === 'services' && (
            <div>
              <h3 style={{ marginBottom: 8, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Services & Rates</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Show brands what you offer and your starting prices.</p>

              {(kit?.services || []).map((service, idx) => (
                <div key={idx} style={{ background: '#F8F9FF', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <strong style={{ fontSize: 14 }}>Service {idx + 1}</strong>
                    <button onClick={() => removeService(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)', fontSize: 16 }}>× Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">Service Name</label>
                      <input className="form-input" placeholder="e.g. Instagram Reel" value={service.name} onChange={e => updateService(idx, 'name', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">Starting Price (₹)</label>
                      <input className="form-input" type="number" placeholder="15000" value={service.price || ''} onChange={e => updateService(idx, 'price', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <input className="form-input" placeholder="60-sec reel with product feature, 3 revisions..." value={service.description} onChange={e => updateService(idx, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addService}>+ Add Service</button>
            </div>
          )}

          {/* Theme tab */}
          {activeTab === 'design' && (
            <div>
              <h3 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>PDF Theme</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => updateKit('theme', t.id)}
                    style={{
                      border: `2px solid ${kit?.theme === t.id ? 'var(--purple)' : 'var(--border)'}`,
                      borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.15s',
                      background: kit?.theme === t.id ? 'var(--purple-light)' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      {t.preview.map((color, i) => (
                        <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: color, border: '1px solid var(--border)' }} />
                      ))}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</div>
                    {kit?.theme === t.id && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--purple)', fontWeight: 600 }}>✓ Selected</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner spinner-dark" style={{ width: 14, height: 14 }} /> Saving...</> : '💾 Save Changes'}
            </button>
            <button className="btn btn-primary" onClick={handleDownload}>
              ⬇️ Download PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MediaKitPage;
