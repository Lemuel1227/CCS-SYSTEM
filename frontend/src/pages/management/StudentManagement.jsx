import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Filter, Users, Eye, LayoutGrid, List, BookOpen, Calendar as CalendarIcon, Mail, Phone, Code, FileText, Download, ChevronDown, BarChart3, PieChart } from 'lucide-react';
import axios from 'axios';
import './StudentManagement.css';
import MyProfile from '../student/MyProfile';
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
  studentNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  gender: 'Male',
  yearLevel: '1st Year',
  schoolYear: '',
  program: "BSIT",
  academicTrack: '',
  section: '',
  sectionId: '',
  sectionName: '',
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

const formatSchoolYearLabel = (schoolYearRecord) => {
  if (!schoolYearRecord) return '';
  return `${schoolYearRecord.schoolYear} (${schoolYearRecord.semester})`;
};

const normalizeListField = (value) => {
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

const normalizeTextField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(', ');
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};


const INITIAL_STUDENTS = [
  {
    id: '1',
    userId: '',
    studentNumber: '2023-0001',
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
    userId: '',
    studentNumber: '2023-0002',
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
    userId: '',
    studentNumber: '2023-0003',
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
    userId: '',
    studentNumber: '2023-0004',
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
    studentNo: student.studentNo || student.studentNumber || '',
    studentNumber: student.studentNumber || student.studentNo || '',
    firstName,
    middleName,
    lastName,
    yearLevel: student.yearLevel || '1st Year',
    schoolYear: student.schoolYear || '',
    program: student.course || 'BSCS',
    section: student.section || '',
    sectionId: student.sectionId || '',
    sectionName: student.sectionName || student.section || '',
    academicStatus: student.status === 'Inactive' ? 'Irregular' : 'Regular',
    email: student.email || ''
  };
};

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sectionOptions, setSectionOptions] = useState([]);

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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState(null);
  const exportMenuRef = useRef(null);

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

  const toTitleStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'irregular') return 'Irregular';
    return 'Regular';
  };

  const mapStudent = (s) => {
    const user = s.user || {};
    const sectionObject = s.section && typeof s.section === 'object' ? s.section : null;
    const sectionId = sectionObject?._id || (typeof s.section === 'string' ? s.section : '');
    const sectionName = sectionObject?.sectionName || (typeof s.section === 'string' ? s.section : '');
    const sectionYearLevel = sectionObject?.yearLevel;
    const sectionSchoolYear = sectionObject?.schoolYearSemester;
    const mappedSchoolYear = s.schoolYear || formatSchoolYearLabel(sectionSchoolYear);

    return normalizeStudent({
      ...s,
      id: s._id || s.id,
      userId: user.userId || s.userId || '',
      studentNumber: s.studentNumber,
      studentNo: s.studentNumber || s.studentNo,
      firstName: s.firstName,
      middleName: s.middleName,
      lastName: s.lastName,
      gender: s.gender,
      yearLevel: sectionYearLevel || s.yearLevel,
      schoolYear: mappedSchoolYear,
      program: s.program,
      section: sectionName,
      sectionId,
      sectionName,
      academicStatus: toTitleStatus(s.academicStatus),
      height: s.height,
      weight: s.weight,
      email: user.email || s.email || '',
      contactNumber: s.contactNumber,
      emergencyName: s.emergencyContactName,
      emergencyNumber: s.emergencyContactNumber,
      emergencyRelation: s.emergencyContactRelation,
      yearGraduated: s.yearGraduated,
      profileImage: s.profileImage,
      achievements: s.achievements,
      skills: s.skills,
      interests: s.interests
    });
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get('/api/students');
      const mapped = response.data.map(mapStudent);
      setStudents(mapped);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setErrorMessage('Failed to load students from the server.');
      setStudents(INITIAL_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const loadAcademicOptions = async () => {
      try {
        const response = await axios.get('/api/academic/options');
        setSectionOptions(response.data?.sections || []);
      } catch (err) {
        console.error('Failed to load school year/section options:', err);
      }
    };

    loadAcademicOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'sectionId') {
      const selected = sectionOptions.find((item) => item._id === value);
      setFormData((prev) => ({
        ...prev,
        sectionId: value,
        section: selected?.sectionName || '',
        sectionName: selected?.sectionName || '',
        schoolYear: selected?.schoolYearLabel || '',
        yearLevel: selected?.yearLevel || ''
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'studentNo' ? { studentNumber: value } : {})
    }));
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
    doc.text('Student Management Report', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Generated on: ${dateStr}`, pageWidth / 2, 22, { align: 'center' });

    const filters = [];
    if (statusFilter !== 'All') filters.push(`Status: ${statusFilter}`);
    if (selectedSkills.length > 0) filters.push(`Skills: ${selectedSkills.join(', ')}`);
    if (searchQuery) filters.push(`Search: "${searchQuery}"`);

    let startY = 28;
    if (filters.length > 0) {
      doc.setFontSize(9);
      doc.text(`Filters: ${filters.join(' | ')}`, 14, startY);
      startY += 6;
    }

    // Generate summary statistics
    const statusCounts = filteredStudents.reduce((acc, s) => {
      acc[s.academicStatus] = (acc[s.academicStatus] || 0) + 1;
      return acc;
    }, {});
    const programCounts = filteredStudents.reduce((acc, s) => {
      acc[s.program] = (acc[s.program] || 0) + 1;
      return acc;
    }, {});
    const yearCounts = filteredStudents.reduce((acc, s) => {
      acc[s.yearLevel] = (acc[s.yearLevel] || 0) + 1;
      return acc;
    }, {});
    const genderCounts = filteredStudents.reduce((acc, s) => {
      acc[s.gender] = (acc[s.gender] || 0) + 1;
      return acc;
    }, {});
    const sectionCounts = filteredStudents.reduce((acc, s) => {
      acc[s.section || 'Unassigned'] = (acc[s.section || 'Unassigned'] || 0) + 1;
      return acc;
    }, {});

    const topSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];

    // Add summary section
    doc.setFontSize(11);
    doc.setTextColor(41, 98, 255);
    doc.text('Summary Statistics', 14, startY + 6);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    const summaryLines = [
      `Total Students: ${filteredStudents.length}`,
      `Status: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}`,
      `Programs: ${Object.keys(programCounts).length} (${Object.entries(programCounts).map(([k, v]) => `${k}: ${v}`).join(', ')})`,
      `Year Levels: ${Object.entries(yearCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}`,
      `Gender: ${Object.entries(genderCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}`,
      topSection ? `Largest Section: ${topSection[0]} (${topSection[1]} students)` : ''
    ].filter(Boolean);

    let summaryY = startY + 12;
    summaryLines.forEach((line, index) => {
      doc.setFont(index === 0 ? 'bold' : 'normal', 'normal');
      doc.text(line, 14, summaryY);
      summaryY += 5;
    });

    const tableData = filteredStudents.map(s => [
      s.studentNumber || s.studentNo,
      `${s.lastName}, ${s.firstName}${s.middleName ? ` ${s.middleName}` : ''}`,
      s.program,
      s.yearLevel,
      s.section || '-',
      s.academicStatus,
      s.email || '-',
      s.contactNumber || '-',
      s.skills || '-'
    ]);

    autoTable(doc, {
      head: [['Student No.', 'Name', 'Program', 'Year', 'Section', 'Status', 'Email', 'Contact', 'Skills']],
      body: tableData,
      startY: summaryY + 5,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 98, 255], textColor: 255, fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 45 },
        7: { cellWidth: 25 },
        8: { cellWidth: 'auto' }
      }
    });

    doc.setFontSize(9);
    const finalY = doc.lastAutoTable?.finalY || 40;
    doc.text(`Total Records: ${filteredStudents.length}`, 14, finalY + 8);

    doc.save(`student_report_${new Date().toISOString().split('T')[0]}.pdf`);
    closePreviewModal();
  };

  const generateExcelReport = () => {
    const data = filteredStudents.map(s => ({
      'Student Number': s.studentNumber || s.studentNo,
      'Last Name': s.lastName,
      'First Name': s.firstName,
      'Middle Name': s.middleName || '',
      'Gender': s.gender,
      'Program': s.program,
      'Year Level': s.yearLevel,
      'Section': s.section || '',
      'Academic Status': s.academicStatus,
      'Email': s.email || '',
      'Contact Number': s.contactNumber || '',
      'Emergency Contact': s.emergencyName || '',
      'Emergency Number': s.emergencyNumber || '',
      'Skills': s.skills || '',
      'Interests': s.interests || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 },
      { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    // Generate summary for Excel
    const statusCounts = filteredStudents.reduce((acc, s) => {
      acc[s.academicStatus] = (acc[s.academicStatus] || 0) + 1;
      return acc;
    }, {});
    const programCounts = filteredStudents.reduce((acc, s) => {
      acc[s.program] = (acc[s.program] || 0) + 1;
      return acc;
    }, {});
    const yearCounts = filteredStudents.reduce((acc, s) => {
      acc[s.yearLevel] = (acc[s.yearLevel] || 0) + 1;
      return acc;
    }, {});
    const genderCounts = filteredStudents.reduce((acc, s) => {
      acc[s.gender] = (acc[s.gender] || 0) + 1;
      return acc;
    }, {});
    const sectionCounts = filteredStudents.reduce((acc, s) => {
      acc[s.section || 'Unassigned'] = (acc[s.section || 'Unassigned'] || 0) + 1;
      return acc;
    }, {});

    const topSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];

    const filterInfo = [];
    if (statusFilter !== 'All') filterInfo.push(`Status: ${statusFilter}`);
    if (selectedSkills.length > 0) filterInfo.push(`Skills: ${selectedSkills.join(', ')}`);
    if (searchQuery) filterInfo.push(`Search: "${searchQuery}"`);

    const summaryData = [
      ['Student Management Report'],
      [`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`],
      ...(filterInfo.length > 0 ? [['Filters: ' + filterInfo.join(' | ')]] : []),
      [],
      ['SUMMARY STATISTICS'],
      ['Total Students', filteredStudents.length],
      [],
      ['BY ACADEMIC STATUS'],
      ...Object.entries(statusCounts).map(([status, count]) => [status, count, `${((count / filteredStudents.length) * 100).toFixed(1)}%`]),
      [],
      ['BY PROGRAM'],
      ...Object.entries(programCounts).map(([program, count]) => [program, count, `${((count / filteredStudents.length) * 100).toFixed(1)}%`]),
      [],
      ['BY YEAR LEVEL'],
      ...Object.entries(yearCounts).map(([year, count]) => [year, count, `${((count / filteredStudents.length) * 100).toFixed(1)}%`]),
      [],
      ['BY GENDER'],
      ...Object.entries(genderCounts).map(([gender, count]) => [gender, count, `${((count / filteredStudents.length) * 100).toFixed(1)}%`]),
      [],
      ['BY SECTION (Top 5)'],
      ...Object.entries(sectionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([section, count]) => [section, count, `${((count / filteredStudents.length) * 100).toFixed(1)}%`]),
      ...(topSection ? [['Largest Section', topSection[0], `${topSection[1]} students`]] : [])
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws, 'Student Report');

    XLSX.writeFile(wb, `student_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    closePreviewModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedSkills = normalizeListField(formData.skills);
    const normalizedInterests = normalizeListField(formData.interests);
    const normalizedAchievements = normalizeTextField(formData.achievements);
    if (editingStudent) {
      axios.put(`/api/students/${editingStudent.id}`, {
        userId: formData.userId,
        studentNumber: formData.studentNumber || formData.studentNo,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        program: formData.program,
        section: formData.sectionId || undefined,
        academicStatus: formData.academicStatus.toLowerCase(),
        height: formData.height,
        weight: formData.weight,
        contactNumber: formData.contactNumber,
        emergencyContactName: formData.emergencyName,
        emergencyContactNumber: formData.emergencyNumber,
        emergencyContactRelation: formData.emergencyRelation,
        yearGraduated: formData.yearGraduated,
        email: formData.email,
        achievements: normalizedAchievements,
        skills: normalizedSkills,
        interests: normalizedInterests
      }).then((response) => {
        const updated = mapStudent(response.data);
        const merged = { ...formData, ...updated, id: editingStudent.id, achievements: normalizedAchievements, skills: normalizedSkills, interests: normalizedInterests };
        setStudents(students.map((s) => s.id === editingStudent.id ? merged : s));
        closeModal();
      }).catch((err) => {
        console.error('Failed to update student:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to update student.');
      });
    } else {
      axios.post('/api/students', {
        userId: formData.userId,
        studentNumber: formData.studentNumber || formData.studentNo,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        program: formData.program,
        section: formData.sectionId || undefined,
        academicStatus: formData.academicStatus.toLowerCase(),
        height: formData.height,
        weight: formData.weight,
        contactNumber: formData.contactNumber,
        emergencyContactName: formData.emergencyName,
        emergencyContactNumber: formData.emergencyNumber,
        emergencyContactRelation: formData.emergencyRelation,
        yearGraduated: formData.yearGraduated,
        email: formData.email,
        achievements: normalizedAchievements,
        skills: normalizedSkills,
        interests: normalizedInterests
      }).then((response) => {
        const created = mapStudent(response.data);
        const merged = { ...formData, ...created, achievements: normalizedAchievements, skills: normalizedSkills, interests: normalizedInterests };
        setStudents([...students, merged]);
        closeModal();
      }).catch((err) => {
        console.error('Failed to create student:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to create student.');
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      axios.delete(`/api/students/${id}`).then(() => {
        const updated = students.filter((student) => student.id !== id);
        setStudents(updated);
      }).catch((err) => {
        console.error('Failed to delete student:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to delete student.');
      });
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

  // Chart data calculations
  const statusChartData = useMemo(() => {
    const counts = filteredStudents.reduce((acc, s) => {
      acc[s.academicStatus] = (acc[s.academicStatus] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#22c55e', '#f59e0b'],
        borderWidth: 0
      }]
    };
  }, [filteredStudents]);

  const programChartData = useMemo(() => {
    const counts = filteredStudents.reduce((acc, s) => {
      acc[s.program] = (acc[s.program] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Students by Program',
        data: Object.values(counts),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
        borderWidth: 0
      }]
    };
  }, [filteredStudents]);

  const yearChartData = useMemo(() => {
    const counts = filteredStudents.reduce((acc, s) => {
      acc[s.yearLevel] = (acc[s.yearLevel] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Students by Year Level',
        data: Object.values(counts),
        backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316'],
        borderWidth: 0
      }]
    };
  }, [filteredStudents]);

  const genderChartData = useMemo(() => {
    const counts = filteredStudents.reduce((acc, s) => {
      acc[s.gender] = (acc[s.gender] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#3b82f6', '#ec4899', '#8b5cf6'],
        borderWidth: 0
      }]
    };
  }, [filteredStudents]);

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

  return (
    <div className="student-management-container">
      {errorMessage && (
        <div className="sm-empty-state" style={{ marginBottom: '16px', color: '#b91c1c' }}>
          {errorMessage}
        </div>
      )}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Users size={28} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Student Management</h2>
          </div>
          <p>Manage student profiles, section assignments, and enrollment status.</p>
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
            Add Student
          </button>
        </div>
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
                        <div className="fw-medium">{student.studentNumber || student.studentNo}</div>
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
                      <p className="sm-card-student-no">{student.studentNumber || student.studentNo}</p>
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

              <h4 className="form-section-title">Academic Information</h4>
              <div className="form-row">
                <div className="form-group half">
                  <label>Program</label>
                  <select name="program" value={formData.program} onChange={handleInputChange}>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIT">BSIT</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Section</label>
                  <select name="sectionId" value={formData.sectionId} onChange={handleInputChange}>
                    <option value="">Select section</option>
                    {sectionOptions
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {`${item.sectionName} (${item.yearLevel || 'No year level'} • ${item.schoolYearLabel})`}
                        </option>
                      ))}
                  </select>
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
                <MyProfile studentData={selectedStudent} readOnly={true} />
              </div>

              <div className="sm-detail-footer">
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
                  {filteredStudents.length} records to export
                </p>
              </div>
              <button className="close-btn" onClick={closePreviewModal}>
                <X size={20} />
              </button>
            </div>

            <div className="preview-body">
              <div className="preview-info">
                <div className="preview-info-item">
                  <strong>Report Type:</strong> Student Management Report
                </div>
                <div className="preview-info-item">
                  <strong>Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="preview-info-item">
                  <strong>Total Records:</strong> {filteredStudents.length}
                </div>
                {(statusFilter !== 'All' || selectedSkills.length > 0 || searchQuery) && (
                  <div className="preview-info-item">
                    <strong>Applied Filters:</strong>
                    <div className="preview-filters">
                      {statusFilter !== 'All' && <span className="preview-filter-tag">Status: {statusFilter}</span>}
                      {selectedSkills.length > 0 && <span className="preview-filter-tag">Skills: {selectedSkills.join(', ')}</span>}
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
                    <h5>Academic Status Distribution</h5>
                    <div className="preview-chart-container pie">
                      <Pie data={statusChartData} options={chartOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card">
                    <h5>Program Distribution</h5>
                    <div className="preview-chart-container bar">
                      <Bar data={programChartData} options={barOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card">
                    <h5>Year Level Distribution</h5>
                    <div className="preview-chart-container bar">
                      <Bar data={yearChartData} options={barOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card">
                    <h5>Gender Distribution</h5>
                    <div className="preview-chart-container pie">
                      <Pie data={genderChartData} options={chartOptions} />
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
                      <th>Student No.</th>
                      <th>Name</th>
                      <th>Program</th>
                      <th>Year</th>
                      <th>Section</th>
                      <th>Status</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.studentNumber || student.studentNo}</td>
                        <td>{`${student.lastName}, ${student.firstName}`}</td>
                        <td>{student.program}</td>
                        <td>{student.yearLevel}</td>
                        <td>{student.section || '-'}</td>
                        <td>
                          <span className={`sm-status-badge ${student.academicStatus.toLowerCase()}`}>
                            {student.academicStatus}
                          </span>
                        </td>
                        <td>{student.email || '-'}</td>
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

export default StudentManagement;


