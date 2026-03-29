import React from 'react';
import { Megaphone } from 'lucide-react';

const AnnouncementManagement = () => {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Megaphone size={32} color="var(--primary-color)" />
        <h1 style={{ margin: 0 }}>Announcement Management</h1>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Manage system-wide and departmental announcements, news, and notifications.</p>
      
      <div style={{ 
        marginTop: '32px', 
        padding: '48px', 
        backgroundColor: 'var(--bg-surface)', 
        borderRadius: '12px',
        border: '1px dashed var(--border-color)',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Coming Soon</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>The announcement broadcast and management module is under development.</p>
      </div>
    </div>
  );
};

export default AnnouncementManagement;