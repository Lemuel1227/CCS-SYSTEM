import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import './CourseManagement.css';

const DEFAULT_COURSES = [
  { id: '1', code: 'CCS101', desc: 'Introduction to Computing', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '2', code: 'CCS102', desc: 'Computer Programming 1', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '3', code: 'ETH101', desc: 'Ethics', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '4', code: 'MAT101', desc: 'Mathematics in the Modern World', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '5', code: 'NSTP1', desc: 'National Service Training Program 1', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '6', code: 'PED101', desc: 'Physical Education 1', units: 2, prereq: '--', year: 1, sem: 1 },
  { id: '7', code: 'PSY100', desc: 'Understanding the Self', units: 3, prereq: '--', year: 1, sem: 1 },
  { id: '8', code: 'CCS103', desc: 'Computer Programming 2', units: 3, prereq: 'CCS102', year: 1, sem: 2 },
  { id: '9', code: 'CCS104', desc: 'Discrete Structures 1', units: 3, prereq: 'MAT101', year: 1, sem: 2 },
  { id: '10', code: 'CCS105', desc: 'Human Computer Interaction 1', units: 3, prereq: 'CCS101', year: 1, sem: 2 },
  { id: '11', code: 'CCS106', desc: 'Social and Professional Issues', units: 3, prereq: 'ETH101', year: 1, sem: 2 },
  { id: '12', code: 'COM101', desc: 'Purposive Communication', units: 3, prereq: '--', year: 1, sem: 2 },
  { id: '13', code: 'GAD101', desc: 'Gender and Development', units: 3, prereq: '--', year: 1, sem: 2 },
  { id: '14', code: 'NSTP2', desc: 'National Service Training Program 2', units: 3, prereq: 'NSTP1', year: 1, sem: 2 },
  { id: '15', code: 'PED102', desc: 'Physical Education 2', units: 2, prereq: 'PED101', year: 1, sem: 2 }
];

const CourseManagement = () => {
  const [courses, setCourses] = useState(() => {
    try {
      const savedCourses = localStorage.getItem('ccs_courses');
      if (savedCourses) {
        return JSON.parse(savedCourses);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('ccs_courses', JSON.stringify(DEFAULT_COURSES));
    return DEFAULT_COURSES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    desc: '',
    units: 3,
    prereq: '--',
    year: 1,
    sem: 1
  });

  const saveToStorage = (updatedCourses) => {
    setCourses(updatedCourses);
    localStorage.setItem('ccs_courses', JSON.stringify(updatedCourses));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'units' || name === 'year' || name === 'sem' ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      const updated = courses.map(c => c.id === editingCourse.id ? { ...formData, id: c.id } : c);
      saveToStorage(updated);
    } else {
      const newCourse = { ...formData, id: window.crypto.randomUUID() };
      saveToStorage([...courses, newCourse]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const updated = courses.filter(c => c.id !== id);
      saveToStorage(updated);
    }
  };

  const openModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({ code: '', desc: '', units: 3, prereq: '--', year: 1, sem: 1 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.sem !== b.sem) return a.sem - b.sem;
    return a.code.localeCompare(b.code);
  });

  return (
    <div className="course-management-container">
      <div className="page-header">
        <div>
          <h2>Course Management</h2>
          <p>Manage academic courses, prerequisites, and curriculum scheduling.</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={20} />
          Add Course
        </button>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search course code or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Description</th>
              <th>Units</th>
              <th>Prerequisites</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <tr key={course.id}>
                  <td className="fw-medium">{course.code}</td>
                  <td>{course.desc}</td>
                  <td>{course.units}</td>
                  <td>{course.prereq}</td>
                  <td>Year {course.year}</td>
                  <td>Sem {course.sem}</td>
                  <td className="actions-cell">
                    <button className="action-btn edit" onClick={() => openModal(course)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(course.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">No courses found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group half">
                  <label>Course Code</label>
                  <input type="text" name="code" value={formData.code} onChange={handleInputChange} required placeholder="e.g. CCS101" />
                </div>
                <div className="form-group half">
                  <label>Units</label>
                  <input type="number" name="units" value={formData.units} onChange={handleInputChange} required min="1" max="6" />
                </div>
              </div>
              <div className="form-group">
                <label>Course Description</label>
                <input type="text" name="desc" value={formData.desc} onChange={handleInputChange} required placeholder="e.g. Introduction to Computing" />
              </div>
              <div className="form-group">
                <label>Prerequisite(s) (Use '--' for none)</label>
                <input type="text" name="prereq" value={formData.prereq} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Year Level</label>
                  <select name="year" value={formData.year} onChange={handleInputChange}>
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Semester</label>
                  <select name="sem" value={formData.sem} onChange={handleInputChange}>
                    <option value={1}>1st Semester</option>
                    <option value={2}>2nd Semester</option>
                    <option value={3}>Summer</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-submit">{editingCourse ? 'Save Changes' : 'Add Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;