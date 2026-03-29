import React from 'react';
import { Flag } from 'lucide-react';

const ClubsOrgsManagement = () => {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Flag size={32} color="var(--primary-color)" />
        <h1 style={{ margin: 0 }}>Clubs & Orgs Management</h1>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Manage student organizations, clubs, memberships, and organizational roles.</p>

      <div style={{ 
        marginTop: '32px', 
        padding: '48px', 
        backgroundColor: 'var(--bg-surface)', 
        borderRadius: '12px',
        border: '1px dashed var(--border-color)',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Coming Soon</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>The student organizations, clubs, and affiliation management module is currently under development.</p>
      </div>
    </div>
  );
};

export default ClubsOrgsManagement;