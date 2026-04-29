import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import './MySchedule.css';

const MySchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students/me/schedule');
        setSchedules(response.data || []);
      } catch (err) {
        console.error('Failed to load schedule:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to load schedule.');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  const scheduleData = schedules.map((item) => ({
    id: item._id,
    subjectCode: item.course?.code || 'N/A',
    subjectName: item.course?.desc || 'Untitled Course',
    time: `${item.timeStart} - ${item.timeEnd}`,
    day: item.dayOfWeek,
    room: item.roomName,
    instructor: item.faculty ? [item.faculty.firstName, item.faculty.lastName].filter(Boolean).join(' ') : 'TBA',
    type: item.scheduleType || 'Lecture'
  }));

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [activeDay, setActiveDay] = useState('All');

  const filteredSchedule = activeDay === 'All' 
    ? scheduleData 
    : scheduleData.filter(s => s.day === activeDay);

  return (
    <div className="my-schedule-container">
      <div className="schedule-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CalendarIcon size={32} color="var(--primary-color)" />
            <h1 style={{ margin: 0 }}>My Schedule</h1>
          </div>
          <p>View your classes, venues, and instructors for the current semester.</p>
        </div>
        <div className="header-right">
          <div className="semester-badge">
            2nd Semester, A.Y. 2025-2026
          </div>
          <div className="date-badge">
            {currentDate.toLocaleString('default', { month: 'short' })} {currentDate.getDate()}, {currentDate.toLocaleString('default', { weekday: 'short' })}
          </div>
        </div>
      </div>

      <div className="schedule-filters-top">
        <div className="days-navigation horizontal">
          {daysOfWeek.map(day => (
            <button 
              key={day} 
              className={`day-nav-btn ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(day)}
            >
              {day}
              {scheduleData.some(s => s.day === day) && day !== 'All' && <span className="class-indicator" />}
            </button>
          ))}
        </div>
      </div>

      <div className="schedule-content-wrapper single-column">
        {/* Classes List */}
        <div className="schedule-main-content">
          {errorMessage && (
            <div style={{ color: '#dc2626', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '16px' }}>
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Loading schedule...
            </div>
          ) : (
            <>
              <div className="day-header">
                <h2>{activeDay === 'All' ? 'All Classes' : `${activeDay}'s Classes`}</h2>
                <div className="total-classes">
                  {filteredSchedule.length} {filteredSchedule.length === 1 ? 'Class' : 'Classes'}
                </div>
              </div>

              {filteredSchedule.length > 0 ? (
                <div className="agenda-list">
                  {filteredSchedule.map((cls) => (
                    <div className="agenda-card" key={cls.id}>
                      <div className="agenda-time-column">
                        {activeDay === 'All' && <span className="day-text">{cls.day}</span>}
                        <Clock size={16} />
                        <span className="time-text">{cls.time.split(' - ')[0]}</span>
                        <span className="time-end">{cls.time.split(' - ')[1]}</span>
                      </div>
                      <div className={`agenda-details-column type-${cls.type.toLowerCase()}`}>
                        <div className="class-type-tag">{cls.type}</div>
                        <h3 className="subject-name">{cls.subjectCode}: {cls.subjectName}</h3>
                        
                        <div className="class-meta">
                          <div className="meta-item">
                            <MapPin size={15} />
                            <span>{cls.room}</span>
                          </div>
                          <div className="meta-item">
                            <User size={15} />
                            <span>{cls.instructor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-schedule">
                  <CalendarIcon size={48} className="empty-icon" />
                  <h3>Free Day!</h3>
                  <p>You don't have any classes scheduled for this day.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySchedule;