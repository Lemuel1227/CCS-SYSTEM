import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Filter, CalendarDays, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import './Events.css';

const normalizeEvent = (ev) => ({
  id: ev._id || ev.id,
  title: ev.title || '',
  description: ev.description || '',
  date: ev.date || '',
  time: ev.time || '',
  location: ev.location || '',
  maxParticipants: ev.maxParticipants || 0,
  status: ev.status || 'Upcoming',
  participants: ev.participants || []
});

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [currentStudentId, setCurrentStudentId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('/api/auth/profile');
        setCurrentStudentId(res.data._id);
      } catch (error) {
        console.error('Failed to get user profile', error);
      }
    };
    fetchUserData();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data.map(normalizeEvent));
    } catch (error) {
      console.error('Failed to load events:', error);
      setErrorMessage('Failed to load events from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApply = async (eventId) => {
    try {
      const response = await axios.post(`/api/events/${eventId}/apply`);
      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === eventId ? normalizeEvent(response.data) : ev
        )
      );
    } catch (error) {
      console.error('Failed to apply for event:', error);
      alert(error.response?.data?.message || 'Failed to apply for event.');
    }
  };

  const handleCancelApplication = async (eventId) => {
    try {
      const response = await axios.post(`/api/events/${eventId}/cancel`);
      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === eventId ? normalizeEvent(response.data) : ev
        )
      );
    } catch (error) {
      console.error('Failed to cancel application:', error);
      alert(error.response?.data?.message || 'Failed to cancel application.');
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CalendarDays size={32} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Campus Events</h2>
          </div>
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
        {errorMessage && (
           <div className="error-message">
             <p>{errorMessage}</p>
           </div>
        )}
        {loading ? (
           <div className="no-events-view">
             <Info size={48} className="empty-state-icon" />
             <h3>Loading Events...</h3>
           </div>
        ) : filteredEvents.length === 0 ? (
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
