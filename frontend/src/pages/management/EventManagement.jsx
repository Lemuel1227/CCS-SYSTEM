import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, Users, Search, Filter, CalendarDays, 
  CheckCircle, Settings, Edit, Trash2, RefreshCw, Plus, X, ListTodo
} from 'lucide-react';
import './EventManagement.css';

const mockEvents = [
  {
    id: 'evt_1',
    title: 'CodeFest 2026',
    description: 'Annual college hackathon. Build amazing projects in 48 hours with fellow students!',
    date: '2026-04-15',
    time: '08:00',
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
    time: '13:00',
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
    time: '10:00',
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
    time: '09:00',
    location: 'Room 302',
    status: 'Ongoing',
    maxParticipants: 40,
    participants: Array.from({ length: 38 }, (_, i) => `stu_${i + 100}`)
  }
];

const EventManagement = () => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    status: 'Upcoming'
  });

  // Empty effect removed since state is initialized synchronously

  const saveToStorage = (updatedEvents) => {
    localStorage.setItem('ccs_events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (event = null) => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        id: null,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        maxParticipants: '',
        status: 'Upcoming'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedEvents;

    if (formData.id) {
      // Edit
      updatedEvents = events.map((ev) => (ev.id === formData.id ? { ...formData, participants: ev.participants || [] } : ev));
    } else {
      // Create
      const newEvent = {
        ...formData,
        id: Date.now().toString(),
        participants: [] // empty array to hold student IDs or names
      };
      updatedEvents = [...events, newEvent];
    }

    saveToStorage(updatedEvents);
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updatedEvents = events.filter((ev) => ev.id !== id);
      saveToStorage(updatedEvents);
    }
  };

  const toggleStatus = (event) => {
    const newStatus = event.status === 'Upcoming' ? 'Ongoing' : event.status === 'Ongoing' ? 'Completed' : 'Upcoming';
    const updatedEvents = events.map((ev) => (ev.id === event.id ? { ...ev, status: newStatus } : ev));
    saveToStorage(updatedEvents);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesSearch = 
        ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ev.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || ev.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'Upcoming').length,
    ongoing: events.filter(e => e.status === 'Ongoing').length,
    completed: events.filter(e => e.status === 'Completed').length
  };

  return (
    <div className="event-management-container">
      <div className="admin-header-section">
        <div className="admin-header-text">
          <h2>Event Management</h2>
          <p>Create, track, and manage all events for the campus easily.</p>
        </div>
        <div className="admin-header-actions">
          <button className="primary-btn add-btn" onClick={() => openModal()}>
            <Plus size={18} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card total">
          <div className="admin-stat-icon-wrapper">
            <ListTodo size={24} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.total}</span>
            <span className="admin-stat-label">Total Events</span>
          </div>
        </div>
        <div className="admin-stat-card upcoming">
          <div className="admin-stat-icon-wrapper">
            <CalendarDays size={24} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.upcoming}</span>
            <span className="admin-stat-label">Upcoming</span>
          </div>
        </div>
        <div className="admin-stat-card ongoing">
          <div className="admin-stat-icon-wrapper">
            <Settings size={24} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.ongoing}</span>
            <span className="admin-stat-label">Ongoing</span>
          </div>
        </div>
        <div className="admin-stat-card completed">
          <div className="admin-stat-icon-wrapper">
            <CheckCircle size={24} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{stats.completed}</span>
            <span className="admin-stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="admin-controls">
        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by title or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="admin-filter-wrapper">
          <Filter size={18} className="filter-icon" />
          <div className="admin-filter-pills">
            {['All', 'Upcoming', 'Ongoing', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`admin-filter-pill ${statusFilter === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="event-list-wrapper">
        {filteredEvents.length === 0 ? (
          <div className="admin-no-results">
             <ListTodo size={40} className="empty-icon" />
             <p>No events found. Adjust filters or create a new one.</p>
          </div>
        ) : (
          <table className="event-table">
            <thead>
              <tr>
                <th>Event Info</th>
                <th>Schedule</th>
                <th>Participant Metrics</th>
                <th>Status</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev) => {
                const partsCount = (ev.participants || []).length;
                const maxParts = parseInt(ev.maxParticipants) || 0;
                const progress = maxParts > 0 ? Math.min((partsCount / maxParts) * 100, 100) : 0;
                
                return (
                  <tr key={ev.id}>
                    <td>
                      <strong className="event-row-title">{ev.title}</strong>
                      <div className="event-row-location">
                        <MapPin size={12} /> {ev.location}
                      </div>
                    </td>
                    <td>
                      <div className="event-row-date">
                        <Calendar size={12} /> {ev.date}
                      </div>
                      <div className="event-row-time">
                        <Clock size={12} /> {ev.time}
                      </div>
                    </td>
                    <td>
                      <div className="event-capacity-cell">
                        <div className="capacity-numbers">
                           <Users size={12} /> {partsCount} / {maxParts}
                        </div>
                        {maxParts > 0 && (
                          <div className="capacity-mini-bar">
                            <div 
                              className={`capacity-mini-fill ${progress >= 100 ? 'full' : progress > 80 ? 'warning' : ''}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${ev.status?.toLowerCase()}`}>
                         {ev.status}
                      </span>
                    </td>
                    <td>
                       <div className="actions-cell">
                         <button className="table-action-btn edit" title="Edit" onClick={() => openModal(ev)}>
                           <Edit size={16} />
                         </button>
                         <button className="table-action-btn rotate" title="Cycle Status" onClick={() => toggleStatus(ev)}>
                           <RefreshCw size={16} />
                         </button>
                         <button className="table-action-btn delete" title="Delete" onClick={() => handleDelete(ev.id)}>
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3>{formData.id ? 'Edit Event' : 'Create New Event'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-event-form">
              <div className="admin-form-group">
                <label>Event Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Web Dev Workshop" required />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the event purpose and details..." required rows={3}></textarea>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div className="admin-form-group">
                  <label>Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Room, Lab, or Link" required />
                </div>
                <div className="admin-form-group">
                  <label>Capacity</label>
                  <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleInputChange} placeholder="Maximum attendees" required min="1" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Save Changes' : 'Publish Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
