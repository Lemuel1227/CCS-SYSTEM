import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Users, Plus, Search, Edit, Trash2, X, Filter, ChevronDown, FileText, Download, BarChart3, PieChart } from 'lucide-react';
import './ScheduleManagement.css';
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_FORM_DATA = {
  schoolYearSemester: '',
  section: '',
  course: '',
  faculty: '',
  roomName: '',
  dayOfWeek: 'Monday',
  timeStart: '',
  timeEnd: '',
  scheduleType: 'Lecture',
};

const formatSchoolYearLabel = (record) => {
  if (!record) return '';
  return `${record.schoolYear} (${record.semester})`;
};

const formatFacultyName = (faculty) => {
  if (!faculty) return '';
  const full = [faculty.firstName, faculty.middleName, faculty.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;
  return faculty.user?.name || faculty.employeeIdNumber || '';
};

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [facultyOptions, setFacultyOptions] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchoolYear, setFilterSchoolYear] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDay, setFilterDay] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [expandedSections, setExpandedSections] = useState({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState(null);
  const exportMenuRef = useRef(null);

  const mapSchedule = (item) => ({
    id: item._id || item.id,
    schoolYearSemester: item.schoolYearSemester?._id || item.schoolYearSemester || '',
    schoolYearLabel: formatSchoolYearLabel(item.schoolYearSemester),
    section: item.section?._id || item.section || '',
    sectionName: item.section?.sectionName || '',
    sectionYearLevel: item.section?.yearLevel || '',
    course: item.course?._id || item.course || '',
    courseCode: item.course?.code || '',
    subject: item.course?.desc || '',
    faculty: item.faculty?._id || item.faculty || '',
    facultyName: formatFacultyName(item.faculty),
    roomName: item.roomName || '',
    dayOfWeek: item.dayOfWeek || '',
    timeStart: item.timeStart || '',
    timeEnd: item.timeEnd || '',
    scheduleType: item.scheduleType || 'Lecture',
  });

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get('/api/class-schedules');
      setSchedules((response.data || []).map(mapSchedule));
    } catch (err) {
      console.error('Failed to load class schedules:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load class schedules.');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const response = await axios.get('/api/class-schedules/options');
      setSchoolYearOptions(response.data?.schoolYears || []);
      setSectionOptions(response.data?.sections || []);
      setCourseOptions(response.data?.courses || []);
      setFacultyOptions(response.data?.faculty || []);
    } catch (err) {
      console.error('Failed to load schedule options:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load schedule options.');
    }
  };

  useEffect(() => {
    loadSchedules();
    loadOptions();
  }, []);

  const filteredSchedules = useMemo(() => {
    const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };

    return schedules
      .filter((schedule) => {
        const needle = searchTerm.toLowerCase();
        const matchesSearch =
          schedule.subject.toLowerCase().includes(needle) ||
          schedule.courseCode.toLowerCase().includes(needle) ||
          schedule.sectionName.toLowerCase().includes(needle) ||
          schedule.roomName.toLowerCase().includes(needle) ||
          schedule.facultyName.toLowerCase().includes(needle);
        const matchesSchoolYear = filterSchoolYear === 'All' || schedule.schoolYearSemester === filterSchoolYear;
        const matchesType = filterType === 'All' || schedule.scheduleType === filterType;
        const matchesDay = filterDay === 'All' || schedule.dayOfWeek === filterDay;
        const matchesSection = filterSection === 'All' || schedule.section === filterSection;
        return matchesSearch && matchesSchoolYear && matchesType && matchesDay && matchesSection;
      })
      .sort((a, b) => {
        const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
        if (dayDiff !== 0) return dayDiff;
        return a.timeStart.localeCompare(b.timeStart);
      });
  }, [schedules, searchTerm, filterSchoolYear, filterType, filterDay, filterSection]);

  const groupedSchedules = useMemo(() => {
    const groups = {};
    filteredSchedules.forEach((schedule) => {
      const sectionKey = schedule.section || 'Unassigned';
      if (!groups[sectionKey]) {
        const section = sectionOptions.find((s) => s._id === schedule.section);
        groups[sectionKey] = {
          sectionId: schedule.section,
          sectionName: schedule.sectionName || 'Unassigned',
          sectionYearLevel: schedule.sectionYearLevel,
          schoolYearLabel: section?.schoolYearLabel || schedule.schoolYearLabel,
          schedules: [],
        };
      }
      groups[sectionKey].schedules.push(schedule);
    });
    return Object.values(groups).sort((a, b) => a.sectionName.localeCompare(b.sectionName));
  }, [filteredSchedules, sectionOptions]);

  // Chart data calculations
  const typeChartData = useMemo(() => {
    const counts = filteredSchedules.reduce((acc, s) => {
      acc[s.scheduleType] = (acc[s.scheduleType] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    };
  }, [filteredSchedules]);

  const dayChartData = useMemo(() => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const counts = filteredSchedules.reduce((acc, s) => {
      acc[s.dayOfWeek] = (acc[s.dayOfWeek] || 0) + 1;
      return acc;
    }, {});
    const sortedDays = Object.keys(counts).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    return {
      labels: sortedDays,
      datasets: [{
        label: 'Schedules by Day',
        data: sortedDays.map(d => counts[d]),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'],
        borderWidth: 0
      }]
    };
  }, [filteredSchedules]);

  const sectionChartData = useMemo(() => {
    const counts = filteredSchedules.reduce((acc, s) => {
      acc[s.sectionName] = (acc[s.sectionName] || 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Schedules by Section',
        data: Object.values(counts),
        backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#22c55e'],
        borderWidth: 0
      }]
    };
  }, [filteredSchedules]);

  const chartStats = useMemo(() => {
    const typeCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.scheduleType] = (acc[s.scheduleType] || 0) + 1;
      return acc;
    }, {});
    const dayCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.dayOfWeek] = (acc[s.dayOfWeek] || 0) + 1;
      return acc;
    }, {});
    const sectionCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.sectionName] = (acc[s.sectionName] || 0) + 1;
      return acc;
    }, {});
    return {
      total: filteredSchedules.length,
      types: Object.keys(typeCounts).length,
      days: Object.keys(dayCounts).length,
      sections: Object.keys(sectionCounts).length
    };
  }, [filteredSchedules]);

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

  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData(DEFAULT_FORM_DATA);
    setIsModalOpen(true);
  };

  const openScheduleForCourse = (sectionId, courseId) => {
    const section = sectionOptions.find((s) => s._id === sectionId);
    if (!section) return;

    setEditingSchedule(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      schoolYearSemester: section.schoolYearSemester?._id || section.schoolYearSemester || '',
      section: sectionId,
      course: courseId,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      schoolYearSemester: schedule.schoolYearSemester || '',
      section: schedule.section || '',
      course: schedule.course || '',
      faculty: schedule.faculty || '',
      roomName: schedule.roomName || '',
      dayOfWeek: schedule.dayOfWeek || 'Monday',
      timeStart: schedule.timeStart || '',
      timeEnd: schedule.timeEnd || '',
      scheduleType: schedule.scheduleType || 'Lecture',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
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

  const generatePDFReport = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(16);
    doc.text('Class Schedule Report', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.text(`Generated: ${dateStr}`, pageWidth / 2, 22, { align: 'center' });

    const filters = [];
    if (filterSchoolYear !== 'All') {
      const sy = schoolYearOptions.find(s => s._id === filterSchoolYear);
      filters.push(`School Year: ${sy ? formatSchoolYearLabel(sy) : filterSchoolYear}`);
    }
    if (filterType !== 'All') filters.push(`Type: ${filterType}`);
    if (filterDay !== 'All') filters.push(`Day: ${filterDay}`);
    if (filterSection !== 'All') {
      const sec = sectionOptions.find(s => s._id === filterSection);
      filters.push(`Section: ${sec?.sectionName || filterSection}`);
    }
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    
    let startY = 28;
    if (filters.length > 0) {
      doc.setFontSize(9);
      doc.text(`Filters: ${filters.join(' | ')}`, 14, 30);
      startY = 35;
    }

    // Generate summary statistics
    const typeCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.scheduleType] = (acc[s.scheduleType] || 0) + 1;
      return acc;
    }, {});
    const dayCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.dayOfWeek] = (acc[s.dayOfWeek] || 0) + 1;
      return acc;
    }, {});
    const sectionCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.sectionName] = (acc[s.sectionName] || 0) + 1;
      return acc;
    }, {});
    const facultyCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.facultyName] = (acc[s.facultyName] || 0) + 1;
      return acc;
    }, {});

    const topSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];
    const topFaculty = Object.entries(facultyCounts).sort((a, b) => b[1] - a[1])[0];

    // Add summary section
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text('Summary Statistics', 14, startY + 8);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    const summaryLines = [
      `Total Schedules: ${filteredSchedules.length}`,
      `Schedule Types: ${Object.entries(typeCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}`,
      `Day Distribution: ${Object.entries(dayCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}`,
      `Unique Sections: ${Object.keys(sectionCounts).length}`,
      `Unique Faculty: ${Object.keys(facultyCounts).length}`,
      topSection ? `Most Active Section: ${topSection[0]} (${topSection[1]} schedules)` : '',
      topFaculty ? `Most Assigned Faculty: ${topFaculty[0]} (${topFaculty[1]} schedules)` : ''
    ].filter(Boolean);

    let summaryY = startY + 15;
    summaryLines.forEach((line, index) => {
      doc.setFont(index === 0 ? 'bold' : 'normal', 'normal');
      doc.text(line, 14, summaryY);
      summaryY += 5;
    });

    const tableData = filteredSchedules.map(s => [
      s.courseCode,
      s.subject,
      s.sectionName,
      s.facultyName,
      s.roomName,
      s.dayOfWeek,
      `${s.timeStart} - ${s.timeEnd}`,
      s.scheduleType
    ]);

    autoTable(doc, {
      head: [['Course Code', 'Subject', 'Section', 'Faculty', 'Room', 'Day', 'Time', 'Type']],
      body: tableData,
      startY: summaryY + 5,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    const totalPages = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${totalPages} | Total Records: ${filteredSchedules.length}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save('schedule-report.pdf');
    closePreviewModal();
  };

  const generateExcelReport = () => {
    const data = filteredSchedules.map(s => ({
      'Course Code': s.courseCode,
      'Subject': s.subject,
      'Section': s.sectionName,
      'Year Level': s.sectionYearLevel || '',
      'School Year': s.schoolYearLabel,
      'Faculty': s.facultyName,
      'Room': s.roomName,
      'Day': s.dayOfWeek,
      'Start Time': s.timeStart,
      'End Time': s.timeEnd,
      'Type': s.scheduleType,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = [
      { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedules');
    
    const filterInfo = [];
    if (filterSchoolYear !== 'All') {
      const sy = schoolYearOptions.find(s => s._id === filterSchoolYear);
      filterInfo.push(`School Year: ${sy ? formatSchoolYearLabel(sy) : filterSchoolYear}`);
    }
    if (filterType !== 'All') filterInfo.push(`Type: ${filterType}`);
    if (filterDay !== 'All') filterInfo.push(`Day: ${filterDay}`);
    if (filterSection !== 'All') {
      const sec = sectionOptions.find(s => s._id === filterSection);
      filterInfo.push(`Section: ${sec?.sectionName || filterSection}`);
    }
    if (searchTerm) filterInfo.push(`Search: "${searchTerm}"`);
    
    // Generate summary statistics
    const typeCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.scheduleType] = (acc[s.scheduleType] || 0) + 1;
      return acc;
    }, {});
    const dayCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.dayOfWeek] = (acc[s.dayOfWeek] || 0) + 1;
      return acc;
    }, {});
    const sectionCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.sectionName] = (acc[s.sectionName] || 0) + 1;
      return acc;
    }, {});
    const facultyCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.facultyName] = (acc[s.facultyName] || 0) + 1;
      return acc;
    }, {});
    const roomCounts = filteredSchedules.reduce((acc, s) => {
      acc[s.roomName] = (acc[s.roomName] || 0) + 1;
      return acc;
    }, {});

    const topSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];
    const topFaculty = Object.entries(facultyCounts).sort((a, b) => b[1] - a[1])[0];
    const topRoom = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0];

    const summaryData = [
      ['Class Schedule Report'],
      [`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`],
      ...(filterInfo.length > 0 ? [['Filters: ' + filterInfo.join(' | ')]] : []),
      [],
      ['SUMMARY STATISTICS'],
      ['Total Schedules', filteredSchedules.length],
      [],
      ['BY SCHEDULE TYPE'],
      ...Object.entries(typeCounts).map(([type, count]) => [type, count, `${((count / filteredSchedules.length) * 100).toFixed(1)}%`]),
      [],
      ['BY DAY OF WEEK'],
      ...Object.entries(dayCounts).sort((a, b) => DAYS.indexOf(a[0]) - DAYS.indexOf(b[0])).map(([day, count]) => [day, count, `${((count / filteredSchedules.length) * 100).toFixed(1)}%`]),
      [],
      ['KEY METRICS'],
      ['Unique Sections', Object.keys(sectionCounts).length],
      ['Unique Faculty', Object.keys(facultyCounts).length],
      ['Unique Rooms', Object.keys(roomCounts).length],
      ...(topSection ? [['Most Active Section', topSection[0], `${topSection[1]} schedules`]] : []),
      ...(topFaculty ? [['Most Assigned Faculty', topFaculty[0], `${topFaculty[1]} schedules`]] : []),
      ...(topRoom ? [['Most Used Room', topRoom[0], `${topRoom[1]} schedules`]] : [])
    ];

    const infoWs = XLSX.utils.aoa_to_sheet(summaryData);
    infoWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, infoWs, 'Summary');

    XLSX.writeFile(wb, 'schedule-report.xlsx');
    closePreviewModal();
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

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'schoolYearSemester') {
      setFormData((prev) => ({ ...prev, schoolYearSemester: value, section: '', course: '' }));
      return;
    }
    if (name === 'section') {
      setFormData((prev) => ({ ...prev, section: value, course: '' }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (editingSchedule) {
        await axios.put(`/api/class-schedules/${editingSchedule.id}`, formData);
      } else {
        await axios.post('/api/class-schedules', formData);
      }

      await loadSchedules();
      closeModal();
    } catch (err) {
      console.error('Failed to save class schedule:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save class schedule.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await axios.delete(`/api/class-schedules/${id}`);
      await loadSchedules();
    } catch (err) {
      console.error('Failed to delete class schedule:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to delete class schedule.');
    }
  };

  const filteredCourseOptions = useMemo(() => {
    if (!formData.section) return courseOptions;
    const selectedSection = sectionOptions.find((s) => s._id === formData.section);
    if (!selectedSection) return courseOptions;
    
    console.log('Selected section:', selectedSection);
    console.log('Academic track:', selectedSection.academicTrack);
    
    // First try to filter by academic track
    if (selectedSection.academicTrack && selectedSection.academicTrack.courses && selectedSection.academicTrack.courses.length > 0) {
      const trackCourseIds = selectedSection.academicTrack.courses.map(c => typeof c === 'object' ? c._id : c);
      console.log('Track course IDs:', trackCourseIds);
      const filtered = courseOptions.filter((course) => trackCourseIds.includes(course._id));
      console.log('Filtered by track:', filtered);
      if (filtered.length > 0) return filtered;
    }
    
    // Fallback: filter by year level if no academic track or no matching courses
    const yearLevel = selectedSection.yearLevel;
    let yearNumber = null;
    if (yearLevel) {
      const match = yearLevel.match(/(\d+)/);
      if (match) yearNumber = parseInt(match[1]);
    }
    console.log('Year level:', yearLevel, 'Extracted year:', yearNumber);
    if (yearNumber) {
      const filtered = courseOptions.filter((course) => course.year === yearNumber);
      console.log('Filtered by year:', filtered);
      return filtered;
    }
    
    console.log('No filter applied, returning all courses');
    return courseOptions;
  }, [formData.section, sectionOptions, courseOptions]);

  const getUnscheduledCourses = (sectionId) => {
    const section = sectionOptions.find((s) => s._id === sectionId);
    if (!section || !section.academicTrack) return [];
    
    const trackCourseIds = section.academicTrack.courses?.map(c => typeof c === 'object' ? c._id : c) || [];
    const scheduledCourseIds = schedules
      .filter((s) => s.section === sectionId)
      .map((s) => s.course);
    
    const unscheduledIds = trackCourseIds.filter((id) => !scheduledCourseIds.includes(id));
    return courseOptions.filter((course) => unscheduledIds.includes(course._id));
  };

  const filteredSectionOptions = sectionOptions.filter(
    (section) => !formData.schoolYearSemester || section.schoolYearSemester?._id === formData.schoolYearSemester
  );

  return (
    <div className="schedule-management-container">
      {errorMessage && (
        <div className="sm-empty-state" style={{ marginBottom: '16px', color: '#b91c1c' }}>
          {errorMessage}
        </div>
      )}

      <div className="schedule-header">
        <div className="schedule-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Clock size={28} color="var(--primary-color)" />
            <h1 style={{ margin: 0 }}>Schedule Management</h1>
          </div>
          <p>Manage class schedules by school year, section, course, faculty, room, and time slot.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="export-dropdown" ref={exportMenuRef}>
            <button className="btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
              <FileText size={18} />
              Export Report
              <ChevronDown size={16} style={{ marginLeft: '4px' }} />
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button className="export-option" onClick={() => openPreviewModal('pdf')}>
                  <FileText size={16} style={{ marginRight: '8px' }} />
                  Preview & Export PDF
                </button>
                <button className="export-option" onClick={() => openPreviewModal('excel')}>
                  <FileText size={16} style={{ marginRight: '8px' }} />
                  Preview & Export Excel
                </button>
              </div>
            )}
          </div>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            New Schedule
          </button>
        </div>
      </div>

      <div className="schedule-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search course, section, faculty, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-sort-controls">
          <div className="control-group">
            <Calendar size={16} className="control-icon" />
            <select value={filterSchoolYear} onChange={(e) => setFilterSchoolYear(e.target.value)} className="control-select">
              <option value="All">All School Years</option>
              {schoolYearOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {formatSchoolYearLabel(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <Filter size={16} className="control-icon" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="control-select">
              <option value="All">All Types</option>
              <option value="Lecture">Lecture</option>
              <option value="Laboratory">Laboratory</option>
            </select>
          </div>

          <div className="control-group">
            <Calendar size={16} className="control-icon" />
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="control-select">
              <option value="All">All Days</option>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <Users size={16} className="control-icon" />
            <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="control-select">
              <option value="All">All Sections</option>
              {sectionOptions.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.sectionName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="schedule-grid">
        {!loading && filteredSchedules.length === 0 && (
          <div className="sm-empty-state">No class schedules found.</div>
        )}

        {groupedSchedules.map((group) => (
          <div key={group.sectionId || 'unassigned'} className="schedule-section-group">
            <div 
              className="schedule-section-header"
              onClick={() => toggleSection(group.sectionId || 'unassigned')}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <ChevronDown 
                  size={20} 
                  className={`section-chevron ${expandedSections[group.sectionId || 'unassigned'] ? 'expanded' : ''}`}
                />
                <div>
                  <h3 className="section-group-title">{group.sectionName}</h3>
                  <p className="section-group-subtitle">
                    {group.sectionYearLevel && `Year Level: ${group.sectionYearLevel}`}
                    {group.sectionYearLevel && group.schoolYearLabel && ' • '}
                    {group.schoolYearLabel}
                  </p>
                </div>
              </div>
              <div className="section-schedule-count">
                {group.schedules.length} schedule{group.schedules.length !== 1 ? 's' : ''}
                {group.sectionId && (() => {
                  const unscheduledCourses = getUnscheduledCourses(group.sectionId);
                  if (unscheduledCourses.length === 0) return null;
                  return <span> | {unscheduledCourses.length} unscheduled courses</span>;
                })()}
              </div>
            </div>
            {expandedSections[group.sectionId || 'unassigned'] && (
              <div className="schedules-container">
                {group.sectionId && (() => {
                  const unscheduledCourses = getUnscheduledCourses(group.sectionId);
                  if (unscheduledCourses.length === 0) return null;
                  return (
                    <div className="unscheduled-courses-section">
                      <h4 className="unscheduled-title">Unscheduled Courses ({unscheduledCourses.length})</h4>
                      <div className="unscheduled-courses-list">
                        {unscheduledCourses.map((course) => (
                          <div 
                            key={course._id} 
                            className="unscheduled-course-item clickable"
                            onClick={() => openScheduleForCourse(group.sectionId, course._id)}
                          >
                            <span className="unscheduled-course-code">{course.code}</span>
                            <span className="unscheduled-course-desc">{course.desc}</span>
                            <Plus size={14} className="add-icon" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                
                {group.schedules.map((schedule) => (
                  <div className="schedule-card" key={schedule.id}>
                    <div className="schedule-card-header">
                      <div className="course-code">{schedule.courseCode || 'N/A'}</div>
                      <div className="schedule-badges">
                        <div className={`purpose-badge ${schedule.scheduleType.toLowerCase()}`}>{schedule.scheduleType}</div>
                      </div>
                    </div>
                    <h3 className="subject-title">{schedule.subject || 'Untitled Course'}</h3>

                    <div className="schedule-details">
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>
                          {schedule.dayOfWeek} {schedule.schoolYearLabel ? `• ${schedule.schoolYearLabel}` : ''}
                        </span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>
                          {schedule.timeStart} - {schedule.timeEnd}
                        </span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{schedule.roomName}</span>
                      </div>
                      <div className="detail-item">
                        <Users size={16} />
                        <span>{schedule.facultyName}</span>
                      </div>
                    </div>

                    <div className="schedule-card-actions">
                      <button className="btn-icon edit" title="Edit" onClick={() => openEditModal(schedule)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(schedule.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {isPreviewModalOpen && (
        <div className="modal-overlay" onClick={closePreviewModal}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Report Preview - {previewFormat === 'pdf' ? 'PDF' : 'Excel'}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {filteredSchedules.length} records to export
                </p>
              </div>
              <button className="btn-close" onClick={closePreviewModal}>
                <X size={20} />
              </button>
            </div>

            <div className="preview-body">
              <div className="preview-info">
                <div className="preview-info-item">
                  <strong>Report Type:</strong> Class Schedule Report
                </div>
                <div className="preview-info-item">
                  <strong>Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="preview-info-item">
                  <strong>Total Records:</strong> {filteredSchedules.length}
                </div>
                {(filterSchoolYear !== 'All' || filterType !== 'All' || filterDay !== 'All' || filterSection !== 'All' || searchTerm) && (
                  <div className="preview-info-item">
                    <strong>Applied Filters:</strong>
                    <div className="preview-filters">
                      {filterSchoolYear !== 'All' && (
                        <span className="preview-filter-tag">
                          School Year: {schoolYearOptions.find(s => s._id === filterSchoolYear) ? formatSchoolYearLabel(schoolYearOptions.find(s => s._id === filterSchoolYear)) : filterSchoolYear}
                        </span>
                      )}
                      {filterType !== 'All' && <span className="preview-filter-tag">Type: {filterType}</span>}
                      {filterDay !== 'All' && <span className="preview-filter-tag">Day: {filterDay}</span>}
                      {filterSection !== 'All' && (
                        <span className="preview-filter-tag">
                          Section: {sectionOptions.find(s => s._id === filterSection)?.sectionName || filterSection}
                        </span>
                      )}
                      {searchTerm && <span className="preview-filter-tag">Search: &quot;{searchTerm}&quot;</span>}
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
                    <h5>Schedule Type Distribution</h5>
                    <div className="preview-chart-container pie">
                      <Pie data={typeChartData} options={chartOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card">
                    <h5>Day Distribution</h5>
                    <div className="preview-chart-container bar">
                      <Bar data={dayChartData} options={barOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card">
                    <h5>Section Distribution</h5>
                    <div className="preview-chart-container bar">
                      <Bar data={sectionChartData} options={barOptions} />
                    </div>
                  </div>
                  <div className="preview-chart-card summary">
                    <h5>Summary Statistics</h5>
                    <div className="preview-stats">
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Total Schedules</span>
                        <span className="preview-stat-value">{chartStats.total}</span>
                      </div>
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Schedule Types</span>
                        <span className="preview-stat-value">{chartStats.types}</span>
                      </div>
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Days Covered</span>
                        <span className="preview-stat-value">{chartStats.days}</span>
                      </div>
                      <div className="preview-stat-item">
                        <span className="preview-stat-label">Sections</span>
                        <span className="preview-stat-value">{chartStats.sections}</span>
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
                      <th>Course Code</th>
                      <th>Subject</th>
                      <th>Section</th>
                      <th>Faculty</th>
                      <th>Room</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>{schedule.courseCode}</td>
                        <td>{schedule.subject}</td>
                        <td>{schedule.sectionName}</td>
                        <td>{schedule.facultyName}</td>
                        <td>{schedule.roomName}</td>
                        <td>{schedule.dayOfWeek}</td>
                        <td>{schedule.timeStart} - {schedule.timeEnd}</td>
                        <td>
                          <span className={`sm-status-badge ${schedule.scheduleType.toLowerCase()}`}>
                            {schedule.scheduleType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePreviewModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={previewFormat === 'pdf' ? generatePDFReport : generateExcelReport}
              >
                <Download size={16} style={{ marginRight: '6px' }} />
                Download {previewFormat === 'pdf' ? 'PDF' : 'Excel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSchedule ? 'Edit Class Schedule' : 'Add Class Schedule'}</h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="schedule-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>School Year / Semester</label>
                  <select
                    name="schoolYearSemester"
                    value={formData.schoolYearSemester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select school year</option>
                    {schoolYearOptions.map((item) => (
                      <option key={item._id} value={item._id}>
                        {formatSchoolYearLabel(item)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select name="section" value={formData.section} onChange={handleInputChange} required>
                    <option value="">Select section</option>
                    {filteredSectionOptions.map((item) => (
                      <option key={item._id} value={item._id}>
                        {`${item.sectionName} (${item.yearLevel || 'No year'} • ${item.schoolYearLabel})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Course</label>
                  <select name="course" value={formData.course} onChange={handleInputChange} required>
                    <option value="">Select course</option>
                    {filteredCourseOptions.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.desc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Faculty</label>
                  <select name="faculty" value={formData.faculty} onChange={handleInputChange} required>
                    <option value="">Select faculty</option>
                    {facultyOptions.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {formatFacultyName(faculty)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Room</label>
                  <input
                    type="text"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleInputChange}
                    placeholder="e.g. Room 304 / Lab 1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Schedule Type</label>
                  <select name="scheduleType" value={formData.scheduleType} onChange={handleInputChange} required>
                    <option value="Lecture">Lecture</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Day of Week</label>
                  <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleInputChange} required>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" name="timeStart" value={formData.timeStart} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" name="timeEnd" value={formData.timeEnd} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSchedule ? 'Update Schedule' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
