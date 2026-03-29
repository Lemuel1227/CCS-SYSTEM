import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, FileText, Calendar, Filter, XCircle } from 'lucide-react';
import './MyViolations.css';

const MyViolations = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Mock data for violations
  const stats = {
    total: 3,
    active: 1,
    resolved: 2,
    severityLevel: 'Low' // Low, Medium, High
  };

  const violationsList = [
    {
      id: 'V-2026-001',
      type: 'Dress Code Violation',
      date: '2026-03-25',
      time: '09:15 AM',
      location: 'Main Building Lobby',
      reportedBy: 'Mr. Security Guard',
      severity: 'Minor',
      status: 'active',
      description: 'Student entered the premises wearing ripped jeans and graphic t-shirt instead of the prescribed uniform.',
      penalty: 'Warning / Community Service (2 hours)',
      dueDate: '2026-04-05',
    },
    {
      id: 'V-2025-042',
      type: 'Late Submission of Requirements',
      date: '2025-11-10',
      time: '01:30 PM',
      location: 'Department Office',
      reportedBy: 'Prof. Maria S.',
      severity: 'Moderate',
      status: 'resolved',
      description: 'Failed to submit the final project documentation before the absolute deadline without prior valid notice.',
      penalty: 'Grade deduction',
      resolutionDate: '2025-11-15',
    },
    {
      id: 'V-2025-018',
      type: 'ID Unavailability',
      date: '2025-09-05',
      time: '07:45 AM',
      location: 'Gate 2',
      reportedBy: 'Ms. Security Guard',
      severity: 'Minor',
      status: 'resolved',
      description: 'Student forgot to bring the school identification card and used temporary pass.',
      penalty: 'Logbook entry and visual warning.',
      resolutionDate: '2025-09-05',
    }
  ];

  const filteredViolations = violationsList.filter(v => {
    const matchStatus = v.status === activeTab;
    const matchSeverity = severityFilter === 'All' || v.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchStatus && matchSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity.toLowerCase()) {
      case 'severe':
      case 'high':
        return <span className="severity-badge high">Severe</span>;
      case 'moderate':
      case 'medium':
        return <span className="severity-badge medium">Moderate</span>;
      default:
        return <span className="severity-badge low">Minor</span>;
    }
  };

  return (
    <div className="my-violations-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <ShieldAlert size={32} color="var(--primary-color)" />
            <h1 style={{ margin: 0 }}>My Violations</h1>
          </div>
          <p>Track your disciplinary records, active penalties, and resolution history.</p>
        </div>
      </div>

      {/* Progress & Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <p>Active Violations</p>
            <h3>{stats.active}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p>Resolved</p>
            <h3>{stats.resolved}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <p>Total Records</p>
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${stats.severityLevel === 'High' ? 'danger' : stats.severityLevel === 'Medium' ? 'warning' : 'primary'}`}>
            <ShieldAlert size={24} />
          </div>
          <div className="stat-content">
            <p>Current Standing</p>
            <h3>Good</h3>
          </div>
        </div>
      </div>

      <div className="violations-content">
        <div className="violations-main">
          {/* Controls */}
          <div className="violations-controls">
            <div className="tabs-container">
              <button 
                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                <AlertTriangle size={18} />
                Active / Pending ({stats.active})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                <CheckCircle size={18} />
                Resolved ({stats.resolved})
              </button>
            </div>

            <div className="filter-container">
              <Filter size={18} className="filter-icon" />
              <select 
                className="severity-filter"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="All">All Severities</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="violations-list">
            {filteredViolations.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} className="empty-icon text-success" />
                <h3>No {activeTab} violations</h3>
                <p>Great job! You have a clean record for this category.</p>
              </div>
            ) : (
              filteredViolations.map((violation) => (
                <div 
                  key={violation.id} 
                  className={`violation-card ${selectedViolation?.id === violation.id ? 'selected' : ''}`}
                  onClick={() => setSelectedViolation(violation)}
                >
                  <div className="violation-card-header">
                    <div className="violation-title">
                      <h4>{violation.type}</h4>
                      <span className="violation-id">{violation.id}</span>
                    </div>
                    {getSeverityBadge(violation.severity)}
                  </div>
                  
                  <div className="violation-info-grid">
                    <div className="info-item">
                      <Calendar size={16} />
                      <span>{violation.date}</span>
                    </div>
                    <div className="info-item">
                      <Clock size={16} />
                      <span>{violation.time}</span>
                    </div>
                  </div>

                  <div className="violation-summary">
                    <p className="violation-penalty">
                      <strong>Penalty:</strong> {violation.penalty}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Incident Details Modal */}
        {selectedViolation && (
          <div className="modal-overlay" onClick={() => setSelectedViolation(null)}>
            <div className="modal-content violation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="details-header">
                <h2>Incident Details</h2>
                <button className="btn-close-details" onClick={() => setSelectedViolation(null)}>
                  <XCircle size={20} />
                </button>
              </div>

              <div className="details-body">
                <div className="status-banner">
                   {selectedViolation.status === 'active' ? (
                     <div className="banner active-banner">
                       <AlertTriangle size={20} />
                       <div>
                         <strong>Action Required</strong>
                         <p>Please resolve this violation before {selectedViolation.dueDate}.</p>
                       </div>
                     </div>
                   ) : (
                     <div className="banner resolved-banner">
                       <CheckCircle size={20} />
                       <div>
                         <strong>Resolved</strong>
                         <p>This violation was resolved on {selectedViolation.resolutionDate}.</p>
                       </div>
                     </div>
                   )}
                </div>

                <div className="detail-section">
                  <label>Violation Type</label>
                  <h3>{selectedViolation.type} ({selectedViolation.id})</h3>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Date & Time</label>
                    <p>{selectedViolation.date} at {selectedViolation.time}</p>
                  </div>
                  <div className="detail-item">
                    <label>Location</label>
                    <p>{selectedViolation.location}</p>
                  </div>
                  <div className="detail-item">
                    <label>Reported By</label>
                    <p>{selectedViolation.reportedBy}</p>
                  </div>
                  <div className="detail-item">
                    <label>Severity</label>
                    <p>{getSeverityBadge(selectedViolation.severity)}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <label>Incident Description</label>
                  <div className="description-box">
                    <p>{selectedViolation.description}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <label>Required Penalty / Action</label>
                  <div className="penalty-box">
                    <p>{selectedViolation.penalty}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyViolations;
