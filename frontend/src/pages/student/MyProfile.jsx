import React, { useState } from 'react';
import { UserCircle, BookOpen, Phone, HeartPulse, Award, Shield, Edit, Camera, X } from 'lucide-react';
import './MyProfile.css';

const MyProfile = () => {
  const initialStudent = {
    id: '4',
    studentNo: '2023-0004',
    firstName: 'Harvy',
    middleName: 'A.',
    lastName: 'Penaflor',
    gender: 'Male',
    yearLevel: "4th Year",
    program: "BSIT",
    academicTrack: 'Web Development',
    section: "IT-A",
    academicStatus: 'Regular',
    height: '175',
    weight: '70',
    email: 'harvy.penaflor@pnc.edu.ph',
    contactNumber: '09174445555',
    emergencyName: 'Elena Penaflor',
    emergencyNumber: '09184445555',
    emergencyRelation: 'Mother',
    achievements: 'Hackathon Winner',
    skills: 'JavaScript, React, Node.js',
    interests: 'Full-stack Development, UI/UX',
    profileImage: ''
  };

  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('ccs_my_profile');
    if (saved) return JSON.parse(saved);
    return initialStudent;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const handleEditClick = () => {
    setFormData(student);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setStudent(formData);
    localStorage.setItem('ccs_my_profile', JSON.stringify(formData));
    setIsEditing(false);
  };

  const fullName = student.firstName + ' ' + (student.middleName ? student.middleName + ' ' : '') + student.lastName;
  const initials = (student.firstName?.charAt(0) || '') + (student.lastName?.charAt(0) || '');

  return (
    <div className="profile-container">
      <div className="profile-header-banner">
        <div className="profile-banner-content">
          <div className="profile-avatar-wrapper">
            {student.profileImage ? (
              <img src={student.profileImage} alt={fullName} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {initials}
              </div>
            )}
            <button className="profile-edit-avatar-btn" title="Update Profile Picture">
              <Camera size={16} />
            </button>
          </div>
          <div className="profile-header-details">
            <h2>{fullName}</h2>
            <p className="profile-student-no">{student.studentNo}</p>
            <div className="profile-badges">
              <span className="profile-badge program-badge">{student.program}</span>
              <span className="profile-badge status-badge">{student.academicStatus}</span>
            </div>
          </div>
          <button className="profile-edit-btn" onClick={handleEditClick}>
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <UserCircle className="profile-card-icon" />
            <h3>Basic Information</h3>
          </div>
          <div className="profile-card-body">
            <div className="profile-info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{fullName}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{student.gender}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Student No.</span>
              <span className="info-value">{student.studentNo}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <BookOpen className="profile-card-icon" />
            <h3>Academic Information</h3>
          </div>
          <div className="profile-card-body">
            <div className="profile-info-item">
              <span className="info-label">Program</span>
              <span className="info-value">{student.program}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Year Level & Section</span>
              <span className="info-value">{student.yearLevel} � {student.section}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Academic Track</span>
              <span className="info-value">{student.academicTrack || 'N/A'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Academic Status</span>
              <span className="info-value">{student.academicStatus}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <Phone className="profile-card-icon" />
            <h3>Contact Information</h3>
          </div>
          <div className="profile-card-body">
            <div className="profile-info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">{student.email}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Contact Number</span>
              <span className="info-value">{student.contactNumber}</span>
            </div>
            <div className="profile-info-divider"></div>
            <div className="profile-info-item">
              <span className="info-label">Emergency Contact</span>
              <span className="info-value">{student.emergencyName} ({student.emergencyRelation})</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Emergency Number</span>
              <span className="info-value">{student.emergencyNumber}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <HeartPulse className="profile-card-icon" />
            <h3>Physical Stats</h3>
          </div>
          <div className="profile-card-body profile-stats-body">
            <div className="stat-box">
              <span className="stat-value">{student.height ? `${student.height} cm` : '--'}</span>
              <span className="stat-label">Height</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{student.weight ? `${student.weight} kg` : '--'}</span>
              <span className="stat-label">Weight</span>
            </div>
          </div>
        </div>

        <div className="profile-card full-width">
          <div className="profile-card-header">
            <Award className="profile-card-icon" />
            <h3>Skills, Interests & Achievements</h3>
          </div>
          <div className="profile-card-body three-cols">
            <div className="profile-info-flex">
              <span className="info-label-block">Achievements</span>
              <div className="info-box-value">{student.achievements || 'No achievements recorded'}</div>
            </div>
            <div className="profile-info-flex">
              <span className="info-label-block">Skills</span>
              <div className="info-tags">
                {student.skills ? student.skills.split(',').map((skill, i) => (
                  <span key={i} className="info-tag">{skill.trim()}</span>
                )) : <span className="info-text-muted">No skills recorded</span>}
              </div>
            </div>
            <div className="profile-info-flex">
              <span className="info-label-block">Interests</span>
              <div className="info-tags">
                {student.interests ? student.interests.split(',').map((interest, i) => (
                  <span key={i} className="info-tag">{interest.trim()}</span>
                )) : <span className="info-text-muted">No interests recorded</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <h2>Edit Profile</h2>
              <button className="profile-close-btn" onClick={handleCloseEdit}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="profile-modal-content">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  <input type="text" name="middleName" value={formData.middleName || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" name="height" value={formData.height || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input type="text" name="emergencyName" value={formData.emergencyName || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Relation</label>
                  <input type="text" name="emergencyRelation" value={formData.emergencyRelation || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Emergency Number</label>
                  <input type="text" name="emergencyNumber" value={formData.emergencyNumber || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Achievements</label>
                  <textarea name="achievements" value={formData.achievements || ''} onChange={handleInputChange} rows={2} />
                </div>
                <div className="form-group full-width">
                  <label>Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Interests (comma separated)</label>
                  <input type="text" name="interests" value={formData.interests || ''} onChange={handleInputChange} />
                </div>
              </div>
              <div className="profile-modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseEdit}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

