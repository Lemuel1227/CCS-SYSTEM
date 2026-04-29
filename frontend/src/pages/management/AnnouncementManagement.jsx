import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Search, Plus, X, Edit, Trash2, Calendar, User, Clock, Image as ImageIcon, Paperclip } from 'lucide-react';
import axios from 'axios';
import './AnnouncementManagement.css';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'Draft'
  });

  useEffect(() => {
    let active = true;

    const loadAnnouncements = async () => {
      try {
        const response = await axios.get('/api/announcements');
        if (active) {
          setAnnouncements(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    loadAnnouncements();

    return () => {
      active = false;
    };
  }, []);

  const handleOpenModal = (announcement = null) => {
    setSelectedFile(null);
    if (announcement) {
      setCurrentAnnouncement(announcement);
      setPreviewUrl(announcement.image ? `http://localhost:5000${announcement.image}` : null);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        status: announcement.status
      });
    } else {
      setCurrentAnnouncement(null);
      setPreviewUrl(null);
      setFormData({
        title: '',
        content: '',
        status: 'Draft'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAnnouncement(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('status', formData.status);
      
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (currentAnnouncement) {
        await axios.put(`/api/announcements/${currentAnnouncement._id || currentAnnouncement.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/announcements', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // Manually trigger a localized fetch right after since the use-effect 
      // doesn't handle state reload on submit anymore 
      try {
        const response = await axios.get('/api/announcements');
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Failed to reload announcements:', error);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        // Refresh local state list on delete since we removed fetchAnnouncements
        try {
          const response = await axios.get('/api/announcements');
          setAnnouncements(response.data);
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error('Failed to delete announcement:', error);
        alert('Failed to delete announcement');
      }
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="announcement-management">
      <div className="management-header">
        <div className="title-section">
          <Megaphone size={32} color="var(--primary-color)" />
          <h1>Announcement Management</h1>
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Create Announcement
        </button>
      </div>

      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="announcement-grid">
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement._id || announcement.id} className={`announcement-card status-${announcement.status.toLowerCase()}`}>
            <div className="announcement-card-inner">
              <div className="announcement-card-header">
                <h3 className="announcement-title">{announcement.title}</h3>
                <div className="announcement-badges">
                  {announcement.image && (
                    <span className="badge has-attachment" title="Has attachment">
                      <Paperclip size={12} />
                    </span>
                  )}
                  <span className={`badge status-${announcement.status.toLowerCase()}`}>
                    {announcement.status}
                  </span>
                </div>
              </div>

              <div className="announcement-meta">
                <span className="meta-item">
                  <User size={14} />
                  {announcement.author?.firstName || announcement.author?.name || 'Unknown'} {announcement.author?.firstName ? announcement.author?.lastName : ''}
                </span>
                <span className="meta-item">
                  <Calendar size={14} />
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="announcement-content">{announcement.content}</p>
            </div>

            <div className="announcement-actions">
              <button 
                className="action-btn edit"
                onClick={() => handleOpenModal(announcement)}
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                className="action-btn delete"
                onClick={() => handleDelete(announcement._id || announcement.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Attachment Image (Optional)</label>
                <div className={`file-upload-area ${previewUrl ? 'has-file' : ''}`}>
                  {!previewUrl && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      id="announcement-image"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 5 }}
                    />
                  )}
                  {previewUrl ? (
                    <div className="upload-placeholder" style={{ zIndex: 10, position: 'relative' }}>
                      <div className="upload-icon-wrapper" style={{ background: 'rgba(21, 128, 61, 0.1)', color: '#15803d' }}>
                        <ImageIcon size={24} />
                      </div>
                      <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all', padding: '0 16px', textAlign: 'center' }}>
                        {selectedFile ? selectedFile.name : 'Existing Image Attached'}
                      </span>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => window.open(previewUrl, '_blank')}
                          style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                        >
                          View Image
                        </button>
                        <button 
                          type="button" 
                          onClick={removeSelectedFile}
                          style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon-wrapper">
                        <ImageIcon size={24} />
                      </div>
                      <span>Drag &amp; drop an image here, or click to browse</span>
                      <small>Max size 10MB (JPG, PNG, GIF, WEBP)</small>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Draft</option>
                  <option value="Posted">Posted</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {currentAnnouncement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;