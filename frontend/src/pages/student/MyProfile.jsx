import React, { useState, useEffect, useMemo } from 'react';
import { UserCircle, BookOpen, Phone, HeartPulse, Award, Shield, Edit, Camera, X } from 'lucide-react';
import axios from 'axios';
import './MyProfile.css';

const parseListField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(', ');
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ');
  }

  return '';
};

const normalizeProfileResponse = (profile, role) => {
  if (role === 'Admin') {
    return {
      id: profile._id || profile.id,
      studentNo: profile.user?.userId || '',
      firstName: profile.fullName || '',
      middleName: '',
      lastName: '',
      gender: 'N/A',
      yearLevel: 'N/A',
      program: 'Administration',
      academicTrack: profile.position || '',
      section: 'N/A',
      academicStatus: 'Staff',
      height: '',
      weight: '',
      email: profile.user?.email || '',
      contactNumber: profile.contactNumber || '',
      emergencyName: 'N/A',
      emergencyNumber: 'N/A',
      emergencyRelation: 'N/A',
      achievements: profile.achievements || '',
      skills: parseListField(profile.skills),
      interests: parseListField(profile.interests),
      profileImage: profile.profileImage || ''
    };
  }

  if (role === 'Faculty') {
    return {
      id: profile._id || profile.id,
      studentNo: profile.employeeIdNumber || '',
      firstName: profile.firstName || '',
      middleName: profile.middleName || '',
      lastName: profile.lastName || '',
      gender: profile.gender || 'N/A',
      yearLevel: 'N/A',
      program: profile.department || 'Faculty',
      academicTrack: profile.position || '',
      section: 'N/A',
      academicStatus: 'Active',
      height: '',
      weight: '',
      email: profile.user?.email || '',
      contactNumber: profile.contactNumber || '',
      emergencyName: '',
      emergencyNumber: '',
      emergencyRelation: '',
      achievements: profile.achievements || '',
      skills: parseListField(profile.skills),
      interests: parseListField(profile.interests),
      profileImage: profile.profileImage || ''
    };
  }

  return {
    id: profile._id || profile.id,
    studentNumber: profile.studentNumber || '',
    studentNo: profile.studentNumber || '',
    firstName: profile.firstName || '',
    middleName: profile.middleName || '',
    lastName: profile.lastName || '',
    gender: profile.gender || 'N/A',
    yearLevel: profile.yearLevel || 'N/A',
    program: profile.program || 'N/A',
    academicTrack: profile.academicTrack || '',
    section: profile.section || '',
    academicStatus: profile.academicStatus ? profile.academicStatus.charAt(0).toUpperCase() + profile.academicStatus.slice(1) : 'Regular',
    height: profile.height || '',
    weight: profile.weight || '',
    email: profile.user?.email || '',
    contactNumber: profile.contactNumber || '',
    emergencyName: profile.emergencyContactName || '',
    emergencyNumber: profile.emergencyContactNumber || '',
    emergencyRelation: profile.emergencyContactRelation || '',
    yearGraduated: profile.yearGraduated || '',
    achievements: profile.achievements || '',
    skills: parseListField(profile.skills),
    interests: parseListField(profile.interests),
    profileImage: profile.profileImage || ''
  };
};

const MyProfile = ({ studentData = null, readOnly = false }) => {
  const rawRole = localStorage.getItem('userRole') || 'student';
  const userRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

  const defaultProfiles = {
    Student: {
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
    },
    Faculty: {
      id: '1',
      studentNo: 'FAC-2015-01',
      firstName: 'Dr. John',
      middleName: 'M.',
      lastName: 'Doe',
      gender: 'Male',
      yearLevel: "N/A",
      program: "Faculty",
      academicTrack: 'Computer Science',
      section: "N/A",
      academicStatus: 'Tenured',
      height: '180',
      weight: '75',
      email: 'john.doe@pnc.edu.ph',
      contactNumber: '09171234567',
      emergencyName: 'Jane Doe',
      emergencyNumber: '09181234567',
      emergencyRelation: 'Spouse',
      achievements: 'Research Grant 2023',
      skills: 'Python, Machine Learning, Data Science',
      interests: 'AI, Curriculum Development',
      profileImage: ''
    },
    Admin: {
      id: '99',
      studentNo: 'ADM-001',
      firstName: 'System',
      middleName: '',
      lastName: 'Administrator',
      gender: 'N/A',
      yearLevel: "N/A",
      program: "Administration",
      academicTrack: 'IT Infrastructure',
      section: "N/A",
      academicStatus: 'Staff',
      height: 'N/A',
      weight: 'N/A',
      email: 'admin@pnc.edu.ph',
      contactNumber: '09999999999',
      emergencyName: 'N/A',
      emergencyNumber: 'N/A',
      emergencyRelation: 'N/A',
      achievements: 'System Uptime 99.9%',
      skills: 'Sysadmin, DevOps, Security',
      interests: 'Infrastructure, Optimization',
      profileImage: ''
    }
  };

  const initialStudent = useMemo(() => {
    return defaultProfiles[userRole] || defaultProfiles.Student;
  }, [userRole]);

  const [localStudent, setLocalStudent] = useState(initialStudent);

  const student = studentData || localStudent;
  const setStudent = studentData ? () => {} : setLocalStudent;
  const [loadError, setLoadError] = useState('');

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
    const normalizedSkills = parseListField(formData.skills);
    const normalizedInterests = parseListField(formData.interests);
    const normalizedFormData = {
      ...formData,
      skills: normalizedSkills,
      interests: normalizedInterests
    };

    if (studentData) {
      setStudent(normalizedFormData);
      setIsEditing(false);
      return;
    }

    const payload = userRole === 'Student' ? {
        studentNumber: formData.studentNumber || formData.studentNo,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        yearLevel: formData.yearLevel,
        program: formData.program,
        academicStatus: (formData.academicStatus || '').toLowerCase(),
        height: formData.height,
        weight: formData.weight,
        contactNumber: formData.contactNumber,
        emergencyContactName: formData.emergencyName,
        emergencyContactNumber: formData.emergencyNumber,
        emergencyContactRelation: formData.emergencyRelation,
        yearGraduated: formData.yearGraduated,
        email: formData.email,
        achievements: normalizedFormData.achievements,
        skills: normalizedSkills,
        interests: normalizedInterests
      } : userRole === 'Faculty' ? {
        employeeIdNumber: formData.studentNumber || formData.studentNo,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        department: formData.program,
        position: formData.academicTrack,
        contactNumber: formData.contactNumber,
        email: formData.email,
        achievements: normalizedFormData.achievements,
        skills: normalizedSkills,
        interests: normalizedInterests
      } : {
        fullName: `${formData.firstName} ${formData.middleName ? `${formData.middleName} ` : ''}${formData.lastName}`.trim(),
        position: formData.academicTrack,
        contactNumber: formData.contactNumber,
        email: formData.email,
        achievements: normalizedFormData.achievements,
        skills: normalizedSkills,
        interests: normalizedInterests
      };

    axios.put('/api/profile/me', payload).then((response) => {
      const mapped = normalizeProfileResponse(response.data, userRole);
      setStudent(mapped);
      setLocalStudent(mapped);
      setIsEditing(false);
    }).catch((err) => {
      console.error('Failed to save profile:', err);
      setLoadError(err.response?.data?.message || 'Failed to save profile.');
    });
  };

  useEffect(() => {
    if (studentData) return;
    axios.get('/api/profile/me').then((response) => {
      const mapped = normalizeProfileResponse(response.data, userRole);
      setLocalStudent(mapped);
    }).catch((err) => {
      console.error('Failed to load profile:', err);
      setLoadError('Failed to load profile from server.');
    });
  }, [studentData, userRole]);

  const fullName = student.firstName + ' ' + (student.middleName ? student.middleName + ' ' : '') + student.lastName;
  const initials = (student.firstName?.charAt(0) || '') + (student.lastName?.charAt(0) || '');
  const studentNumber = student.studentNumber || student.studentNo;

  return (
    <div className="profile-container">
      {loadError && (
        <div style={{ marginBottom: '16px', color: '#b91c1c' }}>
          {loadError}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <UserCircle size={32} color="var(--primary-color)" />
        <h1 style={{ margin: 0 }}>My Profile</h1>
      </div>
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
            {!readOnly && (
              <button className="profile-edit-avatar-btn" title="Update Profile Picture">
                <Camera size={16} />
              </button>
            )}
          </div>
          <div className="profile-header-details">
            <h2>{fullName}</h2>
            <p className="profile-student-no">{studentNumber}</p>
            <div className="profile-badges">
              <span className="profile-badge program-badge">{student.program || "Student"}</span>
              <span className="profile-badge status-badge">{student.academicStatus || "Active"}</span>
            </div>
          </div>
          {!readOnly && (
            <button className="profile-edit-btn" onClick={handleEditClick}>       
              <Edit size={16} />
              Edit Profile
            </button>
          )}
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
              <span className="info-label">{userRole === 'Faculty' ? 'Employee No.' : 'Student No.'}</span>
              <span className="info-value">{studentNumber}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <BookOpen className="profile-card-icon" />
            <h3>{userRole === 'Faculty' ? 'Employment Information' : 'Academic Information'}</h3>
          </div>
          <div className="profile-card-body">
            <div className="profile-info-item">
              <span className="info-label">{userRole === 'Faculty' ? 'Department' : 'Program'}</span>
              <span className="info-value">{student.program}</span>
            </div>
            {userRole !== 'Faculty' && (
              <div className="profile-info-item">
                <span className="info-label">Year Level & Section</span>
                <span className="info-value">{student.yearLevel} - {student.section}</span>
              </div>
            )}
            <div className="profile-info-item">
              <span className="info-label">{userRole === 'Faculty' ? 'Position' : 'Academic Track'}</span>
              <span className="info-value">{student.academicTrack || 'N/A'}</span>
            </div>
            {userRole !== 'Faculty' && (
              <div className="profile-info-item">
                <span className="info-label">Academic Status</span>
                <span className="info-value">{student.academicStatus}</span>
              </div>
            )}
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
            {userRole !== 'Faculty' && (
              <>
                <div className="profile-info-divider"></div>
                <div className="profile-info-item">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">{student.emergencyName} ({student.emergencyRelation})</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Emergency Number</span>
                  <span className="info-value">{student.emergencyNumber}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {userRole !== 'Faculty' && (
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
        )}

        {userRole !== 'Faculty' && (
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
        )}
      </div>

      {isEditing && (
        <div className="profile-modal-overlay">
          <form className="profile-modal" onSubmit={handleSave}>
            <div className="profile-modal-header">
              <h2>Edit Profile</h2>
              <button type="button" className="profile-close-btn" onClick={handleCloseEdit}>
                <X size={20} />
              </button>
            </div>
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
                {userRole !== 'Faculty' && (
                  <>
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
                      <input type="text" name="skills" value={formData.skills || ''} onChange={handleInputChange} placeholder="React, Python, UI/UX" />
                    </div>
                    <div className="form-group full-width">
                      <label>Interests (comma separated)</label>
                      <input type="text" name="interests" value={formData.interests || ''} onChange={handleInputChange} placeholder="AI, Web Development" />
                    </div>
                  </>
                )}
              </div>
              <div className="profile-modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseEdit}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
