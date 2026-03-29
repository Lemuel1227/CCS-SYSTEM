import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import './MySchedule.css';

const MySchedule = () => {
  // eslint-disable-next-line no-unused-vars
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock Schedule Data for Student
  const scheduleData = [
    {
      id: 1,
      subjectCode: 'CC104',
      subjectName: 'Data Structures and Algorithms',
      time: '08:00 AM - 11:00 AM',
      day: 'Monday',
      room: 'Lab 1',
      instructor: 'Prof. Alan Turing',
      type: 'Laboratory'
    },
    {
      id: 2,
      subjectCode: 'SE101',
      subjectName: 'Software Engineering 1',
      time: '01:00 PM - 03:00 PM',
      day: 'Tuesday',
      room: 'Room 302',
      instructor: 'Dr. Grace Hopper',
      type: 'Lecture'
    },
    {
      id: 3,
      subjectCode: 'GE-EL1',
      subjectName: 'Elective 1',
      time: '10:00 AM - 12:00 PM',
      day: 'Wednesday',
      room: 'Room 205',
      instructor: 'Ms. Ada Lovelace',
      type: 'Lecture'
    },
    {
      id: 4,
      subjectCode: 'CC105',
      subjectName: 'Information Management',
      time: '02:00 PM - 05:00 PM',
      day: 'Thursday',
      room: 'Lab 3',
      instructor: 'Mr. John von Neumann',
      type: 'Laboratory'
    },
    {
      id: 5,
      subjectCode: 'PE3',
      subjectName: 'Physical Education 3',
      time: '08:00 AM - 10:00 AM',
      day: 'Friday',
      room: 'Gymnasium',
      instructor: 'Coach Smith',
      type: 'Activity'
    },
  ];

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
        </div>
      </div>
    </div>
  );
};

export default MySchedule;