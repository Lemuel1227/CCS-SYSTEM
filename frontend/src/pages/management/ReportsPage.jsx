import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  FileText,
  Download,
  Users,
  Clock,
  BookOpen,
  BarChart3,
  PieChart,
  X,
  Filter,
  Calendar,
  ChevronDown,
  PieChart as PieChartIcon,
  School,
  Award,
  FileSpreadsheet
} from 'lucide-react';
import './ReportsPage.css';
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

const REPORT_TYPES = [
  {
    id: 'faculty',
    title: 'Faculty Report',
    description: 'Comprehensive faculty data with department distribution, academic ranks, and employment status',
    icon: Users,
    color: '#3b82f6',
    allowedRoles: ['admin', 'faculty']
  },
  {
    id: 'student',
    title: 'Student Report',
    description: 'Complete student information with program distribution, year levels, and academic status',
    icon: School,
    color: '#10b981',
    allowedRoles: ['admin', 'faculty']
  },
  {
    id: 'schedule',
    title: 'Schedule Report',
    description: 'Class schedules with course distribution, faculty assignments, and room utilization',
    icon: Clock,
    color: '#f59e0b',
    allowedRoles: ['admin', 'faculty']
  },
  {
    id: 'course',
    title: 'Course Report',
    description: 'Course catalog with program distribution and academic year breakdown',
    icon: BookOpen,
    color: '#8b5cf6',
    allowedRoles: ['admin', 'faculty']
  }
];

const ReportsPage = ({ userRole }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [sections, setSections] = useState([]);

  // Filter states
  const [filterSchoolYear, setFilterSchoolYear] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterRank, setFilterRank] = useState('All');
  const [filterCourseYear, setFilterCourseYear] = useState('All');
  const [filterCourseSemester, setFilterCourseSemester] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data based on selected report
  useEffect(() => {
    if (!selectedReport) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        switch (selectedReport.id) {
          case 'faculty':
            const facultyRes = await axios.get('/api/faculty');
            setFaculties(facultyRes.data || []);
            break;
          case 'student':
            const studentRes = await axios.get('/api/students');
            setStudents(studentRes.data?.students || studentRes.data || []);
            break;
          case 'schedule':
            const scheduleRes = await axios.get('/api/class-schedules');
            setSchedules(scheduleRes.data || []);
            // Load options separately for filters
            try {
              const optionsRes = await axios.get('/api/class-schedules/options');
              setSections(optionsRes.data?.sections || []);
            } catch (err) {
              console.error('Failed to load section options:', err);
            }
            break;
          case 'course':
            const courseRes = await axios.get('/api/courses');
            setCourses(courseRes.data || []);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedReport]);

  // Filtered data based on report type
  const filteredData = useMemo(() => {
    if (!selectedReport) return [];

    let data = [];
    switch (selectedReport.id) {
      case 'faculty':
        data = faculties.filter(f => {
          const matchesSearch = !searchTerm || 
            f.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.department?.toLowerCase().includes(searchTerm.toLowerCase());
          const status = f.status || 'Active';
          const academicRank = f.academicRank || 'Instructor';
          const employmentType = f.employmentType || 'Full-time';
          const matchesStatus = filterStatus === 'All' || status === filterStatus;
          const matchesDept = filterDepartment === 'All' || f.department === filterDepartment;
          const matchesRank = filterRank === 'All' || academicRank === filterRank;
          return matchesSearch && matchesStatus && matchesDept && matchesRank;
        }).map(f => ({
          ...f,
          status: f.status || 'Active',
          academicRank: f.academicRank || 'Instructor',
          employmentType: f.employmentType || 'Full-time',
          email: f.email || f.user?.email || '-'
        }));
        break;
      case 'student':
        data = students.filter(s => {
          const matchesSearch = !searchTerm ||
            s.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = filterStatus === 'All' || s.academicStatus === filterStatus;
          const matchesProgram = filterProgram === 'All' || s.program === filterProgram;
          return matchesSearch && matchesStatus && matchesProgram;
        }).map(s => ({
          id: s._id,
          studentNumber: s.studentNumber || s.studentNo,
          firstName: s.firstName,
          lastName: s.lastName,
          program: s.program,
          yearLevel: s.yearLevel,
          section: s.section?.sectionName || s.section || '-',
          academicStatus: s.academicStatus || (s.status === 'Inactive' ? 'Irregular' : 'Regular'),
          email: s.email || s.user?.email || '-',
          gender: s.gender
        }));
        break;
      case 'schedule':
        data = schedules.filter(s => {
          const matchesSearch = !searchTerm ||
            s.course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.section?.sectionName?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = filterType === 'All' || s.scheduleType === filterType;
          const matchesSection = filterSection === 'All' || s.section?._id === filterSection;
          return matchesSearch && matchesType && matchesSection;
        }).map(s => ({
          id: s._id,
          courseCode: s.course?.code || '',
          subject: s.course?.name || '',
          sectionName: s.section?.sectionName || '',
          facultyName: s.faculty ? `${s.faculty.firstName} ${s.faculty.lastName}` : '',
          roomName: s.roomName || '',
          dayOfWeek: s.dayOfWeek,
          timeStart: s.timeStart,
          timeEnd: s.timeEnd,
          scheduleType: s.scheduleType
        }));
        break;
      case 'course':
        data = courses.filter(c => {
          const matchesSearch = !searchTerm ||
            c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesYear = filterCourseYear === 'All' || c.year === parseInt(filterCourseYear);
          const matchesSemester = filterCourseSemester === 'All' || c.sem === parseInt(filterCourseSemester);
          return matchesSearch && matchesYear && matchesSemester;
        });
        break;
      default:
        break;
    }
    return data;
  }, [selectedReport, faculties, students, schedules, courses,
      searchTerm, filterStatus, filterDepartment, filterProgram, filterType, filterSection, filterRank, filterCourseYear, filterCourseSemester]);

  // Chart data calculations
  const chartData = useMemo(() => {
    if (!selectedReport || filteredData.length === 0) return null;

    switch (selectedReport.id) {
      case 'faculty':
        const deptCounts = filteredData.reduce((acc, f) => {
          acc[f.department] = (acc[f.department] || 0) + 1;
          return acc;
        }, {});
        const statusCounts = filteredData.reduce((acc, f) => {
          acc[f.status] = (acc[f.status] || 0) + 1;
          return acc;
        }, {});
        const rankCounts = filteredData.reduce((acc, f) => {
          acc[f.academicRank] = (acc[f.academicRank] || 0) + 1;
          return acc;
        }, {});
        const empTypeCounts = filteredData.reduce((acc, f) => {
          acc[f.employmentType] = (acc[f.employmentType] || 0) + 1;
          return acc;
        }, {});
        return {
          pie: {
            labels: Object.keys(statusCounts),
            datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }]
          },
          bar: {
            labels: Object.keys(deptCounts),
            datasets: [{ label: 'Faculty by Department', data: Object.values(deptCounts), backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], borderWidth: 0 }]
          },
          bar2: {
            labels: Object.keys(rankCounts),
            datasets: [{ label: 'Faculty by Rank', data: Object.values(rankCounts), backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316'], borderWidth: 0 }]
          },
          stats: {
            total: filteredData.length,
            departments: Object.keys(deptCounts).length,
            ranks: Object.keys(rankCounts).length,
            types: Object.keys(empTypeCounts).length,
            active: statusCounts['Active'] || 0
          }
        };
      case 'student':
        const studentStatusCounts = filteredData.reduce((acc, s) => {
          acc[s.academicStatus] = (acc[s.academicStatus] || 0) + 1;
          return acc;
        }, {});
        const programCounts = filteredData.reduce((acc, s) => {
          acc[s.program] = (acc[s.program] || 0) + 1;
          return acc;
        }, {});
        const yearCounts = filteredData.reduce((acc, s) => {
          acc[s.yearLevel] = (acc[s.yearLevel] || 0) + 1;
          return acc;
        }, {});
        const genderCounts = filteredData.reduce((acc, s) => {
          acc[s.gender] = (acc[s.gender] || 0) + 1;
          return acc;
        }, {});
        return {
          pie: {
            labels: Object.keys(studentStatusCounts),
            datasets: [{ data: Object.values(studentStatusCounts), backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }]
          },
          bar: {
            labels: Object.keys(programCounts),
            datasets: [{ label: 'Students by Program', data: Object.values(programCounts), backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }]
          },
          bar2: {
            labels: Object.keys(yearCounts),
            datasets: [{ label: 'Students by Year Level', data: Object.values(yearCounts), backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316'], borderWidth: 0 }]
          },
          pie2: {
            labels: Object.keys(genderCounts),
            datasets: [{ data: Object.values(genderCounts), backgroundColor: ['#3b82f6', '#ec4899', '#8b5cf6'], borderWidth: 0 }]
          },
          stats: {
            total: filteredData.length,
            programs: Object.keys(programCounts).length,
            yearLevels: Object.keys(yearCounts).length,
            genderDistribution: genderCounts
          }
        };
      case 'schedule':
        const typeCounts = filteredData.reduce((acc, s) => {
          acc[s.scheduleType] = (acc[s.scheduleType] || 0) + 1;
          return acc;
        }, {});
        const dayCounts = filteredData.reduce((acc, s) => {
          acc[s.dayOfWeek] = (acc[s.dayOfWeek] || 0) + 1;
          return acc;
        }, {});
        const sectionCounts = filteredData.reduce((acc, s) => {
          acc[s.sectionName] = (acc[s.sectionName] || 0) + 1;
          return acc;
        }, {});
        return {
          pie: {
            labels: Object.keys(typeCounts),
            datasets: [{ data: Object.values(typeCounts), backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'], borderWidth: 0 }]
          },
          bar: {
            labels: Object.keys(dayCounts).sort((a, b) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(a) - ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(b)),
            datasets: [{ label: 'Schedules by Day', data: Object.keys(dayCounts).sort((a, b) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(a) - ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(b)).map(d => dayCounts[d]), backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'], borderWidth: 0 }]
          },
          bar2: {
            labels: Object.keys(sectionCounts),
            datasets: [{ label: 'Schedules by Section', data: Object.values(sectionCounts), backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#22c55e'], borderWidth: 0 }]
          },
          stats: {
            total: filteredData.length,
            types: Object.keys(typeCounts).length,
            days: Object.keys(dayCounts).length,
            sections: Object.keys(sectionCounts).length
          }
        };
      case 'course':
        // Units distribution (like CourseManagement)
        const unitsCounts = filteredData.reduce((acc, c) => {
          acc[c.units] = (acc[c.units] || 0) + 1;
          return acc;
        }, {});
        // Year distribution
        const courseYearCounts = filteredData.reduce((acc, c) => {
          acc[`Year ${c.year}`] = (acc[`Year ${c.year}`] || 0) + 1;
          return acc;
        }, {});
        // Semester distribution
        const semCounts = filteredData.reduce((acc, c) => {
          const semLabel = c.sem === 1 ? '1st Sem' : c.sem === 2 ? '2nd Sem' : 'Summer';
          acc[semLabel] = (acc[semLabel] || 0) + 1;
          return acc;
        }, {});
        return {
          pie: {
            labels: Object.keys(unitsCounts),
            datasets: [{ data: Object.values(unitsCounts), backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }]
          },
          bar: {
            labels: Object.keys(courseYearCounts).sort(),
            datasets: [{ label: 'Courses by Year', data: Object.values(courseYearCounts), backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316'], borderWidth: 0 }]
          },
          bar2: {
            labels: Object.keys(semCounts),
            datasets: [{ label: 'Courses by Semester', data: Object.values(semCounts), backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6'], borderWidth: 0 }]
          },
          stats: {
            total: filteredData.length,
            totalUnits: filteredData.reduce((sum, c) => sum + c.units, 0),
            avgUnits: filteredData.length ? (filteredData.reduce((sum, c) => sum + c.units, 0) / filteredData.length).toFixed(1) : 0,
            years: Object.keys(courseYearCounts).length
          }
        };
      default:
        return null;
    }
  }, [selectedReport, filteredData]);

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

  const openPreview = () => {
    setIsPreviewModalOpen(true);
  };

  const closePreview = () => {
    setIsPreviewModalOpen(false);
  };

  const generatePDF = () => {
    if (!selectedReport || filteredData.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text(`${selectedReport.title}`, pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generated: ${dateStr}`, pageWidth / 2, 22, { align: 'center' });

    // Add summary
    let startY = 28;
    if (chartData?.stats) {
      doc.setFontSize(11);
      doc.setTextColor(selectedReport.color);
      doc.text('Summary Statistics', 14, startY + 6);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);

      const stats = chartData.stats;
      const summaryLines = Object.entries(stats).map(([key, value]) => {
        if (typeof value === 'object') return null;
        return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
      }).filter(Boolean);

      let summaryY = startY + 12;
      summaryLines.forEach((line) => {
        doc.text(line, 14, summaryY);
        summaryY += 5;
      });
      startY = summaryY + 5;
    }

    // Table data based on report type
    let tableData = [];
    let headers = [];

    switch (selectedReport.id) {
      case 'faculty':
        headers = [['Employee ID', 'Name', 'Department', 'Rank', 'Type', 'Status', 'Email']];
        tableData = filteredData.map(f => [
          f.employeeIdNumber || f.employeeId,
          `${f.lastName}, ${f.firstName}`,
          f.department,
          f.academicRank,
          f.employmentType,
          f.status,
          f.email || '-'
        ]);
        break;
      case 'student':
        headers = [['Student No.', 'Name', 'Program', 'Year', 'Section', 'Status', 'Email']];
        tableData = filteredData.map(s => [
          s.studentNumber || s.studentNo,
          `${s.lastName}, ${s.firstName}`,
          s.program,
          s.yearLevel,
          s.section?.sectionName || s.section || '-',
          s.academicStatus,
          s.email || '-'
        ]);
        break;
      case 'schedule':
        headers = [['Course Code', 'Subject', 'Section', 'Faculty', 'Room', 'Day', 'Time', 'Type']];
        tableData = filteredData.map(s => [
          s.courseCode,
          s.subject,
          s.sectionName,
          s.facultyName,
          s.roomName,
          s.dayOfWeek,
          `${s.timeStart} - ${s.timeEnd}`,
          s.scheduleType
        ]);
        break;
      case 'course':
        headers = [['Course Code', 'Description', 'Year', 'Units', 'Semester']];
        tableData = filteredData.map(c => [
          c.code,
          c.desc || c.description || '-',
          c.year,
          c.units,
          c.sem || c.semester || '-'
        ]);
        break;
      default:
        break;
    }

    if (tableData.length > 0) {
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: startY,
        styles: { fontSize: 9 },
        headStyles: { fillColor: selectedReport.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)) }
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${totalPages} | Total Records: ${filteredData.length}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`${selectedReport.id}-report.pdf`);
    closePreview();
  };

  const generateExcel = () => {
    if (!selectedReport || filteredData.length === 0) return;

    let data = [];
    switch (selectedReport.id) {
      case 'faculty':
        data = filteredData.map(f => ({
          'Employee ID': f.employeeIdNumber || f.employeeId,
          'Last Name': f.lastName,
          'First Name': f.firstName,
          'Department': f.department,
          'Academic Rank': f.academicRank,
          'Employment Type': f.employmentType,
          'Status': f.status,
          'Email': f.email || ''
        }));
        break;
      case 'student':
        data = filteredData.map(s => ({
          'Student Number': s.studentNumber || s.studentNo,
          'Last Name': s.lastName,
          'First Name': s.firstName,
          'Program': s.program,
          'Year Level': s.yearLevel,
          'Section': s.section?.sectionName || s.section || '',
          'Academic Status': s.academicStatus,
          'Email': s.email || ''
        }));
        break;
      case 'schedule':
        data = filteredData.map(s => ({
          'Course Code': s.courseCode,
          'Subject': s.subject,
          'Section': s.sectionName,
          'Faculty': s.facultyName,
          'Room': s.roomName,
          'Day': s.dayOfWeek,
          'Start Time': s.timeStart,
          'End Time': s.timeEnd,
          'Type': s.scheduleType
        }));
        break;
      default:
        break;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${selectedReport.id}-report.xlsx`);
    closePreview();
  };

  const renderFilters = () => {
    switch (selectedReport?.id) {
      case 'faculty':
        return (
          <>
            <div className="rp-filter-group">
              <Filter size={16} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
            <div className="rp-filter-group">
              <Users size={16} />
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Information Systems">Information Systems</option>
              </select>
            </div>
            <div className="rp-filter-group">
              <Award size={16} />
              <select value={filterRank} onChange={(e) => setFilterRank(e.target.value)}>
                <option value="All">All Ranks</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Instructor">Instructor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          </>
        );
      case 'student':
        return (
          <>
            <div className="rp-filter-group">
              <Filter size={16} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
            <div className="rp-filter-group">
              <BookOpen size={16} />
              <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
                <option value="All">All Programs</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>
          </>
        );
      case 'schedule':
        return (
          <>
            <div className="rp-filter-group">
              <Filter size={16} />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
              </select>
            </div>
            <div className="rp-filter-group">
              <Users size={16} />
              <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                <option value="All">All Sections</option>
                {sections.map(s => (
                  <option key={s._id} value={s._id}>{s.sectionName}</option>
                ))}
              </select>
            </div>
          </>
        );
      case 'course':
        return (
          <>
            <div className="rp-filter-group">
              <BookOpen size={16} />
              <select value={filterCourseYear} onChange={(e) => setFilterCourseYear(e.target.value)}>
                <option value="All">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div className="rp-filter-group">
              <BookOpen size={16} />
              <select value={filterCourseSemester} onChange={(e) => setFilterCourseSemester(e.target.value)}>
                <option value="All">All Semesters</option>
                <option value="1">1st Sem</option>
                <option value="2">2nd Sem</option>
                <option value="3">Summer</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const availableReports = REPORT_TYPES.filter(r => r.allowedRoles.includes(userRole?.toLowerCase()));

  if (!selectedReport) {
    return (
      <div className="reports-page-container">
        <div className="reports-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FileText size={32} color="var(--primary-color)" />
            <h1>Reports Center</h1>
          </div>
          <p>Generate comprehensive reports for various modules in the CCS System</p>
        </div>

        <div className="reports-grid">
          {availableReports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="report-card"
                onClick={() => setSelectedReport(report)}
                style={{ borderLeftColor: report.color }}
              >
                <div className="report-card-icon" style={{ backgroundColor: `${report.color}20`, color: report.color }}>
                  <Icon size={28} />
                </div>
                <div className="report-card-content">
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                </div>
                <div className="report-card-arrow">
                  <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <button className="rp-back-btn" onClick={() => setSelectedReport(null)}>
          <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
          Back to Reports
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <div className="rp-header-icon" style={{ backgroundColor: `${selectedReport.color}20`, color: selectedReport.color }}>
            <selectedReport.icon size={28} />
          </div>
          <div>
            <h1>{selectedReport.title}</h1>
            <p>{selectedReport.description}</p>
          </div>
        </div>
      </div>

      <div className="rp-controls">
        <div className="rp-search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="rp-filters">
          {renderFilters()}
        </div>
        <div className="rp-actions">
          <button className="rp-btn-primary" onClick={() => openPreview()}>
            <FileText size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rp-loading">Loading data...</div>
      ) : (
        <>
          {chartData && (
            <div className="rp-charts-section">
              <h3><BarChart3 size={20} /> Data Analytics</h3>
              <div className="rp-charts-grid">
                <div className="rp-chart-card">
                  <h4>
                    {selectedReport.id === 'faculty' ? 'Status Distribution' : 
                     selectedReport.id === 'student' ? 'Academic Status Distribution' : 
                     selectedReport.id === 'course' ? 'Units Distribution' :
                     'Type Distribution'}
                  </h4>
                  <div className="rp-chart-container pie">
                    <Pie data={chartData.pie} options={chartOptions} />
                  </div>
                </div>
                <div className="rp-chart-card">
                  <h4>
                    {selectedReport.id === 'faculty' ? 'Department Distribution' : 
                     selectedReport.id === 'student' ? 'Program Distribution' : 
                     selectedReport.id === 'course' ? 'Courses by Year' :
                     'Day Distribution'}
                  </h4>
                  <div className="rp-chart-container bar">
                    <Bar data={chartData.bar} options={barOptions} />
                  </div>
                </div>
                {selectedReport.id !== 'course' && (
                  <div className="rp-chart-card">
                    <h4>
                      {selectedReport.id === 'faculty' ? 'Academic Rank Distribution' : 
                      selectedReport.id === 'student' ? 'Year Level Distribution' : 
                      'Section Distribution'}
                    </h4>
                    <div className="rp-chart-container bar">
                      <Bar data={chartData.bar2 || chartData.bar} options={barOptions} />
                    </div>
                  </div>
                )}
                {selectedReport.id === 'course' && (
                  <div className="rp-chart-card">
                    <h4>Courses by Semester</h4>
                    <div className="rp-chart-container bar">
                      <Bar data={chartData.bar2} options={barOptions} />
                    </div>
                  </div>
                )}
                {selectedReport.id === 'student' && chartData.pie2 && (
                  <div className="rp-chart-card">
                    <h4>Gender Distribution</h4>
                    <div className="rp-chart-container pie">
                      <Pie data={chartData.pie2} options={chartOptions} />
                    </div>
                  </div>
                )}
                {selectedReport.id !== 'student' && (
                  <div className="rp-chart-card summary">
                    <h4>Summary Statistics</h4>
                    <div className="rp-stats">
                      {selectedReport.id === 'faculty' && (
                        <>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Total Faculty</span>
                            <span className="rp-stat-value">{chartData.stats.total}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Departments</span>
                            <span className="rp-stat-value">{chartData.stats.departments}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Academic Ranks</span>
                            <span className="rp-stat-value">{chartData.stats.ranks}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Employment Types</span>
                            <span className="rp-stat-value">{chartData.stats.types}</span>
                          </div>
                        </>
                      )}
                      {selectedReport.id === 'schedule' && (
                        <>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Total Schedules</span>
                            <span className="rp-stat-value">{chartData.stats.total}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Schedule Types</span>
                            <span className="rp-stat-value">{chartData.stats.types}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Days Covered</span>
                            <span className="rp-stat-value">{chartData.stats.days}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Sections</span>
                            <span className="rp-stat-value">{chartData.stats.sections}</span>
                          </div>
                        </>
                      )}
                      {selectedReport.id === 'course' && (
                        <>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Total Courses</span>
                            <span className="rp-stat-value">{chartData.stats.total}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Total Units</span>
                            <span className="rp-stat-value">{chartData.stats.totalUnits}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Avg Units/Course</span>
                            <span className="rp-stat-value">{chartData.stats.avgUnits}</span>
                          </div>
                          <div className="rp-stat-item">
                            <span className="rp-stat-label">Year Levels</span>
                            <span className="rp-stat-value">{chartData.stats.years}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}</div>
            </div>
          )}

          <div className="rp-table-section">
            <h3><PieChartIcon size={20} /> Data Preview ({filteredData.length} records)</h3>
            <div className="rp-table-container">
              <table className="rp-table">
                <thead>
                  <tr>
                    {selectedReport.id === 'faculty' && (
                      <>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Rank</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Email</th>
                      </>
                    )}
                    {selectedReport.id === 'student' && (
                      <>
                        <th>Student No.</th>
                        <th>Name</th>
                        <th>Program</th>
                        <th>Year</th>
                        <th>Section</th>
                        <th>Status</th>
                        <th>Email</th>
                      </>
                    )}
                    {selectedReport.id === 'schedule' && (
                      <>
                        <th>Course Code</th>
                        <th>Subject</th>
                        <th>Section</th>
                        <th>Faculty</th>
                        <th>Room</th>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Type</th>
                      </>
                    )}
                    {selectedReport.id === 'course' && (
                      <>
                        <th>Course Code</th>
                        <th>Description</th>
                        <th>Year</th>
                        <th>Units</th>
                        <th>Semester</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id || item._id || index}>
                      {selectedReport.id === 'faculty' && (
                        <>
                          <td>{item.employeeIdNumber || item.employeeId}</td>
                          <td>{`${item.lastName}, ${item.firstName}`}</td>
                          <td>{item.department}</td>
                          <td>{item.academicRank}</td>
                          <td>{item.employmentType}</td>
                          <td>
                            <span className={`rp-status-badge ${item.status?.toLowerCase().replace(' ', '-')}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{item.email || '-'}</td>
                        </>
                      )}
                      {selectedReport.id === 'student' && (
                        <>
                          <td>{item.studentNumber || item.studentNo}</td>
                          <td>{`${item.lastName}, ${item.firstName}`}</td>
                          <td>{item.program}</td>
                          <td>{item.yearLevel}</td>
                          <td>{item.section?.sectionName || item.section || '-'}</td>
                          <td>
                            <span className={`rp-status-badge ${item.academicStatus?.toLowerCase()}`}>
                              {item.academicStatus}
                            </span>
                          </td>
                          <td>{item.email || '-'}</td>
                        </>
                      )}
                      {selectedReport.id === 'schedule' && (
                        <>
                          <td>{item.courseCode}</td>
                          <td>{item.subject}</td>
                          <td>{item.sectionName}</td>
                          <td>{item.facultyName}</td>
                          <td>{item.roomName}</td>
                          <td>{item.dayOfWeek}</td>
                          <td>{item.timeStart} - {item.timeEnd}</td>
                          <td>
                            <span className={`rp-status-badge ${item.scheduleType?.toLowerCase()}`}>
                              {item.scheduleType}
                            </span>
                          </td>
                        </>
                      )}
                      {selectedReport.id === 'course' && (
                        <>
                          <td>{item.code}</td>
                          <td>{item.desc || item.description || '-'}</td>
                          <td>{item.year}</td>
                          <td>{item.units}</td>
                          <td>{item.sem || item.semester || '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isPreviewModalOpen && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Report Preview</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {filteredData.length} records to export
                </p>
              </div>
              <button className="btn-close" onClick={closePreview}>
                <X size={20} />
              </button>
            </div>

            <div className="preview-body">
              <div className="preview-info">
                <div className="preview-info-item">
                  <strong>Report Type:</strong> {selectedReport.title}
                </div>
                <div className="preview-info-item">
                  <strong>Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="preview-info-item">
                  <strong>Total Records:</strong> {filteredData.length}
                </div>
                {(searchTerm || filterStatus !== 'All' || filterDepartment !== 'All' || filterProgram !== 'All' || filterType !== 'All' || filterSection !== 'All' || filterRank !== 'All') && (
                  <div className="preview-info-item">
                    <strong>Applied Filters:</strong>
                    <div className="preview-filters">
                      {searchTerm && <span className="preview-filter-tag">Search: "{searchTerm}"</span>}
                      {filterStatus !== 'All' && <span className="preview-filter-tag">Status: {filterStatus}</span>}
                      {filterDepartment !== 'All' && <span className="preview-filter-tag">Department: {filterDepartment}</span>}
                      {filterRank !== 'All' && <span className="preview-filter-tag">Rank: {filterRank}</span>}
                      {filterProgram !== 'All' && <span className="preview-filter-tag">Program: {filterProgram}</span>}
                      {filterType !== 'All' && <span className="preview-filter-tag">Type: {filterType}</span>}
                      {filterSection !== 'All' && <span className="preview-filter-tag">Section: {sections.find(s => s._id === filterSection)?.sectionName || filterSection}</span>}
                    </div>
                  </div>
                )}
              </div>

              {chartData && (
                <div className="preview-charts-section">
                  <h4 className="preview-section-title">
                    <BarChart3 size={18} style={{ marginRight: '8px' }} />
                    Data Analytics
                  </h4>
                  <div className="preview-charts-grid">
                    <div className="preview-chart-card">
                      <h5>
                        {selectedReport.id === 'faculty' ? 'Status Distribution' : 
                         selectedReport.id === 'student' ? 'Academic Status Distribution' : 
                         selectedReport.id === 'course' ? 'Units Distribution' :
                         'Type Distribution'}
                      </h5>
                      <div className="preview-chart-container pie">
                        <Pie data={chartData.pie} options={chartOptions} />
                      </div>
                    </div>
                    <div className="preview-chart-card">
                      <h5>
                        {selectedReport.id === 'faculty' ? 'Department Distribution' : 
                         selectedReport.id === 'student' ? 'Program Distribution' : 
                         selectedReport.id === 'course' ? 'Courses by Year' :
                         'Day Distribution'}
                      </h5>
                      <div className="preview-chart-container bar">
                        <Bar data={chartData.bar} options={barOptions} />
                      </div>
                    </div>
                    {selectedReport.id !== 'course' && (
                      <div className="preview-chart-card">
                        <h5>
                          {selectedReport.id === 'faculty' ? 'Academic Rank Distribution' : 
                          selectedReport.id === 'student' ? 'Year Level Distribution' : 
                          'Section Distribution'}
                        </h5>
                        <div className="preview-chart-container bar">
                          <Bar data={chartData.bar2 || chartData.bar} options={barOptions} />
                        </div>
                      </div>
                    )}
                    {selectedReport.id === 'course' && (
                      <div className="preview-chart-card">
                        <h5>Courses by Semester</h5>
                        <div className="preview-chart-container bar">
                          <Bar data={chartData.bar2} options={barOptions} />
                        </div>
                      </div>
                    )}
                    {selectedReport.id === 'student' && chartData.pie2 && (
                      <div className="preview-chart-card">
                        <h5>Gender Distribution</h5>
                        <div className="preview-chart-container pie">
                          <Pie data={chartData.pie2} options={chartOptions} />
                        </div>
                      </div>
                    )}
                    {selectedReport.id !== 'student' && (
                      <div className="preview-chart-card summary">
                        <h5>Summary Statistics</h5>
                        <div className="preview-stats">
                          {selectedReport.id === 'faculty' && (
                            <>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Total Faculty</span>
                                <span className="preview-stat-value">{chartData.stats.total}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Departments</span>
                                <span className="preview-stat-value">{chartData.stats.departments}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Academic Ranks</span>
                                <span className="preview-stat-value">{chartData.stats.ranks}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Employment Types</span>
                                <span className="preview-stat-value">{chartData.stats.types}</span>
                              </div>
                            </>
                          )}
                          {selectedReport.id === 'schedule' && (
                            <>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Total Schedules</span>
                                <span className="preview-stat-value">{chartData.stats.total}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Schedule Types</span>
                                <span className="preview-stat-value">{chartData.stats.types}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Days Covered</span>
                                <span className="preview-stat-value">{chartData.stats.days}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Sections</span>
                                <span className="preview-stat-value">{chartData.stats.sections}</span>
                              </div>
                            </>
                          )}
                          {selectedReport.id === 'course' && (
                            <>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Total Courses</span>
                                <span className="preview-stat-value">{chartData.stats.total}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Total Units</span>
                                <span className="preview-stat-value">{chartData.stats.totalUnits}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Avg Units/Course</span>
                                <span className="preview-stat-value">{chartData.stats.avgUnits}</span>
                              </div>
                              <div className="preview-stat-item">
                                <span className="preview-stat-label">Year Levels</span>
                                <span className="preview-stat-value">{chartData.stats.years}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="preview-table-container">
                <h4 className="preview-section-title">
                  <PieChartIcon size={18} style={{ marginRight: '8px' }} />
                  Data Preview ({filteredData.length} records)
                </h4>
                <div className="preview-table-wrapper">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {selectedReport.id === 'faculty' && (
                          <>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Rank</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Email</th>
                          </>
                        )}
                        {selectedReport.id === 'student' && (
                          <>
                            <th>Student No.</th>
                            <th>Name</th>
                            <th>Program</th>
                            <th>Year</th>
                            <th>Section</th>
                            <th>Status</th>
                            <th>Email</th>
                          </>
                        )}
                        {selectedReport.id === 'schedule' && (
                          <>
                            <th>Course Code</th>
                            <th>Subject</th>
                            <th>Section</th>
                            <th>Faculty</th>
                            <th>Room</th>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Type</th>
                          </>
                        )}
                        {selectedReport.id === 'course' && (
                          <>
                            <th>Course Code</th>
                            <th>Description</th>
                            <th>Year</th>
                            <th>Units</th>
                            <th>Semester</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={item.id || item._id || index}>
                          {selectedReport.id === 'faculty' && (
                            <>
                              <td>{item.employeeIdNumber || item.employeeId}</td>
                              <td>{`${item.lastName}, ${item.firstName}`}</td>
                              <td>{item.department}</td>
                              <td>{item.academicRank}</td>
                              <td>{item.employmentType}</td>
                              <td>
                                <span className={`rp-status-badge ${item.status?.toLowerCase().replace(' ', '-')}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td>{item.email || '-'}</td>
                            </>
                          )}
                          {selectedReport.id === 'student' && (
                            <>
                              <td>{item.studentNumber || item.studentNo}</td>
                              <td>{`${item.lastName}, ${item.firstName}`}</td>
                              <td>{item.program}</td>
                              <td>{item.yearLevel}</td>
                              <td>{item.section?.sectionName || item.section || '-'}</td>
                              <td>
                                <span className={`rp-status-badge ${item.academicStatus?.toLowerCase()}`}>
                                  {item.academicStatus}
                                </span>
                              </td>
                              <td>{item.email || '-'}</td>
                            </>
                          )}
                          {selectedReport.id === 'schedule' && (
                            <>
                              <td>{item.courseCode}</td>
                              <td>{item.subject}</td>
                              <td>{item.sectionName}</td>
                              <td>{item.facultyName}</td>
                              <td>{item.roomName}</td>
                              <td>{item.dayOfWeek}</td>
                              <td>{item.timeStart} - {item.timeEnd}</td>
                              <td>
                                <span className={`rp-status-badge ${item.scheduleType?.toLowerCase()}`}>
                                  {item.scheduleType}
                                </span>
                              </td>
                            </>
                          )}
                          {selectedReport.id === 'course' && (
                            <>
                              <td>{item.code}</td>
                              <td>{item.desc || item.description || '-'}</td>
                              <td>{item.year}</td>
                              <td>{item.units}</td>
                              <td>{item.sem || item.semester || '-'}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closePreview}>
                Close
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={generatePDF}
                >
                  <FileText size={16} style={{ marginRight: '6px' }} />
                  Download PDF
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={generateExcel}
                >
                  <FileSpreadsheet size={16} style={{ marginRight: '6px' }} />
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
