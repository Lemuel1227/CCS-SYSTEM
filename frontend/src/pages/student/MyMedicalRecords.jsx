import React, { useState, useRef } from 'react';
import { 
  Activity, Calendar, Clock, User, HeartPulse, ShieldAlert,
  FileCheck, AlertCircle, UploadCloud, FileText, Download, Trash2, Edit, X, Plus
} from 'lucide-react';
import './MyMedicalRecords.css';

const MOCK_STUDENT_ID = '2023-0001';

const MyMedicalRecords = () => {
  const [record, setRecord] = useState(() => {
    try {
      const stored = localStorage.getItem('ccs_medical_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        const myRecord = parsed.find(r => r.studentId === MOCK_STUDENT_ID);
        if (myRecord) {
          return myRecord;
        }
      }
    } catch (error) {
      console.error('Error parsing medical records:', error);
    }
    
    // Fallback if not found in LocalStorage
    return { 
      id: '1', 
      studentId: MOCK_STUDENT_ID, 
      name: 'John Doe', 
      bloodType: 'O+', 
      conditions: 'Asthma', 
      lastCheckup: '2023-11-15', 
      status: 'Cleared' 
    };
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const storedDocs = localStorage.getItem('ccs_medical_documents');
      if (storedDocs) {
        const allDocs = JSON.parse(storedDocs);
        return allDocs.filter(d => d.studentId === MOCK_STUDENT_ID);
      }
    } catch (err) {
      console.error('Failed to parse documents', err);
    }
    return [];
  });

  const [pastRecords, setPastRecords] = useState(() => {
    try {
      const storedLogs = localStorage.getItem('ccs_medical_logs');
      if (storedLogs) {
        const allLogs = JSON.parse(storedLogs);
        const myLogs = allLogs.filter(L => L.studentId === MOCK_STUDENT_ID);
        // Sort by date descending
        return myLogs.sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted));
      }
    } catch (err) {
      console.error('Failed to parse logs', err);
    }
    return [];
  });

  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'history'
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    lastCheckup: '',
    conditions: '',
    bloodType: '',
    file: null
  });

  const handleOpenModal = () => {
    setFormData({
      lastCheckup: record.lastCheckup || '',
      conditions: record.conditions || '',
      bloodType: record.bloodType || '',
      file: null
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmitRecord = (e) => {
    e.preventDefault();
    
    // 1. Update the student's main medical record
    const updatedRecord = {
      ...record,
      lastCheckup: formData.lastCheckup,
      conditions: formData.conditions,
      bloodType: formData.bloodType,
      status: 'Pending Review' // Status pending when returning new records
    };
    
    setRecord(updatedRecord);

    try {
      const stored = localStorage.getItem('ccs_medical_records');
      let allRecords = stored ? JSON.parse(stored) : [];
      let foundIndex = allRecords.findIndex(r => r.studentId === MOCK_STUDENT_ID);
      
      if (foundIndex >= 0) {
        allRecords[foundIndex] = updatedRecord;
      } else {
        allRecords.push(updatedRecord);
      }
      localStorage.setItem('ccs_medical_records', JSON.stringify(allRecords));
    } catch (err) {
      console.error(err);
    }

    // 2. If there's a file attached as proof, save it
    if (formData.file) {
      const newDoc = {
        id: Date.now().toString(),
        studentId: MOCK_STUDENT_ID,
        fileName: formData.file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: (formData.file.size / 1024).toFixed(1) + ' KB'
      };

      const newDocs = [...documents, newDoc];
      setDocuments(newDocs);

      try {
        const existingDocs = localStorage.getItem('ccs_medical_documents');
        const allDocs = existingDocs ? JSON.parse(existingDocs) : [];
        allDocs.push(newDoc);
        localStorage.setItem('ccs_medical_documents', JSON.stringify(allDocs));
      } catch (err) {
        console.error(err);
      }
    }

    // 3. Save as a local medical history log
    const logDate = new Date().toISOString().split('T')[0];
    const newLog = {
      id: Date.now().toString() + '-log',
      studentId: MOCK_STUDENT_ID,
      checkupDate: formData.lastCheckup,
      conditions: formData.conditions,
      bloodType: formData.bloodType,
      dateCompleted: logDate,
      status: 'Pending Review',
      documentAttached: formData.file ? formData.file.name : 'None'
    };

    const newRecordsList = [newLog, ...pastRecords];
    setPastRecords(newRecordsList);

    try {
      const storedLogs = localStorage.getItem('ccs_medical_logs');
      const allLogs = storedLogs ? JSON.parse(storedLogs) : [];
      allLogs.push(newLog);
      localStorage.setItem('ccs_medical_logs', JSON.stringify(allLogs));
    } catch (err) {
      console.error(err);
    }

    setIsModalOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newDoc = {
      id: Date.now().toString(),
      studentId: MOCK_STUDENT_ID,
      fileName: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: (file.size / 1024).toFixed(1) + ' KB'
    };

    const newDocs = [...documents, newDoc];
    setDocuments(newDocs);

    // Save to global local storage
    try {
      const existing = localStorage.getItem('ccs_medical_documents');
      const allDocs = existing ? JSON.parse(existing) : [];
      allDocs.push(newDoc);
      localStorage.setItem('ccs_medical_documents', JSON.stringify(allDocs));
    } catch (err) {
      console.error(err);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = (docId) => {
    if (!window.confirm("Are you sure you want to remove this document?")) return;

    const newDocs = documents.filter(d => d.id !== docId);
    setDocuments(newDocs);

    // Update global storage
    try {
      const existing = localStorage.getItem('ccs_medical_documents');
      if (existing) {
        const allDocs = JSON.parse(existing);
        const updatedAllDocs = allDocs.filter(d => d.id !== docId);
        localStorage.setItem('ccs_medical_documents', JSON.stringify(updatedAllDocs));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!record) return <div className="medical-loading">Loading Health Profile...</div>;

  const isCleared = record.status === 'Cleared';
  const needsUpdate = record.status === 'Needs Update';
  const isPending = record.status === 'Pending Review';

  return (
    <div className="student-medical-container">
      <div className="sm-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="sm-header-text">
            <h2>My Medical Records</h2>
            <p>View your health summary, clinic visits, and update requirements.</p>
          </div>
          <button className="upload-btn" onClick={handleOpenModal} style={{ padding: '10px 20px', fontSize: '15px' }}>
            <Plus size={18} /> Add New Record
          </button>
        </div>
        
        {/* Dynamic Status Badging */}
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

      {/* Top Stat Cards */}
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
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Last Checkup</span>
            <span className="stat-value">{record.lastCheckup || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
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
        {/* Left Column: Health Profile */}
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

            {/* New Document Upload Section */}
            <div className="sm-documents-section">
              <div className="documents-header">
                <h4><FileText className="card-icon" size={20} /> Uploaded Medical Documents</h4>
                <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud size={16} /> Upload New
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
              </div>
              
              <div className="documents-list">
                {documents.length === 0 ? (
                  <div className="no-docs">
                    <FileText size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                    <p style={{ margin: 0, color: '#64748b' }}>No documents uploaded yet.</p>
                  </div>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="doc-item">
                      <div className="doc-info">
                        <FileText size={20} className="doc-icon" />
                        <div className="doc-details">
                          <span className="doc-name">{doc.fileName}</span>
                          <span className="doc-meta">{doc.uploadDate} • {doc.fileSize}</span>
                        </div>
                      </div>
                      <div className="doc-actions">
                        <button className="doc-action-btn delete" onClick={() => handleDeleteDocument(doc.id)} title="Delete">
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

        {/* Right Column / Bottom: Past Records */}
        {activeTab === 'history' && (
          <div className="sm-history-card">
            <div className="card-header">
              <Clock className="card-icon" />
              <h3>Past Records & Updates</h3>
            </div>
            <div className="record-timeline">
              {pastRecords.length === 0 ? (
                <div className="no-docs" style={{ marginTop: '0' }}>
                  <Clock size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: '#64748b' }}>No past records found.</p>
                </div>
              ) : (
                pastRecords.map((log) => (
                  <div key={log.id} className="record-item">
                    <div className="record-icon-wrapper">
                      <Activity size={20} />
                    </div>
                    <div className="record-content">
                      <div className="record-content-header">
                      <h5>Medical Record Filed</h5>
                        <span className="record-date">{log.dateCompleted}</span>
                      </div>
                      <div className="record-details">
                        <p><strong>Checkup Date:</strong> {log.checkupDate}</p>
                        <p><strong>Conditions:</strong> {log.conditions}</p>
                        <p><strong>Blood Type:</strong> {log.bloodType}</p>
                        {log.documentAttached && log.documentAttached !== 'None' && (
                          <div className="record-docs">
                            <FileText size={14} />
                            <span>{log.documentAttached} attached</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Log New Medical Record Modal */}
      {isModalOpen && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-box">
            <div className="medical-modal-header">
              <h3>Add New Medical Record</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form className="medical-form" onSubmit={handleSubmitRecord}>
              <div className="medical-form-group">
                <label>Date of Checkup / Update</label>
                <input 
                  type="date" 
                  name="lastCheckup" 
                  value={formData.lastCheckup} 
                  onChange={handleFormChange}
                  required
                />
              </div>

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
                <label>Pre-existing Conditions / Notes</label>
                <textarea 
                  name="conditions" 
                  value={formData.conditions} 
                  onChange={handleFormChange}
                  placeholder="e.g. Asthma, Allergies, or 'None'"
                  rows={3}
                  required
                ></textarea>
              </div>

              <div className="medical-form-group">
                <label>Supporting Document (Proof)</label>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="styled-file-input"
                  />
                </div>
                <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Please attach a clear photo or PDF of your medical certificate or checkup result.
                </small>
              </div>

              <div className="medical-form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMedicalRecords;