import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PLATFORMS = ['Amazon', 'Flipkart', 'Meesho', 'Myntra', 'Ajio', 'Nykaa', 'Custom', 'Other'];

const AffiliatePage = () => {
  const { creator } = useAuth();
  const [links, setLinks] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  // collapse rows on mobile
  const [openRows, setOpenRows] = useState(new Set());
  const toggleRow = id => {
    setOpenRows(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const [form, setForm] = useState({
    title: '', originalUrl: '', slug: '', platform: 'Amazon',
    category: 'General', utmSource: '', utmMedium: '', utmCampaign: '',
    openInApp: false
  });
  const [creating, setCreating] = useState(false);

  const fetchLinks = async () => {
    try {
      const [linksRes, dashRes] = await Promise.all([
        axios.get('/api/affiliate/links'),
        axios.get('/api/affiliate/dashboard')
      ]);
      setLinks(linksRes.data.links);
      setDashStats(dashRes.data.stats);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const fetchAnalytics = async (linkId) => {
    try {
      const res = await axios.get(`/api/affiliate/links/${linkId}/analytics?days=30`);
      setAnalytics(res.data);
    } catch { }
  };

  const handleCreate = async () => {
    if (!form.title || !form.originalUrl) {
      toast.error('Title and URL are required');
      return;
    }
    setCreating(true);
    try {
      const slug = form.slug || `${creator.username}-${form.title.toLowerCase().replace(/\s+/g, '-').substring(0, 12)}`;
      await axios.post('/api/affiliate/links', { ...form, slug });
      toast.success('Link created! 🔗');
      setShowCreate(false);
      setForm({ title: '', originalUrl: '', slug: '', platform: 'Amazon', category: 'General', utmSource: '', utmMedium: '', utmCampaign: '', openInApp: false });
      fetchLinks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create link');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link? This will also delete all click analytics.')) return;
    try {
      await axios.delete(`/api/affiliate/links/${id}`);
      toast.success('Link deleted');
      setSelectedLink(null);
      setAnalytics(null);
      fetchLinks();
    } catch { toast.error('Delete failed'); }
  };

  const handleRevenueUpdate = async (id, revenue) => {
    try {
      await axios.put(`/api/affiliate/links/${id}`, { revenueManual: Number(revenue) });
      toast.success('Revenue updated');
      fetchLinks();
    } catch { }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    toast.success('Link copied! 📋');
  };

  const platformColors = {
    Amazon: '#FF9900', Flipkart: '#2874F0', Meesho: '#9B26AF',
    Myntra: '#FF3F6C', Ajio: '#E8472D', Nykaa: '#FC2779', Custom: '#6C63FF', Other: '#6B7280'
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header page-header-flex">
          <div>
            <h1>Affiliate Link Tracker</h1>
            <p>Create trackable short links and monitor performance</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New Link
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid affiliate-stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#EEF0FF' }}>🔗</div>
            <div className="stat-value">{dashStats?.totalLinks || 0}</div>
            <div className="stat-label">Total Links</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF0F0' }}>👆</div>
            <div className="stat-value">{(dashStats?.totalClicks || 0).toLocaleString()}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ECFDF5' }}>📈</div>
            <div className="stat-value">{(dashStats?.recentClicks || 0).toLocaleString()}</div>
            <div className="stat-label">Clicks (7 days)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF8E6' }}>💰</div>
            <div className="stat-value" style={{ fontSize: 22 }}>₹{((dashStats?.totalRevenue || 0) / 1000).toFixed(1)}K</div>
            <div className="stat-label">Revenue Logged</div>
          </div>
        </div>

        <div className={`dashboard-grid ${selectedLink ? 'dashboard-grid-with-panel-lg' : ''}`}>
          {/* Links table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">Your Links</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{links.length} links</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading...</div>
            ) : links.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔗</div>
                <h3>No links yet</h3>
                <p>Create your first trackable affiliate link</p>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Link</button>
              </div>
            ) : (
              <div className="table-wrapper affiliate-table-wrapper">
                <table className="affiliate-table">
                  <thead>
                    <tr>
                      <th>Link</th>
                      <th className="hide-mobile">Platform</th>
                      <th className="hide-mobile">Short URL</th>
                      <th className="hide-mobile">Total Clicks</th>
                      <th className="hide-mobile">7-Day Clicks</th>
                      <th className="hide-mobile">Revenue (₹)</th>
                      <th className="hide-mobile">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map(link => (
                      <tr
                        key={link._id}
                        className={openRows.has(link._id) ? 'expanded' : ''}
                        style={{ cursor: 'pointer', background: selectedLink?._id === link._id ? '#F8F9FF' : 'white' }}
                        onClick={() => { setSelectedLink(link); fetchAnalytics(link._id); toggleRow(link._id); }}
                      >
                        <td className="link-cell">
                          <strong style={{ fontSize: 13 }}>{link.title}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {link.originalUrl}
                          </div>
                        </td>
                        <td className="platform-cell hide-mobile">
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: platformColors[link.platform] || '#6B7280',
                            background: `${platformColors[link.platform]}15`,
                            padding: '2px 8px', borderRadius: 4
                          }}>{link.platform}</span>
                          {link.openInApp && (
                            <span title="Open in App enabled" style={{
                              display: 'inline-block', marginLeft: 4, fontSize: 10, fontWeight: 700,
                              background: '#ECFDF5', color: '#059669', padding: '2px 6px',
                              borderRadius: 4, verticalAlign: 'middle'
                            }}>📱 APP</span>
                          )}
                        </td>
                        <td className="shorturl-cell hide-mobile">
                          <code style={{ fontSize: 11, background: '#F3F4F6', padding: '3px 8px', borderRadius: 4, color: '#6C63FF' }}>
                            /p/{link.slug}
                          </code>
                        </td>
                        <td className="hide-mobile"><strong>{link.totalClicks.toLocaleString()}</strong></td>
                        <td className="hide-mobile">
                          <span style={{ color: link.recentClicks > 0 ? '#059669' : 'var(--text-muted)', fontWeight: link.recentClicks > 0 ? 600 : 400 }}>
                            {link.recentClicks}
                          </span>
                        </td>
                        <td className="hide-mobile" onClick={e => e.stopPropagation()}>
                          <input
                            type="number"
                            defaultValue={link.revenueManual || ''}
                            placeholder="0"
                            style={{ width: 80, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, fontFamily: 'inherit' }}
                            onBlur={e => handleRevenueUpdate(link._id, e.target.value)}
                          />
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-sm btn-outline" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => copyLink(link.slug)}>Copy</button>
                            <button className="btn btn-sm btn-danger" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleDelete(link._id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Analytics sidebar */}
          {selectedLink && (
            <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 20, maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Analytics</h3>
                <button onClick={() => { setSelectedLink(null); setAnalytics(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
              </div>

              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedLink.title}</div>
              <code style={{ fontSize: 11, color: 'var(--purple)', background: 'var(--purple-light)', padding: '3px 8px', borderRadius: 4 }}>
                {window.location.origin}/p/{selectedLink.slug}
              </code>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                {[
                  { label: 'Total Clicks', value: selectedLink.totalClicks.toLocaleString(), color: '#EEF0FF' },
                  { label: 'Revenue', value: `₹${(selectedLink.revenueManual || 0).toLocaleString()}`, color: '#FFF8E6' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.color, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {analytics && (
                <>
                  {/* Device breakdown */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>Device Breakdown</div>
                    {analytics.analytics.deviceBreakdown.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No data yet</p>
                    ) : (
                      analytics.analytics.deviceBreakdown.map(d => {
                        const total = analytics.analytics.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                        const pct = Math.round((d.count / total) * 100);
                        const icons = { mobile: '📱', desktop: '🖥️', tablet: '📟' };
                        return (
                          <div key={d._id} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                              <span>{icons[d._id] || '❓'} {d._id}</span>
                              <span style={{ fontWeight: 600 }}>{pct}%</span>
                            </div>
                            <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--purple)', borderRadius: 2 }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Hourly heatmap */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>
                      Hourly Click Heatmap
                    </div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {Array.from({ length: 24 }, (_, h) => {
                        const data = analytics.analytics.hourlyHeatmap.find(x => x._id === h);
                        const count = data?.count || 0;
                        const maxCount = Math.max(...analytics.analytics.hourlyHeatmap.map(x => x.count), 1);
                        const intensity = count / maxCount;
                        return (
                          <div
                            key={h}
                            title={`${h}:00 — ${count} clicks`}
                            style={{
                              width: 22, height: 22, borderRadius: 4, cursor: 'help',
                              background: count > 0 ? `rgba(108, 99, 255, ${0.15 + intensity * 0.85})` : '#F3F4F6',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 8, color: intensity > 0.5 ? 'white' : 'var(--text-muted)'
                            }}
                          >
                            {h}
                          </div>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Hover for click count per hour</p>
                  </div>

                  {/* Top countries */}
                  {analytics.analytics.countryBreakdown.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>Top Countries</div>
                      {analytics.analytics.countryBreakdown.slice(0, 5).map(c => (
                        <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #F3F4F6' }}>
                          <span>🌍 {c._id}</span>
                          <span style={{ fontWeight: 600 }}>{c.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* App Open Analytics */}
              {selectedLink.openInApp && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>
                    📱 App Open Analytics
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#ECFDF5', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>{selectedLink.appOpenCount || 0}</div>
                      <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Opened in App</div>
                    </div>
                    <div style={{ background: '#FFF8E6', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>{selectedLink.fallbackOpenCount || 0}</div>
                      <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>Browser Fallback</div>
                    </div>
                  </div>
                  {(selectedLink.appOpenCount + selectedLink.fallbackOpenCount) > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                      App success rate:{' '}
                      <strong style={{ color: '#059669' }}>
                        {Math.round((selectedLink.appOpenCount / (selectedLink.appOpenCount + selectedLink.fallbackOpenCount)) * 100)}%
                      </strong>
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }} onClick={() => copyLink(selectedLink.slug)}>
                📋 Copy Short Link
              </button>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Create Affiliate Link</h3>
                <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
              </div>

              <div className="form-group">
                <label className="form-label">Link Title *</label>
                <input className="form-input" placeholder="e.g. Mamaearth Vitamin C Serum" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Original URL *</label>
                <input className="form-input" type="url" placeholder="https://amazon.in/product/..." value={form.originalUrl} onChange={e => setForm({ ...form, originalUrl: e.target.value })} />
              </div>

              <div className="affiliate-modal-grid">
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-select" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Slug (optional)</label>
                  <input className="form-input" placeholder="e.g. skin-serum" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })} />
                </div>
              </div>

              <details style={{ marginBottom: 16 }}>
                <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--purple)', fontWeight: 600 }}>
                  + UTM Parameters (Advanced)
                </summary>
                <div className="utm-grid" style={{ marginTop: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>utm_source</label>
                    <input className="form-input" style={{ padding: '6px 10px', fontSize: 12 }} placeholder="instagram" value={form.utmSource} onChange={e => setForm({ ...form, utmSource: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>utm_medium</label>
                    <input className="form-input" style={{ padding: '6px 10px', fontSize: 12 }} placeholder="bio" value={form.utmMedium} onChange={e => setForm({ ...form, utmMedium: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>utm_campaign</label>
                    <input className="form-input" style={{ padding: '6px 10px', fontSize: 12 }} placeholder="collab" value={form.utmCampaign} onChange={e => setForm({ ...form, utmCampaign: e.target.value })} />
                  </div>
                </div>
              </details>

              {/* Open in App Toggle */}
              <div style={{
                background: form.openInApp ? '#ECFDF5' : '#F9FAFB',
                border: `1.5px solid ${form.openInApp ? '#A7F3D0' : '#E5E7EB'}`,
                borderRadius: 10, padding: '14px 16px', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                cursor: 'pointer', transition: 'all 0.15s'
              }} onClick={() => setForm({ ...form, openInApp: !form.openInApp })}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    📱 Open in App
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Auto-detect YouTube, Instagram, Spotify etc. and open in native app instead of Instagram browser
                  </div>
                  {form.openInApp && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#059669', fontWeight: 500 }}>
                      ✓ Will auto-detect platform and attempt native app redirect
                    </div>
                  )}
                </div>
                <div style={{
                  width: 42, height: 24, borderRadius: 12, flexShrink: 0, marginLeft: 12,
                  background: form.openInApp ? '#059669' : '#D1D5DB',
                  position: 'relative', transition: 'background 0.2s'
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: form.openInApp ? 21 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s'
                  }} />
                </div>
              </div>

              {form.slug && (
                <div style={{ background: '#F0F4FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#4C1D95' }}>
                  Short URL: <strong>{window.location.origin}/p/{form.slug || `${creator.username}-...`}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                  {creating ? <span className="spinner" /> : 'Create Link'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AffiliatePage;
