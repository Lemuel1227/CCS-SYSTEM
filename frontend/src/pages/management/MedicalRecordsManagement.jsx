import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Search, Filter, Plus, X, Edit, Trash2, Activity,
  FileText, CheckCircle, AlertTriangle, Clock, Download, UploadCloud
} from 'lucide-react';
import './MedicalRecordsManagement.css';

const normalizeRecord = (record) => ({
  id: record._id || record.id,
  scope: record.scope || 'Standalone',
  event: record.event || null,
  studentId: record.studentId || '',
  name: record.name || '',
  bloodType: record.bloodType || '',
  conditions: record.conditions || '',
  lastCheckup: record.lastCheckup || '',
  status: record.status || 'Pending Review',
  documents: record.documents || [],
  history: record.history || []
});

const MedicalRecordsManagement = () => {
  const [events, setEvents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [currentDocs, setCurrentDocs] = useState([]);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    scope: 'Standalone',
    event: '',
    studentId: '',
    name: '',
    bloodType: '',
    conditions: '',
    lastCheckup: '',
    status: 'Cleared'
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get('/api/medical-records');
      setRecords(response.data.map(normalizeRecord));
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load medical records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data || []);
    } catch (err) {
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (record = null) => {
    if (record) {
      setFormData({
        ...record,
        scope: record.scope || 'Standalone',
        event: record.event?._id || record.event || ''
      });
    } else {
      setFormData({
        id: null,
        scope: 'Standalone',
        event: '',
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
    setCurrentDocs(record.documents || []);
    setSelectedStudentName(record.name);
    setSelectedRecordId(record.id);
    setIsDocsModalOpen(true);
  };

  const closeDocsModal = () => setIsDocsModalOpen(false);

  const handleDownloadDocument = async (doc) => {
    try {
      const docId = doc?._id || doc?.id;
      if (!selectedRecordId || !docId) return;
      const response = await axios.get(`/api/medical-records/${selectedRecordId}/documents/${docId}/download`);
      // Backend now returns { fileName: "..." } instead of the actual file
      // Since we only store the name, we can't download the actual file
      alert(`File name: ${response.data.fileName}\n\nNote: Only the file name is stored. The actual file is not saved on the server.`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to download document.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        scope: formData.scope,
        event: formData.scope === 'Event Requirement' ? formData.event : null,
        studentId: formData.studentId,
        name: formData.name,
        bloodType: formData.bloodType,
        conditions: formData.conditions,
        lastCheckup: formData.lastCheckup,
        status: formData.status
      };

      const response = formData.id
        ? await axios.put(`/api/medical-records/${formData.id}`, payload)
        : await axios.post('/api/medical-records', payload);

      const saved = normalizeRecord(response.data);
      setRecords((prev) => {
        if (formData.id) {
          return prev.map((record) => (record.id === saved.id ? saved : record));
        }
        return [...prev, saved];
      });
      closeModal();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save medical record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;

    try {
      await axios.delete(`/api/medical-records/${id}`);
      setRecords((prev) => prev.filter((record) => record.id !== id));
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete medical record.');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.conditions.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  const stats = {
    total: records.length,
    cleared: records.filter((record) => record.status === 'Cleared').length,
    pending: records.filter((record) => record.status === 'Pending Review').length,
    needsUpdate: records.filter((record) => record.status === 'Needs Update').length
  };

  return (
    <div className="medical-management-container">
      <div className="medical-header-section">
        <div className="medical-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Activity size={28} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Medical Records Management</h2>
          </div>
          <p>Manage student health histories, clearances, and medical requirements securely.</p>
          {errorMessage && <div style={{ marginTop: '12px', color: '#b91c1c' }}>{errorMessage}</div>}
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
            {['All', 'Cleared', 'Pending Review', 'Needs Update'].map((status) => (
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
        {loading ? (
          <div className="medical-no-results">
            <Activity size={40} className="empty-icon" />
            <p>Loading medical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
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
                <th>Record Type</th>
                <th>Last Checkup</th>
                <th>Clearance Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="student-info">
                      <span className="student-name">{record.name}</span>
                      <span className="student-id">{record.studentId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="health-info">
                      <span className="blood-type">
                        <Activity size={12} /> {record.bloodType || 'Unknown'}
                      </span>
                      <span className="conditions">{record.conditions || 'None reported'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="student-info">
                      <span className="student-name">{record.scope || 'Standalone'}</span>
                      <span className="student-id">{record.event?.title || 'No linked event'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="student-info">
                      <span className="student-name">{record.lastCheckup || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${record.status?.toLowerCase().replace(' ', '-')}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="table-action-btn view" title="View Documents" onClick={() => openDocsModal(record)}>
                        <FileText size={16} />
                      </button>
                      <button className="table-action-btn edit" title="Edit Record" onClick={() => openModal(record)}>
                        <Edit size={16} />
                      </button>
                      <button className="table-action-btn delete" title="Delete Record" onClick={() => handleDelete(record.id)} style={{ color: '#EF4444' }}>
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

              <div className="medical-form-row">
                <div className="medical-form-group">
                  <label>Record Type</label>
                  <select name="scope" value={formData.scope} onChange={handleInputChange}>
                    <option value="Standalone">Standalone</option>
                    <option value="Event Requirement">Event Requirement</option>
                  </select>
                </div>
                {formData.scope === 'Event Requirement' && (
                  <div className="medical-form-group">
                    <label>Event Requirement</label>
                    <select name="event" value={formData.event} onChange={handleInputChange}>
                      <option value="">Select an event...</option>
                      {events.map((event) => (
                        <option key={event._id || event.id} value={event._id || event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="medical-form-group">
                <label>Pre-existing Conditions / Allergies</label>
                <textarea name="conditions" value={formData.conditions} onChange={handleInputChange} rows={3} placeholder="List any allergies, conditions, or medications (or 'None')..." />
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
                  {currentDocs.map((doc) => (
                    <div key={doc._id || doc.id} className="doc-item">
                      <div className="doc-info">
                        <FileText size={20} className="doc-icon" />
                        <div className="doc-details">
                          <span className="doc-name">{doc.fileName}</span>
                          <span className="doc-meta">{doc.uploadDate}</span>
                        </div>
                      </div>
                      <button className="doc-download-btn" title="Download" onClick={() => handleDownloadDocument(doc)}>
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
