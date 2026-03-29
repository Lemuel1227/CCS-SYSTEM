import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, BookOpen, Plus, Search, Edit, Trash2, X, Filter } from 'lucide-react';
import './ScheduleManagement.css';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      purpose: 'Regular Class',
      subject: 'Data Structures and Algorithms',
      courseCode: 'IT-201',
      section: 'BSIT-2A',
      instructor: 'Dr. John Doe',
      room: 'Lab 1',
      day: ['Monday', 'Wednesday'],
      startTime: '08:00',
      endTime: '11:00'
    },
    {
      id: 2,
      purpose: 'Examination',
      subject: 'Web Technologies',
      courseCode: 'IT-301',
      section: 'BSIT-3A',
      instructor: 'Prof. Jane Smith',
      room: 'Room 304',
      day: ['Tuesday'],
      startTime: '13:00',
      endTime: '16:00'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('All');
  const [filterDay, setFilterDay] = useState('All');
  const [sortBy, setSortBy] = useState('time');
  const [formData, setFormData] = useState({
    purpose: 'Regular Class',
    subject: '',
    courseCode: '',
    section: '',
    instructor: '',
    room: '',
    day: [],
    startTime: '',
    endTime: ''
  });

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          schedule.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          schedule.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPurpose = filterPurpose === 'All' || schedule.purpose === filterPurpose;
    const matchesDay = filterDay === 'All' || schedule.day.includes(filterDay);
    
    return matchesSearch && matchesPurpose && matchesDay;
  }).sort((a, b) => {
    if (sortBy === 'time') {
      const days = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
      // Sort by the earliest day in the array
      const aEarliestDay = Math.min(...a.day.map(d => days[d]));
      const bEarliestDay = Math.min(...b.day.map(d => days[d]));
      
      if (aEarliestDay !== bEarliestDay) {
        return aEarliestDay - bEarliestDay;
      }
      return a.startTime.localeCompare(b.startTime);
    } else if (sortBy === 'subject_asc') {
      return a.subject.localeCompare(b.subject);
    } else if (sortBy === 'subject_desc') {
      return b.subject.localeCompare(a.subject);
    } else if (sortBy === 'room_asc') {
      return a.room.localeCompare(b.room);
    }
    return 0;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const isSelected = prev.day.includes(day);
      if (isSelected) {
        return { ...prev, day: prev.day.filter(d => d !== day) };
      } else {
        return { ...prev, day: [...prev.day, day] };
      }
    });
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (formData.day.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    const newSchedule = {
      ...formData,
      id: schedules.length + 1
    };
    setSchedules([...schedules, newSchedule]);
    setIsModalOpen(false);
    setFormData({
      purpose: 'Regular Class',
      subject: '',
      courseCode: '',
      section: '',
      instructor: '',
      room: '',
      day: [],
      startTime: '',
      endTime: ''
    });
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    <div className="schedule-management-container">
      <div className="schedule-header">
        <div className="schedule-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Clock size={28} color="var(--primary-color)" />
            <h1 style={{ margin: 0 }}>Schedule Management</h1>
          </div>
          <p>Organize classes, sections, and venues efficiently</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          New Schedule
        </button>
      </div>

      <div className="schedule-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search subject, section, or room..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-sort-controls">
          <div className="control-group">
            <Filter size={16} className="control-icon" />
            <select value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)} className="control-select">
              <option value="All">All Purposes</option>
              <option value="Regular Class">Regular Class</option>
              <option value="Examination">Examination</option>
              <option value="Meeting">Meeting</option>
              <option value="Special Activity">Special Activity</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="control-group">
            <Calendar size={16} className="control-icon" />
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="control-select">
              <option value="All">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="control-select sort-select">
            <option value="time">Sort by Time</option>
            <option value="subject_asc">Subject (A-Z)</option>
            <option value="subject_desc">Subject (Z-A)</option>
            <option value="room_asc">Room (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="schedule-grid">
        {filteredSchedules.map(schedule => (
          <div className="schedule-card" key={schedule.id}>
            <div className="schedule-card-header">
              <div className="course-code">{schedule.courseCode}</div>
              <div className="schedule-badges">
                <div className={`purpose-badge ${schedule.purpose.replace(/\s+/g, '-').toLowerCase()}`}>
                  {schedule.purpose}
                </div>
                <div className="section-badge">{schedule.section}</div>
              </div>
            </div>
            <h3 className="subject-title">{schedule.subject}</h3>
            
            <div className="schedule-details">
              <div className="detail-item">
                <Calendar size={16} />
                <span>{schedule.day.join(', ')}</span>
              </div>
              <div className="detail-item">
                <Clock size={16} />
                <span>{schedule.startTime} - {schedule.endTime}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span>{schedule.room}</span>
              </div>
              <div className="detail-item">
                <Users size={16} />
                <span>{schedule.instructor}</span>
              </div>
            </div>

            <div className="schedule-card-actions">
              <button className="btn-icon edit" title="Edit"><Edit size={16} /></button>
              <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(schedule.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Schedule</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSchedule} className="schedule-form">
              <div className="form-group-row">
                <div className="form-group full-width">
                  <label>Intended Purpose</label>
                  <select name="purpose" value={formData.purpose} onChange={handleInputChange}>
                    <option value="Regular Class">Regular Class</option>
                    <option value="Examination">Examination</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Special Activity">Special Activity</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input type="text" name="courseCode" required={formData.purpose === 'Regular Class' || formData.purpose === 'Examination'} value={formData.courseCode} onChange={handleInputChange} placeholder="e.g. IT-101" />
                </div>
                <div className="form-group">
                  <label>Subject / Event Title</label>
                  <input type="text" name="subject" required value={formData.subject} onChange={handleInputChange} placeholder="e.g. Introduction to Programming" />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Section / Attendees</label>
                  <input type="text" name="section" required value={formData.section} onChange={handleInputChange} placeholder="e.g. BSIT-1A or All Faculty" />
                </div>
                <div className="form-group">
                  <label>Instructor / Coordinator</label>
                  <input type="text" name="instructor" required value={formData.instructor} onChange={handleInputChange} placeholder="Person in charge" />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group full-width">
                  <label>Days</label>
                  <div className="day-selector-group">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-selector-btn ${formData.day.includes(day) ? 'active' : ''}`}
                        onClick={() => handleDayToggle(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Room / Place</label>
                  <input type="text" name="room" required value={formData.room} onChange={handleInputChange} placeholder="e.g. Lab 1" />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" name="startTime" required value={formData.startTime} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" name="endTime" required value={formData.endTime} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;