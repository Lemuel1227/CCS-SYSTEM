import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, Filter, Users, Eye, LayoutGrid, List, BookOpen, Calendar as CalendarIcon, Mail, Phone, Code } from 'lucide-react';
import './StudentManagement.css';

const DEFAULT_FORM_DATA = {
  studentNo: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: 'Male',
  yearLevel: '1st Year',
  program: "BSIT",
  academicTrack: '',
  section: '',
  academicStatus: 'Regular',
  height: '',
  weight: '',
  email: '',
  contactNumber: '',
  emergencyName: '',
  emergencyNumber: '',
  emergencyRelation: '',
  yearGraduated: '',
  profileImage: '',
  achievements: '',
  skills: '',
  interests: ''
};

const INITIAL_STUDENTS = [
  {
    id: '1',
    studentNo: '2023-0001',
    firstName: 'Carl Lawrence',
    middleName: '',
    lastName: 'Antioquia',
    gender: 'Male',
    yearLevel: "4th Year",
    program: "BSIT",
    academicTrack: 'Software Engineering',
    section: "IT-A",
    academicStatus: 'Regular',
    height: '170',
    weight: '65',
    email: 'carl.antioquia@pnc.edu.ph',
    contactNumber: '09171112222',
    emergencyName: 'Maria Antioquia',
    emergencyNumber: '09181112222',
    emergencyRelation: 'Mother',
    yearGraduated: '',
    profileImage: '',
    achievements: 'Dean\'s Lister (2023)',
    skills: 'Java, Python, C++',
    interests: 'Software Development'
  },
  {
    id: '2',
    studentNo: '2023-0002',
    firstName: 'Lemuel John',
    middleName: 'O.',
    lastName: 'Ellasus',
    gender: 'Male',
    yearLevel: "4th Year",
    program: "BSIT",
    academicTrack: 'Data Science',
    section: "IT-A",
    academicStatus: 'Regular',
    height: '168',
    weight: '62',
    email: 'lemuel.ellasus@pnc.edu.ph',
    contactNumber: '09172223333',
    emergencyName: 'Susan Ellasus',
    emergencyNumber: '09182223333',
    emergencyRelation: 'Mother',
    yearGraduated: '',
    profileImage: '',
    achievements: '',
    skills: 'Python, R, Machine Learning',
    interests: 'Data Analytics, AI'
  },
  {
    id: '3',
    studentNo: '2023-0003',
    firstName: 'Ma. Cecile',
    middleName: 'D.',
    lastName: 'Parungan',
    gender: 'Female',
    yearLevel: "4th Year",
    program: "BSIT",
    academicTrack: 'Information Systems',
    section: "IT-A",
    academicStatus: 'Regular',
    height: '160',
    weight: '55',
    email: 'macecile.parungan@pnc.edu.ph',
    contactNumber: '09173334444',
    emergencyName: 'Robert Parungan',
    emergencyNumber: '09183334444',
    emergencyRelation: 'Father',
    yearGraduated: '',
    profileImage: '',
    achievements: '',
    skills: 'SQL, Python, Web Development',
    interests: 'Database Management'
  },
  {
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
    yearGraduated: '',
    profileImage: '',
    achievements: 'Hackathon Winner',
    skills: 'JavaScript, React, Node.js',
    interests: 'Full-stack Development, UI/UX'
  }
];

const normalizeStudent = (student) => {
  if (student.firstName) {
    return {
      ...DEFAULT_FORM_DATA,
      ...student
    };
  }

  const fullName = student.fullName || '';
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

  return {
    ...DEFAULT_FORM_DATA,
    id: student.id || Date.now().toString(),
    studentNo: student.studentNo || '',
    firstName,
    middleName,
    lastName,
    yearLevel: student.yearLevel || '1st Year',
    program: student.course || 'BSCS',
    section: student.section || '',
    academicStatus: student.status === 'Inactive' ? 'Irregular' : 'Regular',
    email: student.email || ''
  };
};

const StudentManagement = () => {
  const [students, setStudents] = useState(() => {
    try {
      const stored = localStorage.getItem('ccs_students_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = parsed.map(normalizeStudent);
        localStorage.setItem('ccs_students_v3', JSON.stringify(normalized));
        return normalized;
      }
      localStorage.setItem('ccs_students_v3', JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    } catch {
      localStorage.setItem('ccs_students_v3', JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const availableSkills = useMemo(() => {
    const skillsSet = new Set();
    students.forEach(s => {
      if (s.skills) {
        s.skills.split(',').forEach(skill => {
          const trimmed = skill.trim();
          if (trimmed) skillsSet.add(trimmed);
        });
      }
    });
    return Array.from(skillsSet).sort();
  }, [students]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const saveToStorage = (updatedStudents) => {
    setStudents(updatedStudents);
    localStorage.setItem('ccs_students_v3', JSON.stringify(updatedStudents));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const openDetailModal = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      const updated = students.map((student) =>
        student.id === editingStudent.id ? { ...formData, id: student.id } : student
      );
      saveToStorage(updated);
    } else {
      const newStudent = { ...formData, id: Date.now().toString() };
      saveToStorage([...students, newStudent]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const updated = students.filter((student) => student.id !== id);
      saveToStorage(updated);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.trim();
      const matchesSearch =
        (student.studentNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.section || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.program || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || student.academicStatus === statusFilter;
      
      const studentSkillsList = student.skills ? student.skills.split(',').map(s => s.trim().toLowerCase()) : [];
      const matchesSkill = selectedSkills.length === 0 || 
        selectedSkills.some(skill => studentSkillsList.includes(skill.toLowerCase()));

      return matchesSearch && matchesStatus && matchesSkill;
    });
  }, [students, searchQuery, statusFilter, selectedSkills]);

  return (
    <div className="student-management-container">
      <div className="page-header">
        <div>
          <h2>Student Management</h2>
          <p>Manage student profiles, section assignments, and enrollment status.</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="sm-controls-bar">
        <div className="sm-search-box">
          <Search size={18} className="sm-search-icon" />
          <input
            type="text"
            placeholder="Search by student no., name, section, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sm-filter-box">
          <Filter size={18} className="sm-filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Academic Status</option>
            <option value="Regular">Regular</option>
            <option value="Irregular">Irregular</option>
          </select>
        </div>

        <div className="sm-dropdown-container">
          <button 
            className="sm-dropdown-btn" 
            onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
          >
            <Code size={18} className="sm-filter-icon" />
            <span>
              {selectedSkills.length === 0 
                ? 'Filter by Skills' 
                : `Skills (${selectedSkills.length})`}
            </span>
          </button>
          
          {isSkillDropdownOpen && (
            <div className="sm-dropdown-menu">
              {availableSkills.length > 0 ? (
                availableSkills.map(skill => (
                  <label key={skill} className="sm-dropdown-item">
                    <input 
                      type="checkbox" 
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    {skill}
                  </label>
                ))
              ) : (
                <div className="sm-dropdown-empty">No skills available</div>
              )}
            </div>
          )}
        </div>

        <div className="sm-view-toggle">
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
        <div className="sm-table-container">
          <table className="sm-students-table">
            <thead>
              <tr>
                <th>Student No.</th>
                <th>Name</th>
                <th>Program</th>
                <th>Year / Section</th>
                <th>Academic Status</th>
                <th>Contact</th>
                <th>Emergency Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="sm-table-cell-content">
                        <div className="fw-medium">{student.studentNo}</div>
                      </div>
                    </td>
                    <td>
                      <div className="sm-table-cell-content">
                        <div>{`${student.lastName}, ${student.firstName}${student.middleName ? ` ${student.middleName}` : ''}`}</div>
                      </div>
                    </td>
                    <td>
                      <div className="sm-table-cell-content">
                        <div>{student.program}</div>
                      </div>
                    </td>
                    <td>
                      <div className="sm-table-cell-content">
                        <div>{`${student.yearLevel} • ${student.section || 'N/A'}`}</div>
                      </div>
                    </td>
                    <td>
                      <div className="sm-table-cell-content">
                        <div>
                          <span className={`sm-status-badge ${student.academicStatus.toLowerCase()}`}>
                            {student.academicStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sm-table-cell-content">
                        <div>{student.contactNumber || '-'}</div>
                        <div className="sm-cell-subtext">{student.email || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="sm-table-cell-content">
                        <div>{student.emergencyName || '-'}</div>
                        <div className="sm-cell-subtext">{student.emergencyNumber || '-'}</div>
                      </div>
                    </td>
                    <td className="sm-actions-cell">
                      <div className="sm-actions-group">
                        <button className="sm-action-btn view" onClick={() => openDetailModal(student)} title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="sm-action-btn edit" onClick={() => openModal(student)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="sm-action-btn delete" onClick={() => handleDelete(student.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="sm-empty-state">
                    <Users size={20} /> No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sm-grid-container">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div className="sm-student-card" key={student.id}>
                <div className="sm-card-banner">
                  <span className={`sm-status-badge ${student.academicStatus.toLowerCase()}`}>
                    {student.academicStatus}
                  </span>
                </div>
                <div className="sm-card-content">
                  <div className="sm-card-user-info">
                    <div className="sm-card-avatar">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </div>
                    <div className="sm-card-user-text">
                      <h3 className="sm-card-name">{`${student.lastName}, ${student.firstName}`}</h3>
                      <p className="sm-card-student-no">{student.studentNo}</p>
                    </div>
                  </div>
                  <div className="sm-card-body">
                    <div className="sm-card-detail">
                      <div className="sm-detail-label-group">
                        <BookOpen size={14} className="sm-detail-icon" />
                        <span className="sm-detail-label">Program:</span>
                      </div>
                      <span className="sm-detail-value fw-medium">{student.program}</span>
                    </div>
                    <div className="sm-card-detail">
                      <div className="sm-detail-label-group">
                        <CalendarIcon size={14} className="sm-detail-icon" />
                        <span className="sm-detail-label">Year/Section:</span>
                      </div>
                      <span className="sm-detail-value fw-medium">{`${student.yearLevel} ${student.section ? `• ${student.section}` : ''}`}</span>
                    </div>
                    <div className="sm-card-detail">
                      <div className="sm-detail-label-group">
                        <Mail size={14} className="sm-detail-icon" />
                        <span className="sm-detail-label">Email:</span>
                      </div>
                      <span className="sm-detail-value truncate" title={student.email || '-'}>{student.email || '-'}</span>
                    </div>
                    <div className="sm-card-detail">
                      <div className="sm-detail-label-group">
                        <Phone size={14} className="sm-detail-icon" />
                        <span className="sm-detail-label">Contact:</span>
                      </div>
                      <span className="sm-detail-value">{student.contactNumber || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="sm-card-footer">
                  <button className="sm-action-btn view" onClick={() => openDetailModal(student)} title="View Details">
                    <Eye size={16} /> View
                  </button>
                  <button className="sm-action-btn edit" onClick={() => openModal(student)} title="Edit">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="sm-action-btn delete" onClick={() => handleDelete(student.id)} title="Delete">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="sm-empty-state">
              <Users size={20} /> No students found matching your criteria.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <h4 className="form-section-title">Basic Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Student Number</label>
                  <input
                    type="text"
                    name="studentNo"
                    value={formData.studentNo}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 2026-0001"
                  />
                </div>
                <div className="form-group half">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
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
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-group">
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

              <h4 className="form-section-title">Academic Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Program</label>
                  <select name="program" value={formData.program} onChange={handleInputChange}>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIT">BSIT</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Year Level</label>
                  <select name="yearLevel" value={formData.yearLevel} onChange={handleInputChange}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="e.g. CS2A"
                  />
                </div>
                <div className="form-group half">
                  <label>Academic Track</label>
                  <input
                    type="text"
                    name="academicTrack"
                    value={formData.academicTrack}
                    onChange={handleInputChange}
                    placeholder="Optional track"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Academic Status</label>
                  <select name="academicStatus" value={formData.academicStatus} onChange={handleInputChange}>
                    <option value="Regular">Regular</option>
                    <option value="Irregular">Irregular</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Year Graduated</label>
                  <input
                    type="number"
                    name="yearGraduated"
                    value={formData.yearGraduated}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <h4 className="form-section-title">Physical Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group half">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    min="1"
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

              <div className="form-row">
                <div className="form-group half">
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Emergency Contact Number</label>
                  <input
                    type="text"
                    name="emergencyNumber"
                    value={formData.emergencyNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Emergency Contact Relation</label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Mother"
                  />
                </div>
                <div className="form-group half">
                  <label>Profile Image Path</label>
                  <input
                    type="text"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <h4 className="form-section-title">Additional Information</h4>
              <div className="form-row">
                <div className="form-group full">
                  <label>Achievements</label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    placeholder="e.g. Dean's Lister, Hackathon Winner"
                    rows="2"
                  ></textarea>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Python, UI/UX"
                  />
                </div>
                <div className="form-group half">
                  <label>Interests</label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g. AI, Cyber Security"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedStudent && (
        <div className="sm-detail-overlay" onClick={closeDetailModal}>
          <div className="sm-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-detail-header">
              <div>
                <h3>Student Details</h3>
                <p>{selectedStudent.studentNo}</p>
              </div>
              <button className="close-btn" onClick={closeDetailModal}>
                <X size={20} />
              </button>
            </div>

            <div className="sm-detail-body">
              <div className="sm-detail-section">
                <h4>Basic Information</h4>
                <div className="sm-detail-grid">
                  <div className="sm-detail-item"><span>Full Name</span><strong>{`${selectedStudent.lastName}, ${selectedStudent.firstName}${selectedStudent.middleName ? ` ${selectedStudent.middleName}` : ''}`}</strong></div>
                  <div className="sm-detail-item"><span>Gender</span><strong>{selectedStudent.gender || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Student Number</span><strong>{selectedStudent.studentNo || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Year Graduated</span><strong>{selectedStudent.yearGraduated || 'N/A'}</strong></div>
                </div>
              </div>

              <div className="sm-detail-section">
                <h4>Academic Information</h4>
                <div className="sm-detail-grid">
                  <div className="sm-detail-item"><span>Program</span><strong>{selectedStudent.program || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Year Level</span><strong>{selectedStudent.yearLevel || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Section</span><strong>{selectedStudent.section || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Academic Track</span><strong>{selectedStudent.academicTrack || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Academic Status</span><strong>{selectedStudent.academicStatus || 'N/A'}</strong></div>
                </div>
              </div>

              <div className="sm-detail-section">
                <h4>Physical & Contact</h4>
                <div className="sm-detail-grid">
                  <div className="sm-detail-item"><span>Height</span><strong>{selectedStudent.height ? `${selectedStudent.height} cm` : 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Weight</span><strong>{selectedStudent.weight ? `${selectedStudent.weight} kg` : 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Email</span><strong>{selectedStudent.email || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Contact Number</span><strong>{selectedStudent.contactNumber || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Emergency Contact Name</span><strong>{selectedStudent.emergencyName || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Emergency Contact Number</span><strong>{selectedStudent.emergencyNumber || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Emergency Relation</span><strong>{selectedStudent.emergencyRelation || 'N/A'}</strong></div>
                  <div className="sm-detail-item"><span>Profile Image Path</span><strong>{selectedStudent.profileImage || 'N/A'}</strong></div>
                </div>
              </div>

              <div className="sm-detail-section">
                <h4>Skills, Interests & Achievements</h4>
                <div className="sm-detail-grid">
                  <div className="sm-detail-item" style={{ gridColumn: '1 / -1' }}><span>Achievements</span><strong>{selectedStudent.achievements || 'None recorded'}</strong></div>
                  <div className="sm-detail-item"><span>Skills</span><strong>{selectedStudent.skills || 'None recorded'}</strong></div>
                  <div className="sm-detail-item"><span>Interests</span><strong>{selectedStudent.interests || 'None recorded'}</strong></div>
                </div>
              </div>
            </div>

            <div className="sm-detail-footer">
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

export default StudentManagement;

