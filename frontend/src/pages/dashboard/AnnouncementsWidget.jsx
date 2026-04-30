import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';
import './AnnouncementsWidget.css';

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
        <div className="announcements-list">
          {announcements.map((ann) => (
            <div key={ann._id || ann.id} className="announcement-card">
              <div className="announcement-header">
                <h4 className="announcement-title">{ann.title}</h4>
                <div className="announcement-meta">
                  <Calendar size={14} />
                  <span>{new Date(ann.postedAt || ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="meta-separator">•</span>
                  <span className="announcement-author">
                    by {ann.author?.firstName || ann.author?.name || 'Unknown'} {ann.author?.firstName ? ann.author?.lastName : ''}
                  </span>
                </div>
              </div>
              
              {ann.image && (
                <div className="announcement-image-container">
                  <img 
                    src={`http://localhost:5000${ann.image}`} 
                    alt="Announcement" 
                    className="announcement-image"
                  />
                </div>
              )}

              <p className="announcement-content">
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