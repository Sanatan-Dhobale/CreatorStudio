import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['New', 'Reviewing', 'Negotiating', 'Accepted', 'Rejected', 'Closed'];

const getStatusClass = (s) => {
  const map = { New: 'new', Reviewing: 'reviewing', Negotiating: 'negotiating', Accepted: 'accepted', Closed: 'closed', Rejected: 'rejected' };
  return `badge badge-${map[s] || 'new'}`;
};

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [openRows, setOpenRows] = useState(new Set());
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState([]);

  const toggleRow = (id) => {
    setOpenRows(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }
  const fetchInquiries = async (status = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/brand-inquiry${status ? `?status=${status}` : ''}`);
      setInquiries(res.data.inquiries);
      setTotal(res.data.total);
      setStats(res.data.stats || []);
    } catch { toast.error('Failed to load inquiries'); }
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(filter); }, [filter]);

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`/api/brand-inquiry/${editData._id}`, {
        status: editData.status,
        notes: editData.notes,
        dealValue: Number(editData.dealValue)
      });
      toast.success('Inquiry updated successfully');
      setEditModal(false);
      fetchInquiries(filter);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await axios.delete(`/api/brand-inquiry/${id}`);
      toast.success('Inquiry deleted');
      setSelected(null);
      fetchInquiries(filter);
    } catch { toast.error('Delete failed'); }
  };

  const handleExport = () => {
    window.open('/api/brand-inquiry/export/csv', '_blank');
  };

  const totalRevenue = stats.reduce((s, i) => s + i.totalValue, 0);
  const newCount = stats.find(i => i._id === 'New')?.count || 0;
  const acceptedCount = stats.find(i => i._id === 'Accepted')?.count || 0;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header page-header-flex">
          <div>
            <h1>Brand Inquiries</h1>
            <p>Manage all your brand collaboration requests</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>
            ⬇️ Export CSV
          </button>
        </div>

        {/* Mini stats */}
        <div className="stats-grid inquiries-stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total', value: total, icon: '📬', color: '#EEF0FF' },
            { label: 'New', value: newCount, icon: '🆕', color: '#EEF0FF' },
            { label: 'Accepted', value: acceptedCount, icon: '✅', color: '#ECFDF5' },
            { label: 'Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}K`, icon: '💰', color: '#FFF8E6' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 16 }}>
              <div className="stat-icon" style={{ background: s.color, width: 32, height: 32, fontSize: 16 }}>{s.icon}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="inquiries-filter-tabs">
          {['', ...STATUS_OPTIONS].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 16px', borderRadius: 20, border: '1.5px solid',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                borderColor: filter === s ? 'var(--purple)' : 'var(--border)',
                background: filter === s ? 'var(--purple)' : 'white',
                color: filter === s ? 'white' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className={`dashboard-grid ${selected ? 'dashboard-grid-with-panel' : ''}`}>
          {/* Table */}
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                <div className="spinner spinner-dark" style={{ margin: '0 auto 12px' }} />
                <p>Loading inquiries...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No inquiries found</h3>
                <p>Brand inquiries will appear here when brands submit your form.</p>
              </div>
            ) : (
              <div className="inquiries-table-wrapper">
                <table className="inquiries-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th className="hide-mobile">Contact</th>
                      <th className="hide-mobile">Budget</th>
                      <th className="hide-mobile">Campaign</th>
                      <th>Status</th>
                      <th className="hide-mobile">Deal Value</th>
                      <th className="hide-mobile">Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map(inq => (
                      <tr
                        key={inq._id}
                        className={openRows.has(inq._id) ? 'expanded' : ''}
                        style={{ cursor: 'pointer', background: selected?._id === inq._id ? '#F8F9FF' : 'white' }}
                        onClick={() => { toggleRow(inq._id); setSelected(inq); }}
                      >
                        <td className="brand-cell">
                          <strong style={{ fontSize: 14 }}>{inq.brandName}</strong>
                          {inq.category && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inq.category}</div>}
                        </td>
                        <td className="contact-cell hide-mobile">
                          <div style={{ fontSize: 13 }}>{inq.contactPerson}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inq.email}</div>
                        </td>
                        <td className="hide-mobile"><span style={{ color: 'var(--purple)', fontWeight: 600, fontSize: 12 }}>{inq.budgetRange}</span></td>
                        <td className="campaign-cell hide-mobile">{inq.campaignType.map(t => <span key={t} className="tag">{t}</span>)}</td>
                        <td><span className={getStatusClass(inq.status)}>{inq.status}</span></td>
                        <td className="hide-mobile">{inq.dealValue > 0 ? <span style={{ color: '#059669', fontWeight: 600 }}>₹{inq.dealValue.toLocaleString()}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(inq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                        <td className="actions-cell" onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => { setEditData({ ...inq }); setEditModal(true); }}
                          >Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card inquiries-detail-panel" style={{ position: 'sticky', top: 20, height: 'fit-content', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>{selected.brandName}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}>×</button>
              </div>

              <span className={getStatusClass(selected.status)} style={{ marginBottom: 16, display: 'inline-block' }}>{selected.status}</span>

              {[
                ['Contact Person', selected.contactPerson],
                ['Email', selected.email],
                ['Phone', selected.phone || 'Not provided'],
                ['Budget', selected.budgetRange],
                ['Campaign Type', selected.campaignType.join(', ')],
                ['Timeline', selected.timeline],
                ['Category', selected.category],
                ['Deal Value', selected.dealValue > 0 ? `₹${selected.dealValue.toLocaleString()}` : 'Not set'],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Message</div>
                <div style={{ fontSize: 13, background: '#F8F9FF', padding: '10px 12px', borderRadius: 8, lineHeight: 1.6 }}>{selected.message}</div>
              </div>

              {selected.notes && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Your Notes</div>
                  <div style={{ fontSize: 13, background: '#FFFBF0', padding: '10px 12px', borderRadius: 8, lineHeight: 1.6 }}>{selected.notes}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditData({ ...selected }); setEditModal(true); }}>
                  ✏️ Update
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editModal && (
          <div className="modal-overlay" onClick={() => setEditModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Update Inquiry — {editData.brandName}</h3>
                <button className="modal-close" onClick={() => setEditModal(false)}>×</button>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Deal Value (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 25000" value={editData.dealValue || ''} onChange={e => setEditData({ ...editData, dealValue: e.target.value })} />
                <p className="form-hint">Enter the agreed deal amount for revenue tracking</p>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Notes</label>
                <textarea className="form-textarea" placeholder="Add notes visible only to you..." value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleStatusUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InquiriesPage;
