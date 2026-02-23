import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { creator } = useAuth();
  const navigate = useNavigate();
  const [inquiryStats, setInquiryStats] = useState(null);
  const [affiliateStats, setAffiliateStats] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inqRes, affRes] = await Promise.all([
          axios.get('/api/brand-inquiry?limit=5'),
          axios.get('/api/affiliate/dashboard')
        ]);
        setRecentInquiries(inqRes.data.inquiries || []);
        setInquiryStats(inqRes.data.stats || []);
        setAffiliateStats(affRes.data.stats);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalInquiries = inquiryStats?.reduce((s, i) => s + i.count, 0) || 0;
  const totalDealValue = inquiryStats?.reduce((s, i) => s + i.totalValue, 0) || 0;
  const acceptedDeals = inquiryStats?.find(i => i._id === 'Accepted')?.count || 0;

  const getStatusClass = (status) => {
    const map = { New: 'new', Reviewing: 'reviewing', Negotiating: 'negotiating', Accepted: 'accepted', Closed: 'closed', Rejected: 'rejected' };
    return `badge badge-${map[status] || 'new'}`;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {/* Welcome banner */}
        <div className="gradient-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4, color: 'white' }}>
              Good day, {creator?.name?.split(' ')[0]}! 👋
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Your collab link: <strong>creatorhub.app/collab/{creator?.username}</strong>
            </p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/collab/${creator?.username}`)}
            style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
            }}
          >
            📋 Copy Link
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#EEF0FF' }}>📬</div>
            <div className="stat-value">{totalInquiries}</div>
            <div className="stat-label">Total Inquiries</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ECFDF5' }}>✅</div>
            <div className="stat-value">{acceptedDeals}</div>
            <div className="stat-label">Accepted Deals</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF8E6' }}>💰</div>
            <div className="stat-value" style={{ fontSize: 22 }}>₹{(totalDealValue / 1000).toFixed(1)}K</div>
            <div className="stat-label">Revenue Tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF0F0' }}>🔗</div>
            <div className="stat-value">{affiliateStats?.totalClicks?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Link Clicks</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F0FDF4' }}>📈</div>
            <div className="stat-value">{affiliateStats?.recentClicks || 0}</div>
            <div className="stat-label">Clicks (7 days)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FDF4FF' }}>🔗</div>
            <div className="stat-value">{affiliateStats?.totalLinks || 0}</div>
            <div className="stat-label">Active Links</div>
          </div>
        </div>

        {/* Quick actions + Recent inquiries */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          {/* Quick actions */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
            {[
              { icon: '📬', label: 'View All Inquiries', path: '/dashboard/inquiries', color: '#EEF0FF' },
              { icon: '🔗', label: 'Create Affiliate Link', path: '/dashboard/affiliate', color: '#ECFDF5' },
              { icon: '📄', label: 'Edit Media Kit', path: '/dashboard/media-kit', color: '#FFF8E6' },
              { icon: '👁️', label: 'View Public Page', path: `/collab/${creator?.username}`, external: true, color: '#F0FDEF' },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => a.external ? window.open(a.path, '_blank') : navigate(a.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 14px', cursor: 'pointer', marginBottom: 8,
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: 'var(--text)',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = a.color}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

          {/* Recent inquiries */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Brand Inquiries</span>
              <button className="btn btn-sm btn-outline" onClick={() => navigate('/dashboard/inquiries')}>View All</button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading...</div>
            ) : recentInquiries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No inquiries yet</h3>
                <p>Share your collab link to start receiving brand deals</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Budget</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.map(inq => (
                      <tr key={inq._id}>
                        <td><strong>{inq.brandName}</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{inq.email}</span></td>
                        <td style={{ color: 'var(--purple)', fontWeight: 600, fontSize: 12 }}>{inq.budgetRange}</td>
                        <td>{inq.campaignType.map(t => <span key={t} className="tag">{t}</span>)}</td>
                        <td><span className={getStatusClass(inq.status)}>{inq.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(inq.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
