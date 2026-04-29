import React, { useState, useEffect } from 'react';
import { Users, Calendar, Star, Search, Info, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import './MyAffiliation.css';

const MyAffiliation = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [exploreOrganizations, setExploreOrganizations] = useState([]);

  // Mock Data for current affiliations
  const currentAffiliations = [
    {
      id: 1,
      orgName: 'Computer Science Society',
      role: 'Member',
      joinDate: 'Aug 2025',
      status: 'Active',
      description: 'The official organization for Computer Science students focusing on tech workshops and community building.',
      adviser: 'Prof. Alan Turing'
    }
  ];

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clubs-orgs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Map API data to component state
        const orgs = response.data.map(org => ({
          id: org._id,
          orgName: org.name,
          category: org.category,
          members: org.membersCount || 0,
          description: org.description,
          lookingForMembers: org.lookingForMembers,
          openPositions: org.openPositions
        }));
        setExploreOrganizations(orgs);
      } catch (error) {
        console.error('Error fetching clubs', error);
        // Fallback
        setExploreOrganizations([
          {
            id: 'temp1', orgName: 'Cybersecurity Guild', category: 'Academic', members: 45, 
            description: 'Dedicated to learning about ethical hacking, network security, and participating in CTF competitions.',
            lookingForMembers: false, openPositions: []
          }
        ]);
      }
    };

    fetchClubs();
  }, []);

  const filteredExplore = exploreOrganizations.filter(org =>
    org.orgName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    org.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="my-affiliation-container">
      <div className="affiliation-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Users size={32} color="var(--primary-color)" />
          <h1 style={{ margin: 0 }}>My Affiliations</h1>
        </div>
        <p>Manage your organization memberships and discover new communities.</p>
      </div>

      <div className="affiliation-tabs">
        <button 
          className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          <CheckCircle className="tab-icon" size={18} /> Current Memberships
        </button>
        <button 
          className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          <Search className="tab-icon" size={18} /> Explore Organizations
        </button>
      </div>

      <div className="affiliation-content">
        {activeTab === 'current' && (
          <div className="tab-pane fade-in">
            <h2>Your Active Organizations</h2>
            {currentAffiliations.length > 0 ? (
              <div className="org-cards-grid">
                {currentAffiliations.map(org => (
                  <div className="org-card current-org" key={org.id}>
                    <div className="org-card-header">
                      <h3>{org.orgName}</h3>
                      <span className={`status-badge ${org.status.toLowerCase()}`}>{org.status}</span>
                    </div>
                    <div className="org-card-body">
                      <p className="org-desc">{org.description}</p>
                      <div className="org-details">
                        <div className="detail-item">
                          <Star className="detail-icon" size={16} />
                          <span><strong>Role:</strong> {org.role}</span>
                        </div>
                        <div className="detail-item">
                          <Calendar className="detail-icon" size={16} />
                          <span><strong>Joined:</strong> {org.joinDate}</span>
                        </div>
                        <div className="detail-item">
                          <Users className="detail-icon" size={16} />
                          <span><strong>Adviser:</strong> {org.adviser}</span>
                        </div>
                      </div>
                    </div>
                    <div className="org-card-footer">
                      <button className="btn-secondary">View Announcements</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Info className="empty-icon" size={40} />
                <p>You are not currently affiliated with any organizations.</p>
                <button className="btn-primary" onClick={() => setActiveTab('explore')}>Find an Organization</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="tab-pane fade-in">
            <div className="explore-header">
              <h2>Discover Communities</h2>
              <div className="search-bar">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="org-cards-grid">
              {filteredExplore.map(org => (
                <div className="org-card explore-org" key={org.id}>
                  <div className="org-card-header">
                    <h3>{org.orgName}</h3>
                    <span className="category-badge">{org.category}</span>
                  </div>
                  <div className="org-card-body">
                    <p className="org-desc">{org.description}</p>
                    <div className="detail-item" style={{ marginBottom: '12px' }}>
                      <Users className="detail-icon" size={16} />
                      <span>{org.members} Members</span>
                    </div>

                    {org.lookingForMembers && (
                      <div className="hiring-banner" style={{ 
                        marginTop: '12px', 
                        padding: '8px 12px', 
                        backgroundColor: 'var(--success-color-light, rgba(34, 197, 94, 0.1))',
                        borderLeft: '3px solid var(--success-color, #22c55e)',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        <strong style={{ color: 'var(--success-color, #22c55e)', display: 'block', marginBottom: '4px' }}>Now Hiring / Looking For:</strong>
                        <span style={{ color: 'var(--text-color)' }}>
                          {org.openPositions?.length > 0 ? org.openPositions.join(', ') : 'Members'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="org-card-footer">
                    <button className="btn-primary">Apply to Join</button>
                  </div>
                </div>
              ))}
              {filteredExplore.length === 0 && (
                <div className="empty-state">
                  <p>No organizations found matching "{searchTerm}".</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAffiliation;
