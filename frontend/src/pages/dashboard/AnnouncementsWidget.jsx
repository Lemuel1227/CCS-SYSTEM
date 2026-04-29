import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css'; // Or inline styles

const AnnouncementsWidget = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Fetch only posted announcements for the dashboard
      const response = await axios.get('/api/announcements?status=Posted');
      setAnnouncements(response.data.slice(0, 5)); // show latest 5
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-card">
        <h2><Megaphone size={20} /> Latest Announcements</h2>
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading announcements...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2><Megaphone size={20} /> Latest Announcements</h2>
      {announcements.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Megaphone size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
          <p>No recent announcements</p>
        </div>
      ) : (
        <div className="list-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {announcements.map((ann) => (
            <div 
              key={ann._id || ann.id} 
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              className="announcement-widget-item"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>{ann.title}</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                <Calendar size={14} />
                {new Date(ann.postedAt || ann.createdAt).toLocaleDateString()} 
                <span style={{ margin: '0 4px' }}>•</span>
                by {ann.author?.firstName || ann.author?.name || 'Unknown'} {ann.author?.firstName ? ann.author?.lastName : ''}
              </div>
              
              {ann.image && (
                <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px' }}>
                  <img 
                    src={`http://localhost:5000${ann.image}`} 
                    alt="Announcement" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                  />
                </div>
              )}

              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsWidget;