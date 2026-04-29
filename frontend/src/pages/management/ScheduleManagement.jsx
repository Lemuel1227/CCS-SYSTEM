import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Users, Plus, Search, Edit, Trash2, X, Filter, ChevronDown } from 'lucide-react';
import './ScheduleManagement.css';

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
  const [sortBy, setSortBy] = useState('time');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [expandedSections, setExpandedSections] = useState({});

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
        return matchesSearch && matchesSchoolYear && matchesType && matchesDay;
      })
      .sort((a, b) => {
        if (sortBy === 'time') {
          const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
          if (dayDiff !== 0) return dayDiff;
          return a.timeStart.localeCompare(b.timeStart);
        }
        if (sortBy === 'subject_asc') return a.subject.localeCompare(b.subject);
        if (sortBy === 'subject_desc') return b.subject.localeCompare(a.subject);
        if (sortBy === 'room_asc') return a.roomName.localeCompare(b.roomName);
        return 0;
      });
  }, [schedules, searchTerm, filterSchoolYear, filterType, filterDay, sortBy]);

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

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'schoolYearSemester') {
      setFormData((prev) => ({ ...prev, schoolYearSemester: value, section: '' }));
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
    if (!selectedSection || !selectedSection.academicTrack) return courseOptions;
    const trackCourseIds = selectedSection.academicTrack.courses?.map(c => typeof c === 'object' ? c._id : c) || [];
    if (trackCourseIds.length === 0) return courseOptions;
    return courseOptions.filter((course) => trackCourseIds.includes(course._id));
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
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          New Schedule
        </button>
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

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="control-select sort-select">
            <option value="time">Sort by Time</option>
            <option value="subject_asc">Course (A-Z)</option>
            <option value="subject_desc">Course (Z-A)</option>
            <option value="room_asc">Room (A-Z)</option>
          </select>
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
