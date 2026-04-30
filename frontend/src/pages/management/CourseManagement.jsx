import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, BookOpen, Download, ChevronDown, BarChart3, PieChart, FileText } from 'lucide-react';
import axios from 'axios';
import './CourseManagement.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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

const normalizeCourse = (course) => ({
  id: course._id || course.id,
  code: course.code || '',
  desc: course.desc || '',
  units: Number(course.units ?? 0),
  prereq: course.prereq || '--',
  year: Number(course.year ?? 1),
  sem: Number(course.sem ?? 1)
});

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState(null);
  const [yearFilter, setYearFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const exportMenuRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '',
    desc: '',
    units: 3,
    prereq: '--',
    year: 1,
    sem: 1
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get('/api/courses');
      setCourses(response.data.map(normalizeCourse));
    } catch (error) {
      console.error('Failed to load courses:', error);
      setErrorMessage('Failed to load courses from the server.');
      setCourses(DEFAULT_COURSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const saveToServer = (updatedCourses) => {
    setCourses(updatedCourses);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'units' || name === 'year' || name === 'sem' ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      axios.put(`/api/courses/${editingCourse.id}`, formData).then((response) => {
        const updated = courses.map((course) => course.id === editingCourse.id ? normalizeCourse(response.data) : course);
        saveToServer(updated);
        closeModal();
      }).catch((error) => {
        console.error('Failed to update course:', error);
        setErrorMessage(error.response?.data?.message || 'Failed to update course.');
      });
    } else {
      axios.post('/api/courses', formData).then((response) => {
        const newCourse = normalizeCourse(response.data);
        saveToServer([...courses, newCourse]);
        closeModal();
      }).catch((error) => {
        console.error('Failed to create course:', error);
        setErrorMessage(error.response?.data?.message || 'Failed to create course.');
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      axios.delete(`/api/courses/${id}`).then(() => {
        const updated = courses.filter((course) => course.id !== id);
        saveToServer(updated);
      }).catch((error) => {
        console.error('Failed to delete course:', error);
        setErrorMessage(error.response?.data?.message || 'Failed to delete course.');
      });
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

  // Filter courses early so it can be used in useMemo dependencies
  const filteredCourses = courses.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchYear = yearFilter === 'All' || c.year === parseInt(yearFilter);
    const matchSemester = semesterFilter === 'All' || c.sem === parseInt(semesterFilter);
    return matchSearch && matchYear && matchSemester;
  }).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.sem !== b.sem) return a.sem - b.sem;
    return a.code.localeCompare(b.code);
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Chart data calculations
  const unitsChartData = useMemo(() => {
    const counts = filteredCourses.reduce((acc, c) => {
      acc[c.units] = (acc[c.units] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }]
    };
  }, [filteredCourses]);

  const yearChartData = useMemo(() => {
    const counts = filteredCourses.reduce((acc, c) => {
      acc[`Year ${c.year}`] = (acc[`Year ${c.year}`] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts).sort(),
      datasets: [{ label: 'Courses by Year', data: Object.values(counts), backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316'], borderWidth: 0 }]
    };
  }, [filteredCourses]);

  const semesterChartData = useMemo(() => {
    const counts = filteredCourses.reduce((acc, c) => {
      const semLabel = c.sem === 1 ? '1st Sem' : c.sem === 2 ? '2nd Sem' : 'Summer';
      acc[semLabel] = (acc[semLabel] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{ label: 'Courses by Semester', data: Object.values(counts), backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6'], borderWidth: 0 }]
    };
  }, [filteredCourses]);

  const chartStats = useMemo(() => {
    const yearCounts = filteredCourses.reduce((acc, c) => {
      acc[`Year ${c.year}`] = (acc[`Year ${c.year}`] || 0) + 1;
      return acc;
    }, {});
    return {
      total: filteredCourses.length,
      totalUnits: filteredCourses.reduce((sum, c) => sum + c.units, 0),
      avgUnits: filteredCourses.length > 0 ? (filteredCourses.reduce((sum, c) => sum + c.units, 0) / filteredCourses.length).toFixed(1) : 0,
      years: Object.keys(yearCounts).length
    };
  }, [filteredCourses]);

  const openPreviewModal = (format) => {
    setPreviewFormat(format);
    setIsPreviewModalOpen(true);
    setShowExportMenu(false);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewFormat(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generatePDFReport = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text('Course Management Report', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Generated on: ${dateStr}`, pageWidth / 2, 22, { align: 'center' });

    const filters = [];
    if (yearFilter !== 'All') filters.push(`Year: ${yearFilter}`);
    if (semesterFilter !== 'All') filters.push(`Semester: ${semesterFilter}`);
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);

    if (filters.length > 0) {
      doc.setFontSize(9);
      doc.text(`Filters: ${filters.join(' | ')}`, 14, 28);
    }

    const tableData = filteredCourses.map(c => [
      c.code,
      c.desc,
      c.units,
      c.prereq,
      `Year ${c.year}`,
      c.sem === 1 ? '1st Sem' : c.sem === 2 ? '2nd Sem' : 'Summer'
    ]);

    autoTable(doc, {
      head: [['Course Code', 'Description', 'Units', 'Prerequisites', 'Year', 'Semester']],
      body: tableData,
      startY: filters.length > 0 ? 32 : 28,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 98, 255], textColor: 255, fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { cellWidth: 15 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 }
      }
    });

    doc.setFontSize(9);
    const finalY = doc.lastAutoTable?.finalY || 40;
    doc.text(`Total Records: ${filteredCourses.length} | Total Units: ${chartStats.totalUnits}`, 14, finalY + 8);

    doc.save(`course_report_${new Date().toISOString().split('T')[0]}.pdf`);
    closePreviewModal();
  };

  const generateExcelReport = () => {
    const data = filteredCourses.map(c => ({
      'Course Code': c.code,
      'Description': c.desc,
      'Units': c.units,
      'Prerequisites': c.prereq,
      'Year Level': `Year ${c.year}`,
      'Semester': c.sem === 1 ? '1st Semester' : c.sem === 2 ? '2nd Semester' : 'Summer'
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 15 }, { wch: 50 }, { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Course Report');

    XLSX.writeFile(wb, `course_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    closePreviewModal();
  };

  return (
    <div className="course-management-container">
      {errorMessage && <div className="empty-state" style={{ marginBottom: '16px', color: '#b91c1c', fontStyle: 'normal' }}>{errorMessage}</div>}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <BookOpen size={28} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Course Management</h2>
          </div>
          <p>Manage academic courses, prerequisites, and curriculum scheduling.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="export-dropdown" ref={exportMenuRef}>
            <button 
              className="export-btn" 
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={18} />
              Export Report
              <ChevronDown size={16} />
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={() => openPreviewModal('pdf')} className="export-option">
                  <FileText size={16} />
                  Preview & Export PDF
                </button>
                <button onClick={() => openPreviewModal('excel')} className="export-option">
                  <FileText size={16} />
                  Preview & Export Excel
                </button>
              </div>
            )}
          </div>
          <button className="add-btn" onClick={() => openModal()}>
            <Plus size={20} />
            Add Course
          </button>
        </div>
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          <select 
            value={semesterFilter} 
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Semesters</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">Summer</option>
          </select>
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
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-state">Loading courses...</td>
              </tr>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <tr key={course.id}>
                  <td className="fw-medium">{course.code}</td>
                  <td>{course.desc}</td>
                  <td>{course.units}</td>
                  <td>{course.prereq}</td>
                  <td>Year {course.year}</td>
                  <td>Sem {course.sem}</td>
                  <td className="cm-actions-cell">
                    <button className="cm-action-btn edit" onClick={() => openModal(course)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="cm-action-btn delete" onClick={() => handleDelete(course.id)} title="Delete">
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

      {isPreviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content preview-modal">
            <div className="modal-header">
              <div>
                <h3>{previewFormat === 'pdf' ? 'PDF Report Preview' : 'Excel Report Preview'}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {filteredCourses.length} records to export
                </p>
              </div>
              <button className="close-btn" onClick={closePreviewModal}>
                <X size={20} />
              </button>
            </div>

            <div className="preview-body">
              <div className="preview-info">
                <div className="preview-info-item">
                  <strong>Report Type:</strong> Course Management Report
                </div>
                <div className="preview-info-item">
                  <strong>Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="preview-info-item">
                  <strong>Total Records:</strong> {filteredCourses.length}
                </div>
                {(yearFilter !== 'All' || semesterFilter !== 'All' || searchQuery) && (
                  <div className="preview-info-item">
                    <strong>Filters Applied:</strong> {[
                      yearFilter !== 'All' && `Year: ${yearFilter}`,
                      semesterFilter !== 'All' && `Semester: ${semesterFilter}`,
                      searchQuery && `Search: "${searchQuery}"`
                    ].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>

              <div className="preview-charts">
                <div className="preview-chart-card">
                  <h5>Units Distribution</h5>
                  <div className="preview-chart-container">
                    <Pie data={unitsChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="preview-chart-card">
                  <h5>Courses by Year</h5>
                  <div className="preview-chart-container bar">
                    <Bar data={yearChartData} options={barOptions} />
                  </div>
                </div>
                <div className="preview-chart-card">
                  <h5>Courses by Semester</h5>
                  <div className="preview-chart-container bar">
                    <Bar data={semesterChartData} options={barOptions} />
                  </div>
                </div>
                <div className="preview-chart-card summary">
                  <h5>Summary Statistics</h5>
                  <div className="preview-stats">
                    <div className="preview-stat-item">
                      <span className="preview-stat-label">Total Courses</span>
                      <span className="preview-stat-value">{chartStats.total}</span>
                    </div>
                    <div className="preview-stat-item">
                      <span className="preview-stat-label">Total Units</span>
                      <span className="preview-stat-value">{chartStats.totalUnits}</span>
                    </div>
                    <div className="preview-stat-item">
                      <span className="preview-stat-label">Avg Units/Course</span>
                      <span className="preview-stat-value">{chartStats.avgUnits}</span>
                    </div>
                    <div className="preview-stat-item">
                      <span className="preview-stat-label">Year Levels</span>
                      <span className="preview-stat-value">{chartStats.years}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="preview-table-container">
                <h4 className="preview-section-title">
                  <PieChart size={18} style={{ marginRight: '8px' }} />
                  Data Preview (First 10 Records)
                </h4>
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Description</th>
                      <th>Units</th>
                      <th>Prerequisites</th>
                      <th>Year</th>
                      <th>Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.slice(0, 10).map((course) => (
                      <tr key={course.id}>
                        <td>{course.code}</td>
                        <td>{course.desc}</td>
                        <td>{course.units}</td>
                        <td>{course.prereq}</td>
                        <td>Year {course.year}</td>
                        <td>{course.sem === 1 ? '1st Sem' : course.sem === 2 ? '2nd Sem' : 'Summer'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer preview-footer">
              <button type="button" className="btn-cancel" onClick={closePreviewModal}>Cancel</button>
              <button 
                type="button" 
                className="btn-submit" 
                onClick={previewFormat === 'pdf' ? generatePDFReport : generateExcelReport}
              >
                {previewFormat === 'pdf' ? 'Download PDF' : 'Download Excel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;