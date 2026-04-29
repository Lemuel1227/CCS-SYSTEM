import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Flag, Users, LayoutGrid, CheckCircle2, UserPlus, FileText, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './ClubsOrgsManagement.css';

const DEFAULT_CLUBS = [
  { _id: '1', name: 'Computer Science Society', description: 'The official organization for Computer Science students.', adviser: 'Prof. Alan Turing', category: 'Academic', lookingForMembers: true, openPositions: ['Member', 'Secretary'], membersCount: 150 }
];

const ClubsOrgsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClubId, setCurrentClubId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adviser: '',
    category: 'General',
    lookingForMembers: false,
    openPositions: '',
    membersCount: 0
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/clubs-orgs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs', error);
      setClubs(DEFAULT_CLUBS);
      showToast('Could not connect to server, showing default data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      description: '',
      adviser: '',
      category: 'General',
      lookingForMembers: false,
      openPositions: '',
      membersCount: 0
    });
    setShowModal(true);
  };

  const openEditModal = (club) => {
    setIsEditMode(true);
    setCurrentClubId(club._id);
    setFormData({
      name: club.name || '',
      description: club.description || '',
      adviser: club.adviser || '',
      category: club.category || 'General',
      lookingForMembers: club.lookingForMembers || false,
      openPositions: club.openPositions ? club.openPositions.join(', ') : '',
      membersCount: club.membersCount || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const submitData = {
      ...formData,
      openPositions: typeof formData.openPositions === 'string' ? formData.openPositions.split(',').map(pos => pos.trim()).filter(Boolean) : []
    };

    try {
      if (isEditMode) {
        const res = await axios.put(`http://localhost:5000/api/clubs-orgs/${currentClubId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClubs(clubs.map(c => c._id === currentClubId ? res.data : c));
        showToast('Organization updated successfully!');
      } else {
        const res = await axios.post('http://localhost:5000/api/clubs-orgs', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClubs([...clubs, res.data]);
        showToast('Organization created successfully!');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving club', error);
      showToast('Failed to save. Ensure unique names and proper credentials.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      if (id.length > 5) {
        await axios.delete(`http://localhost:5000/api/clubs-orgs/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setClubs(clubs.filter(c => c._id !== id));
      showToast('Organization deleted successfully!');
    } catch (error) {
      console.error('Error deleting', error);
      showToast('Failed to delete organization.', 'error');
    }
  };

  const processedClubs = clubs
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'members-desc') return (b.membersCount || 0) - (a.membersCount || 0);
      if (sortBy === 'members-asc') return (a.membersCount || 0) - (b.membersCount || 0);
      return 0;
    });

  return (
    <div className="clubs-management-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="admin-header-section">
        <div className="admin-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Flag size={28} color="var(--primary-color)" />
            <h2>Organizations</h2>
          </div>
          <p>Manage student communities and oversee their hiring activities</p>
        </div>
        <div className="admin-header-actions">
          <button className="add-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add Organization
          </button>
        </div>
      </div>

      <div className="admin-controls">
        <div className="admin-search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            className="admin-search-input"
            placeholder="Search organizations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin-filters">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="admin-filter-select">
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Technical">Technical</option>
            <option value="Sports">Sports</option>
            <option value="Arts">Arts</option>
            <option value="General">General</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-filter-select">
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="members-desc">Most Members</option>
            <option value="members-asc">Least Members</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={40} className="spinner" />
          <p>Loading organizations...</p>
        </div>
      ) : (
        <div className="orgs-grid">
          {processedClubs.map(club => (
            <div className="org-card management-org" key={club._id}>
              <div className="org-card-header">
                <h3>{club.name}</h3>
                <span className={`category-badge`}>{club.category}</span>
              </div>

              <div className="org-card-body">
                <p className="org-desc">
                  {club.description.length > 120 ? `${club.description.substring(0, 120)}...` : club.description}
                </p>
                
                <div className="org-details">
                  <div className="detail-item">
                    <Users className="detail-icon" size={16} />
                    <span>{club.membersCount || 0} Members</span>
                  </div>
                  <div className="detail-item">
                    <UserPlus className="detail-icon" size={16} />
                    <span>{club.adviser || 'No Adviser'}</span>
                  </div>
                </div>

                {club.lookingForMembers && (
                  <div className="hiring-banner">
                    <strong>Now Hiring / Looking For:</strong>
                    <span>
                      {club.openPositions?.length > 0 ? club.openPositions.join(', ') : 'Members'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="org-card-footer management-actions">
                <button className="btn-secondary" onClick={() => openEditModal(club)}>
                  <Edit2 size={16} /> Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(club._id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
          
          {processedClubs.length === 0 && (
            <div className="empty-state">
              <LayoutGrid className="empty-icon" size={48} />
              <h3>No Organizations Found</h3>
              <p>Could not find any clubs matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Organization' : 'Create Organization'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Organization Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Computer Science Society" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Academic">Academic</option>
                    <option value="Technical">Technical</option>
                    <option value="Sports">Sports</option>
                    <option value="Arts">Arts</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Adviser</label>
                  <input type="text" name="adviser" value={formData.adviser} onChange={handleInputChange} placeholder="e.g. Prof. Alan Turing" />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea required name="description" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Describe the organization's purpose..."></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Members</label>
                  <input type="number" name="membersCount" value={formData.membersCount} onChange={handleInputChange} min="0" />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div className="compact-checkbox">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="lookingForMembers" 
                        checked={formData.lookingForMembers} 
                        onChange={handleInputChange} 
                      />
                      <strong>Actively recruiting members</strong>
                    </label>
                  </div>
                </div>
              </div>

              {formData.lookingForMembers && (
                <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label>Open Positions <span style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>(comma-separated)</span></label>
                  <input 
                    type="text" 
                    name="openPositions" 
                    placeholder="e.g. Member, IT Representative, Secretary" 
                    value={formData.openPositions} 
                    onChange={handleInputChange} 
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">{isEditMode ? 'Save Changes' : 'Create Organization'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsOrgsManagement;