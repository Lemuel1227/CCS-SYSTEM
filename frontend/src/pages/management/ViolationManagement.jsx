import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, AlertTriangle, FileText, CheckCircle, Clock } from 'lucide-react';
import './ViolationManagement.css';

// Mock Data
const initialViolations = [
  {
    id: 'V-2023-001',
    offenderId: '2021-00123',
    name: 'John Doe',
    role: 'Student',
    violationType: 'Minor',
    description: 'Improper wearing of uniform during classes.',
    dateOfIncident: '2023-10-15',
    status: 'Resolved',
    disciplinaryAction: 'Verbal Warning'
  },
  {
    id: 'V-2023-002',
    offenderId: 'EMP-0502',
    name: 'Jane Smith',
    role: 'Faculty',
    violationType: 'Major',
    description: 'Unexcused absence for three consecutive days.',
    dateOfIncident: '2023-10-18',
    status: 'Pending',
    disciplinaryAction: 'Awaiting Hearing'
  },
  {
    id: 'V-2023-003',
    offenderId: '2020-04561',
    name: 'Michael Johnson',
    role: 'Student',
    violationType: 'Grave',
    description: 'Academic dishonesty during final examinations.',
    dateOfIncident: '2023-11-05',
    status: 'Appealed',
    disciplinaryAction: '1 Semester Suspension'
  }
];

const ViolationManagement = () => {
  const [violations, setViolations] = useState(initialViolations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [formData, setFormData] = useState({
    id: '', offenderId: '', name: '', role: 'Student', 
    violationType: 'Minor', description: '', dateOfIncident: '', 
    status: 'Pending', disciplinaryAction: ''
  });

  // Filtering Logic
  const filteredViolations = violations.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.offenderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || v.role === filterRole;
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchesSeverity = filterSeverity === 'All' || v.violationType === filterSeverity;
    
    return matchesSearch && matchesRole && matchesStatus && matchesSeverity;
  });

  // Handlers
  const handleOpenModal = (violation = null) => {
    if (violation) {
      setFormData(violation);
    } else {
      setFormData({
        id: `V-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        offenderId: '', name: '', role: 'Student', 
        violationType: 'Minor', description: '', dateOfIncident: new Date().toISOString().split('T')[0], 
        status: 'Pending', disciplinaryAction: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentViolation(null);
  };

  const handleOpenViewModal = (violation) => {
    setCurrentViolation(violation);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setCurrentViolation(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (violations.some(v => v.id === formData.id)) {
      setViolations(violations.map(v => v.id === formData.id ? formData : v));
    } else {
      setViolations([...violations, formData]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this violation record?')) {
      setViolations(violations.filter(v => v.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setViolations(violations.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  // Helper render functions
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={14} />;
      case 'Resolved': return <CheckCircle size={14} />;
      case 'Appealed': return <FileText size={14} />;
      default: return null;
    }
  };

  return (
    <div className="violation-management-container">
      <div className="violation-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={32} color="var(--primary-color)" />
          <h1 style={{ margin: 0 }}>Violation Management</h1>
        </div>
        <button className="btn-add" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Violation
        </button>
      </div>

      <div className="violation-controls">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or record number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="Student">Students</option>
            <option value="Faculty">Faculty</option>
          </select>
          
          <select className="filter-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="All">All Severities</option>
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Grave">Grave</option>
          </select>

          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Appealed">Appealed</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="violation-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Offender</th>
              <th>Role</th>
              <th>Severity</th>
              <th>Date of Incident</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredViolations.length > 0 ? (
              filteredViolations.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>
                    <div className="offender-info">
                      <span className="offender-name">{v.name}</span>
                      <span className="offender-id">{v.offenderId}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-role-${v.role.toLowerCase()}`}>
                      {v.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-severity-${v.violationType.toLowerCase()}`}>
                      <AlertTriangle size={12} />
                      {v.violationType}
                    </span>
                  </td>
                  <td>{v.dateOfIncident}</td>
                  <td>
                    <span className={`badge badge-status-${v.status.toLowerCase()}`}>
                      {renderStatusIcon(v.status)} {v.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn-icon view" onClick={() => handleOpenViewModal(v)} title="View Details">
                        <Eye size={18} />
                      </button>
                      <button className="btn-icon edit" onClick={() => handleOpenModal(v)} title="Edit Record">
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(v.id)} title="Delete Record">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No violation records found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formData.id.startsWith('V-') && violations.some(v => v.id === formData.id) ? 'Edit' : 'Add'} Violation Record</h2>
              <button className="btn-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Role</label>
                    <select className="form-control" name="role" value={formData.role} onChange={handleInputChange} required>
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Offender ID</label>
                    <input type="text" className="form-control" name="offenderId" value={formData.offenderId} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Offender Name</label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Date of Incident</label>
                    <input type="date" className="form-control" name="dateOfIncident" value={formData.dateOfIncident} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Severity Level</label>
                    <select className="form-control" name="violationType" value={formData.violationType} onChange={handleInputChange} required>
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                      <option value="Grave">Grave</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" name="status" value={formData.status} onChange={handleInputChange} required>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Appealed">Appealed</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description of Incident</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} required rows="3"></textarea>
                </div>
                
                <div className="form-group">
                  <label>Disciplinary Action</label>
                  <input type="text" className="form-control" name="disciplinaryAction" value={formData.disciplinaryAction} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-save">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && currentViolation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Violation Details: {currentViolation.id}</h2>
              <button className="btn-close" onClick={handleCloseViewModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Offender Info:</div>
                <div className="detail-value">
                  <strong>{currentViolation.name}</strong> ({currentViolation.offenderId})
                  <div><span className={`badge badge-role-${currentViolation.role.toLowerCase()}`} style={{marginTop: '8px'}}>{currentViolation.role}</span></div>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Incident Date:</div>
                <div className="detail-value">{currentViolation.dateOfIncident}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Severity:</div>
                <div className="detail-value">
                  <span className={`badge badge-severity-${currentViolation.violationType.toLowerCase()}`}>
                    <AlertTriangle size={12} /> {currentViolation.violationType}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`badge badge-status-${currentViolation.status.toLowerCase()}`}>
                    {renderStatusIcon(currentViolation.status)} {currentViolation.status}
                  </span>
                  {currentViolation.status !== 'Resolved' && (
                    <button 
                      style={{marginLeft: '12px', padding: '4px 8px', fontSize: '12px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                      onClick={() => handleStatusChange(currentViolation.id, 'Resolved')}
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Description:</div>
                <div className="detail-value">{currentViolation.description}</div>
              </div>
              <div className="detail-row" style={{ borderBottom: 'none' }}>
                <div className="detail-label">Disciplinary Action:</div>
                <div className="detail-value">{currentViolation.disciplinaryAction || 'None specified yet'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseViewModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationManagement;
