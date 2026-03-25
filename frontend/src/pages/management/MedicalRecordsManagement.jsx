import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, X, Edit, Trash2, Activity,
  FileText, CheckCircle, AlertTriangle, Clock, User, Download, UploadCloud
} from 'lucide-react';
import './MedicalRecordsManagement.css';

const mockMedicalRecords = [
  { id: '1', studentId: '2023-0001', name: 'John Doe', bloodType: 'O+', conditions: 'Asthma', lastCheckup: '2023-11-15', status: 'Cleared' },
  { id: '2', studentId: '2023-0002', name: 'Jane Smith', bloodType: 'A-', conditions: 'None', lastCheckup: '2024-01-20', status: 'Cleared' },
  { id: '3', studentId: '2023-0003', name: 'Mark Johnson', bloodType: 'B+', conditions: 'Allergies', lastCheckup: '2023-08-05', status: 'Pending Review' },
  { id: '4', studentId: '2023-0004', name: 'Emily Davis', bloodType: 'AB+', conditions: 'Type 1 Diabetes', lastCheckup: '2024-02-10', status: 'Cleared' },
  { id: '5', studentId: '2023-0005', name: 'Michael Brown', bloodType: 'O-', conditions: 'None', lastCheckup: '2022-12-01', status: 'Needs Update' },
];

const MedicalRecordsManagement = () => {
  const [records, setRecords] = useState(() => {
    try {
      const stored = localStorage.getItem('ccs_medical_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
      localStorage.setItem('ccs_medical_records', JSON.stringify(mockMedicalRecords));
      return mockMedicalRecords;
    } catch {
      localStorage.setItem('ccs_medical_records', JSON.stringify(mockMedicalRecords));
      return mockMedicalRecords;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [currentDocs, setCurrentDocs] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    studentId: '',
    name: '',
    bloodType: '',
    conditions: '',
    lastCheckup: '',
    status: 'Cleared'
  });

  const saveToStorage = (updatedRecords) => {
    localStorage.setItem('ccs_medical_records', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (record = null) => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({
        id: null,
        studentId: '',
        name: '',
        bloodType: '',
        conditions: '',
        lastCheckup: '',
        status: 'Cleared'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const openDocsModal = (record) => {
    try {
      const storedDocs = localStorage.getItem('ccs_medical_documents');
      if (storedDocs) {
        const allDocs = JSON.parse(storedDocs);
        const myDocs = allDocs.filter(d => d.studentId === record.studentId);
        setCurrentDocs(myDocs);
      } else {
        setCurrentDocs([]);
      }
    } catch (err) {
      console.error('Error reading documents:', err);
      setCurrentDocs([]);
    }
    setSelectedStudentName(record.name);
    setIsDocsModalOpen(true);
  };

  const closeDocsModal = () => setIsDocsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedRecords;

    if (formData.id) {
      updatedRecords = records.map((r) => (r.id === formData.id ? formData : r));
    } else {
      updatedRecords = [...records, { ...formData, id: Date.now().toString() }];
    }

    saveToStorage(updatedRecords);
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this medical record?")) {
      const updatedRecords = records.filter((r) => r.id !== id);
      saveToStorage(updatedRecords);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.conditions.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  const stats = {
    total: records.length,
    cleared: records.filter(r => r.status === 'Cleared').length,
    pending: records.filter(r => r.status === 'Pending Review').length,
    needsUpdate: records.filter(r => r.status === 'Needs Update').length
  };

  return (
    <div className="medical-management-container">
      <div className="medical-header-section">
        <div className="medical-header-text">
          <h2>Medical Records Management</h2>
          <p>Manage student health histories, clearances, and medical requirements securely.</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={18} />
          <span>Add Record</span>
        </button>
      </div>

      <div className="medical-stats-grid">
        <div className="medical-stat-card total">
          <div className="medical-stat-icon-wrapper">
            <FileText size={24} />
          </div>
          <div className="medical-stat-info">
            <span className="medical-stat-value">{stats.total}</span>
            <span className="medical-stat-label">Total Records</span>
          </div>
        </div>
        <div className="medical-stat-card cleared">
          <div className="medical-stat-icon-wrapper">
            <CheckCircle size={24} />
          </div>
          <div className="medical-stat-info">
            <span className="medical-stat-value">{stats.cleared}</span>
            <span className="medical-stat-label">Cleared</span>
          </div>
        </div>
        <div className="medical-stat-card pending">
          <div className="medical-stat-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="medical-stat-info">
            <span className="medical-stat-value">{stats.pending}</span>
            <span className="medical-stat-label">Pending Review</span>
          </div>
        </div>
        <div className="medical-stat-card needs-update">
          <div className="medical-stat-icon-wrapper">
            <AlertTriangle size={24} />
          </div>
          <div className="medical-stat-info">
            <span className="medical-stat-value">{stats.needsUpdate}</span>
            <span className="medical-stat-label">Needs Update</span>
          </div>
        </div>
      </div>

      <div className="medical-controls">
        <div className="medical-search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by student name, ID, or condition..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="medical-search-input"
          />
        </div>
        
        <div className="medical-filter-wrapper">
          <Filter size={18} className="filter-icon" />
          <div className="medical-filter-pills">
            {['All', 'Cleared', 'Pending Review', 'Needs Update'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`medical-filter-pill ${statusFilter === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="medical-list-wrapper">
        {filteredRecords.length === 0 ? (
          <div className="medical-no-results">
            <Activity size={40} className="empty-icon" />
            <p>No medical records found matching your criteria.</p>
          </div>
        ) : (
          <table className="medical-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Health Information</th>
                <th>Last Checkup</th>
                <th>Clearance Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="student-info">
                      <span className="student-name">{r.name}</span>
                      <span className="student-id">{r.studentId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="health-info">
                      <span className="blood-type">
                         <Activity size={12} /> {r.bloodType || 'Unknown'}
                      </span>
                      <span className="conditions">{r.conditions || 'None reported'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="student-info">
                      <span className="student-name">{r.lastCheckup || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${r.status?.toLowerCase().replace(' ', '-')}`}>
                       {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="table-action-btn view" title="View Documents" onClick={() => openDocsModal(r)}>
                        <FileText size={16} />
                      </button>
                      <button className="table-action-btn edit" title="Edit Record" onClick={() => openModal(r)}>
                        <Edit size={16} />
                      </button>
                      <button className="table-action-btn delete" title="Delete Record" onClick={() => handleDelete(r.id)} style={{color: '#EF4444'}}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-box">
            <div className="medical-modal-header">
              <h3>{formData.id ? 'Edit Medical Record' : 'Add Medical Record'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="medical-form">
              <div className="medical-form-row">
                <div className="medical-form-group">
                  <label>Student Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. John Doe" />
                </div>
                <div className="medical-form-group">
                  <label>Student ID</label>
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="e.g. 2023-0001" />
                </div>
              </div>
              
              <div className="medical-form-row">
                <div className="medical-form-group">
                  <label>Blood Type</label>
                  <select name="bloodType" value={formData.bloodType} onChange={handleInputChange}>
                    <option value="">Select Blood Type...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="medical-form-group">
                  <label>Last Medical Checkup</label>
                  <input type="date" name="lastCheckup" value={formData.lastCheckup} onChange={handleInputChange} />
                </div>
              </div>

              <div className="medical-form-group">
                <label>Pre-existing Conditions / Allergies</label>
                <textarea name="conditions" value={formData.conditions} onChange={handleInputChange} rows={3} placeholder="List any allergies, conditions, or medications (or 'None')..."></textarea>
              </div>

              <div className="medical-form-group">
                <label>Clearance Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Cleared">Cleared</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Needs Update">Needs Update</option>
                </select>
              </div>
              
              <div className="medical-form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Save Changes' : 'Add Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Documents Modal */}
      {isDocsModalOpen && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-box">
            <div className="medical-modal-header">
              <h3>Documents: {selectedStudentName}</h3>
              <button className="modal-close-btn" onClick={closeDocsModal}>
                <X size={24} />
              </button>
            </div>
            <div className="medical-docs-body">
              {currentDocs.length === 0 ? (
                <div className="docs-empty">
                  <UploadCloud size={32} className="empty-icon-docs" />
                  <p>No documents uploaded by this student.</p>
                </div>
              ) : (
                <div className="docs-list">
                  {currentDocs.map(doc => (
                    <div key={doc.id} className="doc-item">
                      <div className="doc-info">
                        <FileText size={20} className="doc-icon" />
                        <div className="doc-details">
                          <span className="doc-name">{doc.fileName}</span>
                          <span className="doc-meta">{doc.uploadDate} • {doc.fileSize}</span>
                        </div>
                      </div>
                      <button className="doc-download-btn" title="Download">
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="medical-form-actions" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', marginTop: '0' }}>
              <button type="button" className="btn-secondary" onClick={closeDocsModal} style={{ marginLeft: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsManagement;