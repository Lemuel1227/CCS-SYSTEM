import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Filter, CalendarDays, CheckCircle, Info } from 'lucide-react';
import './Events.css';

const mockEvents = [
  {
    id: 'evt_1',
    title: 'CodeFest 2026',
    description: 'Annual college hackathon. Build amazing projects in 48 hours with fellow students!',
    date: '2026-04-15',
    time: '08:00 AM',
    location: 'CCS Main Lab',
    status: 'Upcoming',
    maxParticipants: 100,
    participants: ['stu_12345', 'stu_1', 'stu_2', 'stu_3']
  },
  {
    id: 'evt_2',
    title: 'Web Dev Workshop',
    description: 'Learn modern web development using React and modern CSS frameworks.',
    date: '2026-03-20',
    time: '01:00 PM',
    location: 'Online (Zoom)',
    status: 'Upcoming',
    maxParticipants: 50,
    participants: ['stu_1', 'stu_4']
  },
  {
    id: 'evt_3',
    title: 'AI in Tech Seminar',
    description: 'Guest speaker discussing the future of Artificial Intelligence in daily life.',
    date: '2026-02-28',
    time: '10:00 AM',
    location: 'Auditorium A',
    status: 'Completed',
    maxParticipants: 200,
    participants: ['stu_12345', 'stu_10', 'stu_11', 'stu_12']
  },
  {
    id: 'evt_4',
    title: 'Coding Bootcamp Phase 1',
    description: 'First phase of the intensive coding bootcamp for freshman beginners.',
    date: '2026-03-13',
    time: '09:00 AM',
    location: 'Room 302',
    status: 'Ongoing',
    maxParticipants: 40,
    participants: Array.from({ length: 38 }, (_, i) => `stu_${i + 100}`)
  }
];

const Events = () => {
  const [events, setEvents] = useState(() => {
    try {
      const storedEvents = localStorage.getItem('ccs_events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        // Ensure mock events are always injected if missing (for demonstration purposes)
        const hasMockData = parsedEvents.some(ev => ev.id === 'evt_1');
        if (!hasMockData) {
          const mergedEvents = [...mockEvents, ...parsedEvents];
          localStorage.setItem('ccs_events', JSON.stringify(mergedEvents));
          return mergedEvents;
        }
        return parsedEvents;
      }
      localStorage.setItem('ccs_events', JSON.stringify(mockEvents));
      return mockEvents;
    } catch {
      localStorage.setItem('ccs_events', JSON.stringify(mockEvents));
      return mockEvents;
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock current student ID
  const currentStudentId = 'stu_12345';

  useEffect(() => {
    // Listen for storage changes if Admin edits in another tab
    const handleStorageChange = (e) => {
      if (e.key === 'ccs_events') {
        try {
          setEvents(JSON.parse(e.newValue) || []);
        } catch {
          setEvents([]);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleApply = (eventId) => {
    const updatedEvents = events.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          participants: [...(ev.participants || []), currentStudentId]
        };
      }
      return ev;
    });

    localStorage.setItem('ccs_events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const handleCancelApplication = (eventId) => {
    const updatedEvents = events.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          participants: (ev.participants || []).filter(id => id !== currentStudentId)
        };
      }
      return ev;
    });

    localStorage.setItem('ccs_events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesSearch = 
        ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ev.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || ev.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'Upcoming').length,
    ongoing: events.filter(e => e.status === 'Ongoing').length,
    joined: events.filter(e => (e.participants || []).includes(currentStudentId)).length
  };

  return (
    <div className="events-view-container">
      <div className="events-header-section">
        <div className="events-header-text">
          <h2>Campus Events</h2>
          <p>Discover, track, and join upcoming events hosted by the College of Computing Studies.</p>
        </div>
        <div className="events-stats-container">
          <div className="stat-card">
            <CalendarDays className="stat-icon upcoming-icon" />
            <div className="stat-info">
              <span className="stat-value">{stats.upcoming}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircle className="stat-icon joined-icon" />
            <div className="stat-info">
              <span className="stat-value">{stats.joined}</span>
              <span className="stat-label">Joined</span>
            </div>
          </div>
        </div>
      </div>

      <div className="events-controls">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search events by title or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="events-search-input"
          />
        </div>
        
        <div className="filter-wrapper">
          <Filter size={18} className="filter-icon" />
          <div className="filter-pills">
            {['All', 'Upcoming', 'Ongoing', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
           <div className="no-events-view">
            <Info size={48} className="empty-state-icon" />
            <h3>No Events Found</h3>
            <p>We couldn't find any events matching your current filters.</p>
            {(searchQuery || statusFilter !== 'All') && (
              <button 
                className="clear-filters-btn"
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
              >
                Clear Filters
              </button>
            )}
           </div>
        ) : (
          filteredEvents.map((ev) => {
            const participants = ev.participants || [];
            const hasApplied = participants.includes(currentStudentId);
            const maxParticipantsNum = parseInt(ev.maxParticipants) || 0;
            const isFull = maxParticipantsNum > 0 && participants.length >= maxParticipantsNum;
            const isUpcoming = ev.status === 'Upcoming';
            const progressPercentage = maxParticipantsNum > 0 
              ? Math.min((participants.length / maxParticipantsNum) * 100, 100) 
              : 0;

            return (
              <div key={ev.id} className="event-card group">
                <div className={`event-status-label ${ev.status?.toLowerCase()}`}>
                  {ev.status}
                </div>
                
                <div className="event-card-header">
                  <h3 className="event-card-title">{ev.title}</h3>
                </div>
                
                <p className="event-card-desc">{ev.description}</p>
                
                <div className="event-details">
                  <div className="event-detail-item">
                    <Calendar size={16} className="detail-icon" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="event-detail-item">
                    <Clock size={16} className="detail-icon" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="event-detail-item">
                    <MapPin size={16} className="detail-icon" />
                    <span>{ev.location}</span>
                  </div>
                  
                  <div className="event-capacity">
                    <div className="capacity-header">
                      <div className="event-detail-item">
                        <Users size={16} className="detail-icon" />
                        <span>Registered Users</span>
                      </div>
                      <span className="capacity-text">
                        {participants.length} {maxParticipantsNum > 0 ? `/ ${maxParticipantsNum}` : ''}
                      </span>
                    </div>
                    {maxParticipantsNum > 0 && (
                      <div className="capacity-bar-container">
                        <div 
                          className={`capacity-bar-fill ${isFull ? 'full' : progressPercentage > 80 ? 'warning' : ''}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="event-actions">
                  {hasApplied ? (
                    <button className="apply-btn cancel" onClick={() => handleCancelApplication(ev.id)}>
                      Cancel Registration
                    </button>
                  ) : (
                    <button 
                      className="apply-btn" 
                      onClick={() => handleApply(ev.id)}
                      disabled={isFull || !isUpcoming}
                    >
                      {isFull ? 'Event Full' : !isUpcoming ? 'Registration Closed' : 'Join Event'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Events;
