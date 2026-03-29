import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, Filter, Users, Eye, LayoutGrid, List, BookOpen, Briefcase, Mail, Phone, Award } from 'lucide-react';
import './FacultyManagement.css';

const DEFAULT_FORM_DATA = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  department: 'IT',
  academicRank: 'Instructor',
  employmentType: 'Full-time',
  status: 'Active',
  specializations: '',
  profileImage: ''
};

const INITIAL_FACULTY = [
  {
    id: '1',
    employeeId: 'EMP-2020-001',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@pnc.edu.ph',
    contactNumber: '09171234567',
    department: 'IT',
    academicRank: 'Assistant Professor',
    employmentType: 'Full-time',
    status: 'Active',
    specializations: 'Software Engineering, Web Development',
    profileImage: ''
  },
  {
    id: '2',
    employeeId: 'EMP-2021-015',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@pnc.edu.ph',
    contactNumber: '09189876543',
    department: 'CS',
    academicRank: 'Instructor',
    employmentType: 'Part-time',
    status: 'Active',
    specializations: 'Data Structures, Algorithms',
    profileImage: ''
  },
  {
    id: '3',
    employeeId: 'EMP-2018-042',
    firstName: 'Roberto',
    lastName: 'Reyes',
    email: 'roberto.reyes@pnc.edu.ph',
    contactNumber: '09191112222',
    department: 'IS',
    academicRank: 'Associate Professor',
    employmentType: 'Full-time',
    status: 'On Leave',
    specializations: 'Database Management, System Analysis',
    profileImage: ''
  }
];

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState(() => {
    try {
      const stored = localStorage.getItem('ccs_faculty_v1');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('ccs_faculty_v1', JSON.stringify(INITIAL_FACULTY));
      return INITIAL_FACULTY;
    } catch {
      return INITIAL_FACULTY;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rankFilter, setRankFilter] = useState('All');
  
  const [viewMode, setViewMode] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const saveToStorage = (updatedFaculties) => {
    setFaculties(updatedFaculties);
    localStorage.setItem('ccs_faculty_v1', JSON.stringify(updatedFaculties));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (faculty = null) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFormData(faculty);
    } else {
      setEditingFaculty(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaculty(null);
  };

  const openDetailModal = (faculty) => {
    setSelectedFaculty(faculty);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFaculty(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFaculty) {
      const updated = faculties.map((faculty) =>
        faculty.id === editingFaculty.id ? { ...formData, id: faculty.id } : faculty
      );
      saveToStorage(updated);
    } else {
      const newFaculty = { ...formData, id: Date.now().toString() };
      saveToStorage([...faculties, newFaculty]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      const updated = faculties.filter((faculty) => faculty.id !== id);
      saveToStorage(updated);
    }
  };

  const filteredFaculties = useMemo(() => {
    return faculties.filter((faculty) => {
      const fullName = `${faculty.firstName} ${faculty.lastName}`.trim();
      const matchesSearch =
        (faculty.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faculty.specializations || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = departmentFilter === 'All' || faculty.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || faculty.status === statusFilter;
      const matchesRank = rankFilter === 'All' || faculty.academicRank === rankFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesRank;
    });
  }, [faculties, searchQuery, departmentFilter, statusFilter, rankFilter]);

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'active';
    if (s === 'on leave') return 'on-leave';
    if (s === 'resigned') return 'resigned';
    return '';
  };

  return (
    <div className="faculty-management-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={28} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Faculty Management</h2>
          </div>
          <p>Manage faculty profiles, department assignments, and academic roles.</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={18} />
          Add Faculty
        </button>
      </div>

      <div className="fm-controls-bar">
        <div className="fm-search-box">
          <Search size={18} className="fm-search-icon" />
          <input
            type="text"
            placeholder="Search by ID, name, or specializations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="fm-filter-box">
          <Filter size={18} className="fm-filter-icon" />
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="IT">IT</option>
            <option value="CS">CS</option>
            <option value="IS">IS</option>
          </select>
        </div>

        <div className="fm-filter-box">
          <Award size={18} className="fm-filter-icon" />
          <select value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
            <option value="All">All Ranks</option>
            <option value="Instructor">Instructor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Professor">Professor</option>
          </select>
        </div>

        <div className="fm-filter-box">
          <Briefcase size={18} className="fm-filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>

        <div className="fm-view-toggle">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="fm-table-container">
          <table className="fm-faculty-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Rank & Type</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.length > 0 ? (
                filteredFaculties.map((faculty) => (
                  <tr key={faculty.id}>
                    <td>
                      <div className="fm-table-cell-content">
                        <div className="fw-medium">{faculty.employeeId}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div className="fw-medium">{`${faculty.lastName}, ${faculty.firstName}`}</div>
                        <div className="fm-cell-subtext truncate" style={{ maxWidth: '180px' }} title={faculty.specializations}>{faculty.specializations || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>{faculty.department}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>{faculty.academicRank}</div>
                        <div className="fm-cell-subtext">{faculty.employmentType}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>
                          <span className={`fm-status-badge ${getStatusClass(faculty.status)}`}>
                            {faculty.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>{faculty.contactNumber || '-'}</div>
                        <div className="fm-cell-subtext truncate" style={{ maxWidth: '150px' }} title={faculty.email}>{faculty.email || '-'}</div>
                      </div>
                    </td>
                    <td className="fm-actions-cell">
                      <div className="fm-actions-group">
                        <button className="fm-action-btn view" onClick={() => openDetailModal(faculty)} title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="fm-action-btn edit" onClick={() => openModal(faculty)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="fm-action-btn delete" onClick={() => handleDelete(faculty.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="fm-empty-state">
                    <Users size={20} /> No faculty found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="fm-grid-container">
          {filteredFaculties.length > 0 ? (
            filteredFaculties.map((faculty) => (
              <div className="fm-faculty-card" key={faculty.id}>
                <div className="fm-card-banner">
                  <span className={`fm-status-badge ${getStatusClass(faculty.status)}`}>
                    {faculty.status}
                  </span>
                </div>
                <div className="fm-card-content">
                  <div className="fm-card-user-info">
                    <div className="fm-card-avatar">
                      {faculty.firstName.charAt(0)}{faculty.lastName.charAt(0)}
                    </div>
                    <div className="fm-card-user-text">
                      <h3 className="fm-card-name" title={`${faculty.lastName}, ${faculty.firstName}`}>
                        {`${faculty.lastName}, ${faculty.firstName}`}
                      </h3>
                      <p className="fm-card-faculty-no">{faculty.employeeId}</p>
                    </div>
                  </div>
                  <div className="fm-card-body">
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <BookOpen size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Department:</span>
                      </div>
                      <span className="fm-detail-value fw-medium">{faculty.department}</span>
                    </div>
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <Award size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Rank:</span>
                      </div>
                      <span className="fm-detail-value fw-medium">{faculty.academicRank}</span>
                    </div>
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <Briefcase size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Type:</span>
                      </div>
                      <span className="fm-detail-value">{faculty.employmentType}</span>
                    </div>
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <Mail size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Email:</span>
                      </div>
                      <span className="fm-detail-value truncate" title={faculty.email || '-'}>{faculty.email || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="fm-card-footer">
                  <button className="fm-action-btn view" onClick={() => openDetailModal(faculty)} title="View Details">
                    <Eye size={16} /> View
                  </button>
                  <button className="fm-action-btn edit" onClick={() => openModal(faculty)} title="Edit">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="fm-action-btn delete" onClick={() => handleDelete(faculty.id)} title="Delete">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="fm-empty-state">
              <Users size={20} /> No faculty found matching your criteria.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <h4 className="form-section-title">Basic Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. EMP-2026-001"
                  />
                </div>
                <div className="form-group half">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleInputChange}>
                    <option value="IT">IT</option>
                    <option value="CS">CS</option>
                    <option value="IS">IS</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group half">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <h4 className="form-section-title">Professional Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Academic Rank</label>
                  <select name="academicRank" value={formData.academicRank} onChange={handleInputChange}>
                    <option value="Instructor">Instructor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Employment Type</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleInputChange}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Profile Image URL</label>
                  <input
                    type="text"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full">
                  <label>Specializations</label>
                  <input
                    type="text"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    placeholder="e.g. Web Development, AI, Data Science"
                  />
                </div>
              </div>

              <h4 className="form-section-title">Contact Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="name@pnc.edu.ph"
                  />
                </div>
                <div className="form-group half">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="09XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingFaculty ? 'Save Changes' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedFaculty && (
        <div className="fm-detail-overlay" onClick={closeDetailModal}>
          <div className="fm-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fm-detail-header">
              <div>
                <h3>Faculty Details</h3>
                <p>{selectedFaculty.employeeId}</p>
              </div>
              <button className="close-btn" onClick={closeDetailModal}>
                <X size={20} />
              </button>
            </div>

            <div className="fm-detail-body">
              <div className="fm-detail-section">
                <h4>Basic Information</h4>
                <div className="fm-detail-grid">
                  <div className="fm-detail-item"><span>Full Name</span><strong>{`${selectedFaculty.lastName}, ${selectedFaculty.firstName}`}</strong></div>
                  <div className="fm-detail-item"><span>Employee ID</span><strong>{selectedFaculty.employeeId || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Email</span><strong>{selectedFaculty.email || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Contact Number</span><strong>{selectedFaculty.contactNumber || 'N/A'}</strong></div>
                </div>
              </div>

              <div className="fm-detail-section">
                <h4>Professional Information</h4>
                <div className="fm-detail-grid">
                  <div className="fm-detail-item"><span>Department</span><strong>{selectedFaculty.department || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Academic Rank</span><strong>{selectedFaculty.academicRank || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Employment Type</span><strong>{selectedFaculty.employmentType || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Status</span>
                    <strong>
                       <span className={`fm-status-badge ${getStatusClass(selectedFaculty.status)}`} style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-block', marginTop: '2px' }}>
                          {selectedFaculty.status || 'N/A'}
                        </span>
                    </strong>
                  </div>
                </div>
              </div>
              
              <div className="fm-detail-section">
                <h4>Specializations</h4>
                <div className="fm-detail-grid">
                   <div className="fm-detail-item" style={{ gridColumn: '1 / -1' }}><span>Areas of Expertise</span><strong>{selectedFaculty.specializations || 'None recorded'}</strong></div>
                </div>
              </div>
            </div>

            <div className="fm-detail-footer">
              <button type="button" className="btn-cancel" onClick={closeDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;