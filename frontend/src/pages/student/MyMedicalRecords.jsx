import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Activity, Calendar, Clock, User, HeartPulse, ShieldAlert,
  FileCheck, AlertCircle, UploadCloud, FileText, Trash2, X, Plus, Download
} from 'lucide-react';
import './MyMedicalRecords.css';

const normalizeMedicalRecord = (data) => ({
  id: data._id || data.id,
  scope: data.scope || 'Standalone',
  event: data.event || null,
  studentId: data.studentId || '',
  name: data.name || '',
  bloodType: data.bloodType || '',
  conditions: data.conditions || '',
  lastCheckup: data.lastCheckup || '',
  status: data.status || 'Pending Review',
  documents: data.documents || [],
  history: data.history || []
});

const MyMedicalRecords = () => {
  const [events, setEvents] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    scope: 'Standalone',
    event: '',
    lastCheckup: '',
    conditions: '',
    bloodType: '',
    file: null
  });
  const fileInputRef = useRef(null);

  const loadEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data || []);
    } catch (err) {
      setEvents([]);
    }
  };

  const loadMyRecord = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/medical-records/me');
      setRecord(normalizeMedicalRecord(response.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medical record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRecord();
    loadEvents();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      scope: record?.scope || 'Standalone',
      event: record?.event?._id || record?.event || '',
      lastCheckup: record?.lastCheckup || '',
      conditions: record?.conditions || '',
      bloodType: record?.bloodType || '',
      file: null
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        scope: formData.scope,
        event: formData.scope === 'Event Requirement' ? formData.event : '',
        lastCheckup: formData.lastCheckup || '',
        conditions: formData.conditions || '',
        bloodType: formData.bloodType || '',
      };

      if (formData.scope === 'Event Requirement' && !formData.event) {
        setError('Please select an event requirement.');
        return;
      }

      if (formData.file) {
        payload.fileName = formData.file.name;
        payload.mimeType = formData.file.type || '';
        payload.fileSize = `${(formData.file.size / 1024).toFixed(1)} KB`;
      }

      const response = await axios.put('/api/medical-records/me', payload);
      setRecord(normalizeMedicalRecord(response.data));
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical record.');
    }
  };

  const handleUploadDocument = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const payload = {
        fileName: file.name,
        mimeType: file.type || '',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      };
      const response = await axios.post('/api/medical-records/me/documents', payload);
      setRecord(normalizeMedicalRecord(response.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;

    try {
      const response = await axios.delete(`/api/medical-records/me/documents/${docId}`);
      setRecord(normalizeMedicalRecord(response.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const docId = doc?._id || doc?.id;
      if (!docId) return;
      const response = await axios.get(`/api/medical-records/me/documents/${docId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.fileName || 'medical-document';
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download document.');
    }
  };

  if (loading) return <div className="medical-loading">Loading Health Profile...</div>;
  if (!record) return <div className="medical-loading">No medical record found.</div>;

  const documents = record.documents || [];
  const pastRecords = [...(record.history || [])];
  const isCleared = record.status === 'Cleared';
  const needsUpdate = record.status === 'Needs Update';
  const isPending = record.status === 'Pending Review';

  return (
    <div className="student-medical-container">
      <div className="sm-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="sm-header-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <HeartPulse size={32} color="var(--primary-color)" />
              <h2 style={{ margin: 0 }}>My Medical Records</h2>
            </div>
            <p>View your health summary, clinic visits, and update requirements.</p>
          </div>
          <button className="upload-btn" onClick={handleOpenModal} style={{ padding: '10px 20px', fontSize: '15px' }}>
            <Plus size={18} /> Add New Record
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '12px', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        <div className={`sm-status-banner ${record.status.toLowerCase().replace(' ', '-')}`}>
          {isCleared && <FileCheck size={20} />}
          {needsUpdate && <AlertCircle size={20} />}
          {isPending && <Clock size={20} />}
          <div className="banner-text">
            <strong>Clearance Status: {record.status}</strong>
            <span>
              {isCleared ? 'You are cleared for all campus activities.' :
               needsUpdate ? 'Please visit the clinic to update your medical file.' :
               'Your medical status is currently under review.'}
            </span>
          </div>
        </div>
      </div>

      <div className="sm-stats-container">
        <div className="sm-stat-card">
          <div className={`stat-icon-wrapper ${isCleared ? 'success' : needsUpdate ? 'danger' : 'warning'}`}>
            {isCleared ? <HeartPulse size={24} /> : needsUpdate ? <ShieldAlert size={24} /> : <Activity size={24} />}
          </div>
          <div className="stat-info">
            <span className="stat-label">Health Status</span>
            <span className="stat-value">{record.status}</span>
          </div>
        </div>

        <div className="sm-stat-card">
          <div className="stat-icon-wrapper">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Uploaded Docs</span>
            <span className="stat-value">{documents.length} File{documents.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="sm-stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light, rgba(79, 70, 229, 0.1))', color: 'var(--primary-color)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Last Checkup</span>
            <span className="stat-value">{record.lastCheckup || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="sm-tabs-container">
        <button
          className={`sm-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <User size={18} /> Health Overview
        </button>
        <button
          className={`sm-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={18} /> Past Records ({pastRecords.length})
        </button>
      </div>

      <div className="sm-content-area">
        {activeTab === 'overview' && (
          <div className="sm-profile-card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HeartPulse className="card-icon" />
                <h3>Health Profile</h3>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-row">
                <span className="label">Student Name</span>
                <span className="value">{record.name}</span>
              </div>
              <div className="profile-row">
                <span className="label">Student ID</span>
                <span className="value">{record.studentId}</span>
              </div>
              <div className="profile-row">
                <span className="label">Blood Type</span>
                <span className="value blood-type-badge">{record.bloodType || 'Not Provided'}</span>
              </div>
              <div className="profile-row">
                <span className="label">Last Checkup Date</span>
                <span className="value">{record.lastCheckup || 'Unknown'}</span>
              </div>
                <div className="profile-row">
                  <span className="label">Record Type</span>
                  <span className="value">{record.scope || 'Standalone'}</span>
                </div>
                {record.event && (
                  <div className="profile-row">
                    <span className="label">Event Requirement</span>
                    <span className="value">{record.event.title || record.event.name || 'Selected event'}</span>
                  </div>
                )}
              <div className="profile-row" style={{ gridColumn: '1 / -1' }}>
                <span className="label">Pre-existing Conditions</span>
                <span className="value">{record.conditions || 'None reported'}</span>
              </div>
            </div>

            {needsUpdate && (
              <div className="sm-action-prompt">
                <ShieldAlert size={16} />
                <span>An updated physical examination is required to regain clearance.</span>
              </div>
            )}

            <div className="sm-documents-section">
              <div className="documents-header">
                <h4><FileText className="card-icon" size={20} /> Uploaded Medical Documents</h4>
                <button className="upload-btn" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <UploadCloud size={16} /> {isUploading ? 'Uploading...' : 'Upload New'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleUploadDocument}
                />
              </div>

              <div className="documents-list">
                {documents.length === 0 ? (
                  <div className="no-docs">
                    <FileText size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>No documents uploaded yet.</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc._id || doc.id} className="doc-item">
                      <div className="doc-info">
                        <FileText size={20} className="doc-icon" />
                        <div className="doc-details">
                          <span className="doc-name">{doc.fileName}</span>
                          <span className="doc-meta">{doc.uploadDate} • {doc.fileSize}</span>
                        </div>
                      </div>
                      <div className="doc-actions">
                        <button className="doc-action-btn" onClick={() => handleDownloadDocument(doc)} title="Download">
                          <Download size={16} />
                        </button>
                        <button className="doc-action-btn delete" onClick={() => handleDeleteDocument(doc._id || doc.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="sm-history-card">
            <div className="card-header">
              <Clock className="card-icon" />
              <h3>Past Records & Updates</h3>
            </div>
            <div className="record-timeline">
              {pastRecords.length === 0 ? (
                <div className="no-docs" style={{ marginTop: '0' }}>
                  <Clock size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>No past records found.</p>
                </div>
              ) : (
                pastRecords.map((log) => (
                  <div key={log._id || log.id} className="record-item">
                    <div className="record-dot"></div>
                    <div className="record-content">
                      <div className="record-header">
                        <h5>Medical Record Filed</h5>
                        <span>{log.dateCompleted || 'N/A'}</span>
                      </div>
                      <div className={`record-status status-${(log.status || 'Pending Review').toLowerCase().replace(' ', '-')}`}>
                        {log.status || 'Pending Review'}
                      </div>
                      <p><strong>Checkup Date:</strong> {log.checkupDate || 'N/A'}</p>
                      <p><strong>Conditions:</strong> {log.conditions || 'None'}</p>
                      <p><strong>Blood Type:</strong> {log.bloodType || 'N/A'}</p>
                      <p><strong>Document:</strong> {log.documentAttached || 'None'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-box">
            <div className="medical-modal-header">
              <h3>Add New Medical Record</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmitRecord} className="medical-form">
              <div className="medical-form-row">
                <div className="medical-form-group">
                  <label>Blood Type</label>
                  <select name="bloodType" value={formData.bloodType} onChange={handleFormChange}>
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
                  <input type="date" name="lastCheckup" value={formData.lastCheckup} onChange={handleFormChange} />
                </div>
              </div>

              <div className="medical-form-row">
                <div className="medical-form-group">
                  <label>Record Type</label>
                  <select name="scope" value={formData.scope} onChange={handleFormChange}>
                    <option value="Standalone">Standalone</option>
                    <option value="Event Requirement">Event Requirement</option>
                  </select>
                </div>
                {formData.scope === 'Event Requirement' && (
                  <div className="medical-form-group">
                    <label>Event Requirement</label>
                    <select name="event" value={formData.event} onChange={handleFormChange}>
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
                <textarea name="conditions" value={formData.conditions} onChange={handleFormChange} rows={3} placeholder="List any allergies, conditions, or medications (or 'None')..." />
              </div>

              <div className="medical-form-group">
                <label>Attach Document</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
              </div>

              <div className="medical-form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMedicalRecords;
