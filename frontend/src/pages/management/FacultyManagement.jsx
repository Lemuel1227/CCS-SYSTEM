import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Filter, Users, Eye, LayoutGrid, List, BookOpen, Briefcase, Mail, Phone, Award, FileText, Download, ChevronDown, BarChart3, PieChart } from 'lucide-react';
import axios from 'axios';
import './FacultyManagement.css';
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

const DEFAULT_FORM_DATA = {
  userId: '',
  employeeId: '',
  employeeIdNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: 'Male',
  email: '',
  contactNumber: '',
  department: 'IT',
  position: '',
  academicRank: 'Instructor',
  employmentType: 'Full-time',
  status: 'Active',
  specializations: '',
  profileImage: ''
};

const INITIAL_FACULTY = [
  {
    id: '1',
    userId: '',
    employeeId: 'EMP-2020-001',
    employeeIdNumber: 'EMP-2020-001',
    firstName: 'Juan',
    middleName: '',
    lastName: 'Dela Cruz',
    gender: 'Male',
    email: 'juan.delacruz@pnc.edu.ph',
    contactNumber: '09171234567',
    department: 'IT',
    position: 'Instructor',
    academicRank: 'Assistant Professor',
    employmentType: 'Full-time',
    status: 'Active',
    specializations: 'Software Engineering, Web Development',
    profileImage: ''
  },
  {
    id: '2',
    userId: '',
    employeeId: 'EMP-2021-015',
    employeeIdNumber: 'EMP-2021-015',
    firstName: 'Maria',
    middleName: '',
    lastName: 'Santos',
    gender: 'Female',
    email: 'maria.santos@pnc.edu.ph',
    contactNumber: '09189876543',
    department: 'CS',
    position: 'Instructor',
    academicRank: 'Instructor',
    employmentType: 'Part-time',
    status: 'Active',
    specializations: 'Data Structures, Algorithms',
    profileImage: ''
  },
  {
    id: '3',
    userId: '',
    employeeId: 'EMP-2018-042',
    employeeIdNumber: 'EMP-2018-042',
    firstName: 'Roberto',
    middleName: '',
    lastName: 'Reyes',
    gender: 'Male',
    email: 'roberto.reyes@pnc.edu.ph',
    contactNumber: '09191112222',
    department: 'IS',
    position: 'Associate Professor',
    academicRank: 'Associate Professor',
    employmentType: 'Full-time',
    status: 'On Leave',
    specializations: 'Database Management, System Analysis',
    profileImage: ''
  }
];

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rankFilter, setRankFilter] = useState('All');
  
  const [viewMode, setViewMode] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState(null);
  const exportMenuRef = useRef(null);

  const mapFaculty = (f) => {
    const user = f.user || {};
    return {
      id: f._id || f.id,
      userId: user.userId || f.userId || '',
      employeeId: f.employeeIdNumber || f.employeeId || '',
      employeeIdNumber: f.employeeIdNumber || f.employeeId || '',
      firstName: f.firstName || '',
      middleName: f.middleName || '',
      lastName: f.lastName || '',
      gender: f.gender || 'Male',
      email: user.email || f.email || '',
      contactNumber: f.contactNumber || '',
      department: f.department || 'IT',
      position: f.position || '',
      academicRank: f.academicRank || 'Instructor',
      employmentType: f.employmentType || 'Full-time',
      status: f.status || 'Active',
      specializations: f.specializations || '',
      profileImage: f.profileImage || ''
    };
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get('/api/faculty');
      const mapped = response.data.map(mapFaculty);
      setFaculties(mapped);
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
      setErrorMessage('Failed to load faculty from the server.');
      setFaculties(INITIAL_FACULTY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'employeeId' ? { employeeIdNumber: value } : {})
    }));
  };

  const openModal = (faculty = null) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFormData(faculty);
    } else {
      setEditingFaculty(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaculty(null);
  };

  const openDetailModal = (faculty) => {
    setSelectedFaculty(faculty);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFaculty(null);
  };

  const openPreviewModal = (format) => {
    setPreviewFormat(format);
    setIsPreviewModalOpen(true);
    setShowExportMenu(false);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewFormat(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFaculty) {
      axios.put(`/api/faculty/${editingFaculty.id}`, {
        userId: formData.userId,
        employeeIdNumber: formData.employeeIdNumber || formData.employeeId,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        department: formData.department,
        position: formData.position,
        contactNumber: formData.contactNumber,
        email: formData.email
      }).then((response) => {
        const updated = mapFaculty(response.data);
        const merged = { ...formData, ...updated, id: editingFaculty.id };
        setFaculties(faculties.map((f) => f.id === editingFaculty.id ? merged : f));
        closeModal();
      }).catch((err) => {
        console.error('Failed to update faculty:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to update faculty.');
      });
    } else {
      axios.post('/api/faculty', {
        userId: formData.userId,
        employeeIdNumber: formData.employeeIdNumber || formData.employeeId,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        department: formData.department,
        position: formData.position,
        contactNumber: formData.contactNumber,
        email: formData.email
      }).then((response) => {
        const created = mapFaculty(response.data);
        const merged = { ...formData, ...created };
        setFaculties([...faculties, merged]);
        closeModal();
      }).catch((err) => {
        console.error('Failed to create faculty:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to create faculty.');
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      axios.delete(`/api/faculty/${id}`).then(() => {
        const updated = faculties.filter((faculty) => faculty.id !== id);
        setFaculties(updated);
      }).catch((err) => {
        console.error('Failed to delete faculty:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to delete faculty.');
      });
    }
  };

  const filteredFaculties = useMemo(() => {
    return faculties.filter((faculty) => {
      const fullName = `${faculty.firstName} ${faculty.lastName}`.trim();
      const matchesSearch =
        (faculty.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faculty.specializations || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = departmentFilter === 'All' || faculty.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || faculty.status === statusFilter;
      const matchesRank = rankFilter === 'All' || faculty.academicRank === rankFilter;

      return matchesSearch && matchesDepartment && matchesStatus && matchesRank;
    });
  }, [faculties, searchQuery, departmentFilter, statusFilter, rankFilter]);

  // Chart data calculations
  const statusChartData = useMemo(() => {
    const counts = filteredFaculties.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    };
  }, [filteredFaculties]);

  const deptChartData = useMemo(() => {
    const counts = filteredFaculties.reduce((acc, f) => {
      acc[f.department] = (acc[f.department] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Faculty by Department',
        data: Object.values(counts),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
        borderWidth: 0
      }]
    };
  }, [filteredFaculties]);

  const rankChartData = useMemo(() => {
    const counts = filteredFaculties.reduce((acc, f) => {
      acc[f.academicRank] = (acc[f.academicRank] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Faculty by Rank',
        data: Object.values(counts),
        backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316'],
        borderWidth: 0
      }]
    };
  }, [filteredFaculties]);

  const chartStats = useMemo(() => {
    const deptCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.department] = (acc[f.department] || 0) + 1;
      return acc;
    }, {});
    const rankCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.academicRank] = (acc[f.academicRank] || 0) + 1;
      return acc;
    }, {});
    const typeCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.employmentType] = (acc[f.employmentType] || 0) + 1;
      return acc;
    }, {});
    return {
      total: filteredFaculties.length,
      departments: Object.keys(deptCounts).length,
      ranks: Object.keys(rankCounts).length,
      types: Object.keys(typeCounts).length
    };
  }, [filteredFaculties]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'active';
    if (s === 'on leave') return 'on-leave';
    if (s === 'resigned') return 'resigned';
    return '';
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
    doc.text('Faculty Management Report', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.text(`Generated on: ${dateStr}`, pageWidth / 2, 22, { align: 'center' });
    
    const filters = [];
    if (departmentFilter !== 'All') filters.push(`Department: ${departmentFilter}`);
    if (statusFilter !== 'All') filters.push(`Status: ${statusFilter}`);
    if (rankFilter !== 'All') filters.push(`Rank: ${rankFilter}`);
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);
    
    let startY = 28;
    if (filters.length > 0) {
      doc.setFontSize(9);
      doc.text(`Filters: ${filters.join(' | ')}`, 14, startY);
      startY += 6;
    }

    // Generate summary statistics
    const statusCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {});
    const deptCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.department] = (acc[f.department] || 0) + 1;
      return acc;
    }, {});
    const rankCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.academicRank] = (acc[f.academicRank] || 0) + 1;
      return acc;
    }, {});
    const typeCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.employmentType] = (acc[f.employmentType] || 0) + 1;
      return acc;
    }, {});

    // Add summary section
    doc.setFontSize(11);
    doc.setTextColor(41, 98, 255);
    doc.text('Summary Statistics', 14, startY + 6);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    const summaryLines = [
      `Total Faculty: ${filteredFaculties.length}`,
      `Status: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}`,
      `Departments: ${Object.keys(deptCounts).length} (${Object.entries(deptCounts).map(([k, v]) => `${k}: ${v}`).join(', ')})`,
      `Academic Ranks: ${Object.keys(rankCounts).length} (${Object.entries(rankCounts).map(([k, v]) => `${k}: ${v}`).join(', ')})`,
      `Employment Types: ${Object.entries(typeCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}`
    ].filter(Boolean);

    let summaryY = startY + 12;
    summaryLines.forEach((line, index) => {
      doc.setFont(index === 0 ? 'bold' : 'normal', 'normal');
      doc.text(line, 14, summaryY);
      summaryY += 5;
    });
    
    const tableData = filteredFaculties.map(f => [
      f.employeeIdNumber || f.employeeId,
      `${f.lastName}, ${f.firstName}${f.middleName ? ` ${f.middleName}` : ''}`,
      f.department,
      f.academicRank,
      f.employmentType,
      f.status,
      f.email || '-',
      f.contactNumber || '-',
      f.specializations || '-'
    ]);
    
    autoTable(doc, {
      head: [['Employee ID', 'Name', 'Dept', 'Rank', 'Type', 'Status', 'Email', 'Contact', 'Specializations']],
      body: tableData,
      startY: summaryY + 5,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 98, 255], textColor: 255, fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 15 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 18 },
        6: { cellWidth: 45 },
        7: { cellWidth: 25 },
        8: { cellWidth: 'auto' }
      }
    });
    
    doc.setFontSize(9);
    const finalY = doc.lastAutoTable?.finalY || 40;
    doc.text(`Total Records: ${filteredFaculties.length}`, 14, finalY + 8);
    
    doc.save(`faculty_report_${new Date().toISOString().split('T')[0]}.pdf`);
    closePreviewModal();
  };

  const generateExcelReport = () => {
    const data = filteredFaculties.map(f => ({
      'Employee ID': f.employeeIdNumber || f.employeeId,
      'Last Name': f.lastName,
      'First Name': f.firstName,
      'Middle Name': f.middleName || '',
      'Gender': f.gender,
      'Department': f.department,
      'Position': f.position || '',
      'Academic Rank': f.academicRank,
      'Employment Type': f.employmentType,
      'Status': f.status,
      'Email': f.email || '',
      'Contact Number': f.contactNumber || '',
      'Specializations': f.specializations || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    const colWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
      { wch: 30 }, { wch: 15 }, { wch: 40 }
    ];
    ws['!cols'] = colWidths;
    
    // Generate summary for Excel
    const statusCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {});
    const deptCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.department] = (acc[f.department] || 0) + 1;
      return acc;
    }, {});
    const rankCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.academicRank] = (acc[f.academicRank] || 0) + 1;
      return acc;
    }, {});
    const typeCounts = filteredFaculties.reduce((acc, f) => {
      acc[f.employmentType] = (acc[f.employmentType] || 0) + 1;
      return acc;
    }, {});

    const filterInfo = [];
    if (departmentFilter !== 'All') filterInfo.push(`Department: ${departmentFilter}`);
    if (statusFilter !== 'All') filterInfo.push(`Status: ${statusFilter}`);
    if (rankFilter !== 'All') filterInfo.push(`Rank: ${rankFilter}`);
    if (searchQuery) filterInfo.push(`Search: "${searchQuery}"`);

    const summaryData = [
      ['Faculty Management Report'],
      [`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`],
      ...(filterInfo.length > 0 ? [['Filters: ' + filterInfo.join(' | ')]] : []),
      [],
      ['SUMMARY STATISTICS'],
      ['Total Faculty', filteredFaculties.length],
      [],
      ['BY STATUS'],
      ...Object.entries(statusCounts).map(([status, count]) => [status, count, `${((count / filteredFaculties.length) * 100).toFixed(1)}%`]),
      [],
      ['BY DEPARTMENT'],
      ...Object.entries(deptCounts).map(([dept, count]) => [dept, count, `${((count / filteredFaculties.length) * 100).toFixed(1)}%`]),
      [],
      ['BY ACADEMIC RANK'],
      ...Object.entries(rankCounts).map(([rank, count]) => [rank, count, `${((count / filteredFaculties.length) * 100).toFixed(1)}%`]),
      [],
      ['BY EMPLOYMENT TYPE'],
      ...Object.entries(typeCounts).map(([type, count]) => [type, count, `${((count / filteredFaculties.length) * 100).toFixed(1)}%`])
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty Report');
    
    XLSX.writeFile(wb, `faculty_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    closePreviewModal();
  };

  return (
    <div className="faculty-management-container">
      {errorMessage && (
        <div className="fm-empty-state" style={{ marginBottom: '16px', color: '#b91c1c' }}>
          {errorMessage}
        </div>
      )}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={28} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Faculty Management</h2>
          </div>
          <p>Manage faculty profiles, department assignments, and academic roles.</p>
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
            <Plus size={18} />
            Add Faculty
          </button>
        </div>
      </div>

      <div className="fm-controls-bar">
        <div className="fm-search-box">
          <Search size={18} className="fm-search-icon" />
          <input
            type="text"
            placeholder="Search by ID, name, or specializations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="fm-filter-box">
          <Filter size={18} className="fm-filter-icon" />
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="IT">IT</option>
            <option value="CS">CS</option>
            <option value="IS">IS</option>
          </select>
        </div>

        <div className="fm-filter-box">
          <Award size={18} className="fm-filter-icon" />
          <select value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
            <option value="All">All Ranks</option>
            <option value="Instructor">Instructor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Professor">Professor</option>
          </select>
        </div>

        <div className="fm-filter-box">
          <Briefcase size={18} className="fm-filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>

        <div className="fm-view-toggle">
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
        <div className="fm-table-container">
          <table className="fm-faculty-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Rank & Type</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.length > 0 ? (
                filteredFaculties.map((faculty) => (
                  <tr key={faculty.id}>
                    <td>
                      <div className="fm-table-cell-content">
                        <div className="fw-medium">{faculty.employeeIdNumber || faculty.employeeId}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div className="fw-medium">{`${faculty.lastName}, ${faculty.firstName}`}</div>
                        <div className="fm-cell-subtext truncate" style={{ maxWidth: '180px' }} title={faculty.specializations}>{faculty.specializations || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>{faculty.department}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>{faculty.academicRank}</div>
                        <div className="fm-cell-subtext">{faculty.employmentType}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>
                          <span className={`fm-status-badge ${getStatusClass(faculty.status)}`}>
                            {faculty.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fm-table-cell-content">
                        <div>{faculty.contactNumber || '-'}</div>
                        <div className="fm-cell-subtext truncate" style={{ maxWidth: '150px' }} title={faculty.email}>{faculty.email || '-'}</div>
                      </div>
                    </td>
                    <td className="fm-actions-cell">
                      <div className="fm-actions-group">
                        <button className="fm-action-btn view" onClick={() => openDetailModal(faculty)} title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="fm-action-btn edit" onClick={() => openModal(faculty)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="fm-action-btn delete" onClick={() => handleDelete(faculty.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="fm-empty-state">
                    <Users size={20} /> No faculty found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="fm-grid-container">
          {filteredFaculties.length > 0 ? (
            filteredFaculties.map((faculty) => (
              <div className="fm-faculty-card" key={faculty.id}>
                <div className="fm-card-banner">
                  <span className={`fm-status-badge ${getStatusClass(faculty.status)}`}>
                    {faculty.status}
                  </span>
                </div>
                <div className="fm-card-content">
                  <div className="fm-card-user-info">
                    <div className="fm-card-avatar">
                      {faculty.firstName.charAt(0)}{faculty.lastName.charAt(0)}
                    </div>
                    <div className="fm-card-user-text">
                      <h3 className="fm-card-name" title={`${faculty.lastName}, ${faculty.firstName}`}>
                        {`${faculty.lastName}, ${faculty.firstName}`}
                      </h3>
                      <p className="fm-card-faculty-no">{faculty.employeeIdNumber || faculty.employeeId}</p>
                    </div>
                  </div>
                  <div className="fm-card-body">
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <BookOpen size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Department:</span>
                      </div>
                      <span className="fm-detail-value fw-medium">{faculty.department}</span>
                    </div>
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <Award size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Rank:</span>
                      </div>
                      <span className="fm-detail-value fw-medium">{faculty.academicRank}</span>
                    </div>
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <Briefcase size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Type:</span>
                      </div>
                      <span className="fm-detail-value">{faculty.employmentType}</span>
                    </div>
                    <div className="fm-card-detail">
                      <div className="fm-detail-label-group">
                        <Mail size={14} className="fm-detail-icon" />
                        <span className="fm-detail-label">Email:</span>
                      </div>
                      <span className="fm-detail-value truncate" title={faculty.email || '-'}>{faculty.email || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="fm-card-footer">
                  <button className="fm-action-btn view" onClick={() => openDetailModal(faculty)} title="View Details">
                    <Eye size={16} /> View
                  </button>
                  <button className="fm-action-btn edit" onClick={() => openModal(faculty)} title="Edit">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="fm-action-btn delete" onClick={() => handleDelete(faculty.id)} title="Delete">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="fm-empty-state">
              <Users size={20} /> No faculty found matching your criteria.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <h4 className="form-section-title">Basic Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>User ID (from Users)</label>
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    placeholder="Optional link to user"
                  />
                </div>
                <div className="form-group half">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. EMP-2026-001"
                  />
                </div>
                <div className="form-group half">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleInputChange}>
                    <option value="IT">IT</option>
                    <option value="CS">CS</option>
                    <option value="IS">IS</option>
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

              <div className="form-row">
                <div className="form-group half">
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
                <div className="form-group half">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h4 className="form-section-title">Professional Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Position / Designation</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Instructor"
                  />
                </div>
                <div className="form-group half">
                  <label>Academic Rank</label>
                  <select name="academicRank" value={formData.academicRank} onChange={handleInputChange}>
                    <option value="Instructor">Instructor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Employment Type</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleInputChange}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Profile Image URL</label>
                  <input
                    type="text"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full">
                  <label>Specializations</label>
                  <input
                    type="text"
                    name="specializations"
                    value={formData.specializations}
                    onChange={handleInputChange}
                    placeholder="e.g. Web Development, AI, Data Science"
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

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingFaculty ? 'Save Changes' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedFaculty && (
        <div className="fm-detail-overlay" onClick={closeDetailModal}>
          <div className="fm-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fm-detail-header">
              <div>
                <h3>Faculty Details</h3>
                <p>{selectedFaculty.employeeId}</p>
              </div>
              <button className="close-btn" onClick={closeDetailModal}>
                <X size={20} />
              </button>
            </div>

            <div className="fm-detail-body">
              <div className="fm-detail-section">
                <h4>Basic Information</h4>
                <div className="fm-detail-grid">
                  <div className="fm-detail-item"><span>Full Name</span><strong>{`${selectedFaculty.lastName}, ${selectedFaculty.firstName}${selectedFaculty.middleName ? ` ${selectedFaculty.middleName}` : ''}`}</strong></div>
                  <div className="fm-detail-item"><span>Employee ID</span><strong>{selectedFaculty.employeeIdNumber || selectedFaculty.employeeId || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>User ID</span><strong>{selectedFaculty.userId || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Gender</span><strong>{selectedFaculty.gender || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Email</span><strong>{selectedFaculty.email || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Contact Number</span><strong>{selectedFaculty.contactNumber || 'N/A'}</strong></div>
                </div>
              </div>

              <div className="fm-detail-section">
                <h4>Professional Information</h4>
                <div className="fm-detail-grid">
                  <div className="fm-detail-item"><span>Department</span><strong>{selectedFaculty.department || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Position</span><strong>{selectedFaculty.position || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Academic Rank</span><strong>{selectedFaculty.academicRank || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Employment Type</span><strong>{selectedFaculty.employmentType || 'N/A'}</strong></div>
                  <div className="fm-detail-item"><span>Status</span>
                    <strong>
                       <span className={`fm-status-badge ${getStatusClass(selectedFaculty.status)}`} style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-block', marginTop: '2px' }}>
                          {selectedFaculty.status || 'N/A'}
                        </span>
                    </strong>
                  </div>
                </div>
              </div>
              
              <div className="fm-detail-section">
                <h4>Specializations</h4>
                <div className="fm-detail-grid">
                   <div className="fm-detail-item" style={{ gridColumn: '1 / -1' }}><span>Areas of Expertise</span><strong>{selectedFaculty.specializations || 'None recorded'}</strong></div>
                </div>
              </div>
            </div>

            <div className="fm-detail-footer">
              <button type="button" className="btn-cancel" onClick={closeDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="modal-overlay" onClick={closePreviewModal}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Report Preview - {previewFormat === 'pdf' ? 'PDF' : 'Excel'}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {filteredFaculties.length} records to export
                </p>
              </div>
              <button className="close-btn" onClick={closePreviewModal}>
                <X size={20} />
              </button>
            </div>

            <div className="preview-body">
              <div className="preview-info">
                <div className="preview-info-item">
                  <strong>Report Type:</strong> Faculty Management Report
                </div>
                <div className="preview-info-item">
                  <strong>Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="preview-info-item">
                  <strong>Total Records:</strong> {filteredFaculties.length}
                </div>
                {(departmentFilter !== 'All' || statusFilter !== 'All' || rankFilter !== 'All' || searchQuery) && (
                  <div className="preview-info-item">
                    <strong>Applied Filters:</strong>
                    <div className="preview-filters">
                      {departmentFilter !== 'All' && <span className="preview-filter-tag">Dept: {departmentFilter}</span>}
                      {statusFilter !== 'All' && <span className="preview-filter-tag">Status: {statusFilter}</span>}
                      {rankFilter !== 'All' && <span className="preview-filter-tag">Rank: {rankFilter}</span>}
                      {searchQuery && <span className="preview-filter-tag">Search: &quot;{searchQuery}&quot;</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Charts Section */}
              <div className="preview-charts-section">
                <h4 className="preview-section-title">
                  <BarChart3 size={18} style={{ marginRight: '8px' }} />
                  Data Analytics
                </h4>
                <div className="preview-charts-grid">
                  <div className="preview-chart-card">
                    <h5>Status Distribution</h5>
                    <div className="preview-chart-container pie">
                      <Pie data={statusChartData} options={chartOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card">
                    <h5>Department Distribution</h5>
                    <div className="preview-chart-container bar">
                      <Bar data={deptChartData} options={barOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card">
                    <h5>Academic Rank Distribution</h5>
                    <div className="preview-chart-container bar">
                      <Bar data={rankChartData} options={barOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card summary">
                    <h5>Summary Statistics</h5>
                    <div className="preview-stats">
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Total Faculty</span>
                        <span className="preview-stat-value">{chartStats.total}</span>
                      </div>
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Departments</span>
                        <span className="preview-stat-value">{chartStats.departments}</span>
                      </div>
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Academic Ranks</span>
                        <span className="preview-stat-value">{chartStats.ranks}</span>
                      </div>
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Employment Types</span>
                        <span className="preview-stat-value">{chartStats.types}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="preview-table-container">
                <h4 className="preview-section-title">
                  <PieChart size={18} style={{ marginRight: '8px' }} />
                  Data Preview
                </h4>
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Rank</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculties.map((faculty) => (
                      <tr key={faculty.id}>
                        <td>{faculty.employeeIdNumber || faculty.employeeId}</td>
                        <td>{`${faculty.lastName}, ${faculty.firstName}`}</td>
                        <td>{faculty.department}</td>
                        <td>{faculty.academicRank}</td>
                        <td>{faculty.employmentType}</td>
                        <td>
                          <span className={`fm-status-badge ${getStatusClass(faculty.status)}`}>
                            {faculty.status}
                          </span>
                        </td>
                        <td>{faculty.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closePreviewModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={previewFormat === 'pdf' ? generatePDFReport : generateExcelReport}
              >
                <Download size={16} style={{ marginRight: '6px' }} />
                Download {previewFormat === 'pdf' ? 'PDF' : 'Excel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
