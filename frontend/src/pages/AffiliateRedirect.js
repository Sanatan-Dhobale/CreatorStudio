import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// The backend API base — in dev it's port 5000, in production same domain
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AffiliateRedirect = () => {
  const { slug } = useParams();

  useEffect(() => {
    // Immediately redirect to the backend /p/:slug route
    // which handles click tracking and then redirects to the original URL
    window.location.href = `${API_BASE}/p/${slug}`;
  }, [slug]);

  // Show a brief loading state while redirecting
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      background: '#FAFAFA',
      gap: 16
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '3px solid #6C63FF',
        borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#6B7280', fontSize: 14 }}>Redirecting you...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AffiliateRedirect;
