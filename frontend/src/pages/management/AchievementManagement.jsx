import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Award,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import './AchievementManagement.css';

const AchievementManagement = () => {
  // Initial demo data
  const initialAchievements = [
    {
      id: 1,
      studentId: "2021-0001",
      studentName: "Alicia Smith",
      title: "Dean's Lister",
      category: "Academic",
      date: "2023-12-15",
      description: "Achieved a GPA of 1.25 for the 1st Semester of AY 2023-2024."
    },
    {
      id: 2,
      studentId: "2021-0045",
      studentName: "John Doe",
      title: "Hackathon Champion",
      category: "Extracurricular",
      date: "2023-11-20",
      description: "First place in the Annual University Hackathon."
    },
    {
      id: 3,
      studentId: "2022-0102",
      studentName: "Maria Garcia",
      title: "Student Council President",
      category: "Leadership",
      date: "2023-09-01",
      description: "Elected as the President of the CCS Student Council."
    }
  ];

  const [achievements, setAchievements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    title: "",
    category: "Academic",
    date: "",
    description: ""
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ccs_achievements');
    if (saved) {
      setAchievements(JSON.parse(saved));
    } else {
      setAchievements(initialAchievements);
      localStorage.setItem('ccs_achievements', JSON.stringify(initialAchievements));
    }
  }, []);

  // Save to local storage whenever achievements change
  useEffect(() => {
    localStorage.setItem('ccs_achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Derived stats
  const stats = useMemo(() => {
    return {
      total: achievements.length,
      academic: achievements.filter(a => a.category === 'Academic').length,
      extracurricular: achievements.filter(a => a.category === 'Extracurricular').length,
      leadership: achievements.filter(a => a.category === 'Leadership').length,
    };
  }, [achievements]);

  // Filtering logic
  const filteredAchievements = useMemo(() => {
    return achievements.filter(ach => {
      const matchesSearch = 
        ach.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ach.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ach.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" || ach.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [achievements, searchQuery, filterCategory]);

  // Sorting logic
  const sortedAchievements = useMemo(() => {
    let sortableItems = [...filteredAchievements];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredAchievements, sortConfig]);

  // Pagination logic
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedAchievements.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedAchievements, currentPage]);

  const totalPages = Math.ceil(sortedAchievements.length / itemsPerPage);

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      studentId: "",
      studentName: "",
      title: "",
      category: "Academic",
      date: new Date().toISOString().split('T')[0],
      description: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (achievement) => {
    setEditingId(achievement.id);
    setFormData({
      studentId: achievement.studentId,
      studentName: achievement.studentName,
      title: achievement.title,
      category: achievement.category,
      date: achievement.date,
      description: achievement.description
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setAchievements(prev => prev.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
    } else {
      const newAchievement = {
        ...formData,
        id: Date.now()
      };
      setAchievements(prev => [...prev, newAchievement]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this achievement record?")) {
      setAchievements(prev => prev.filter(a => a.id !== id));
      // Adjust pagination if needed
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, sortConfig]);

  return (
    <div className="achievement-management-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Award size={28} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Achievement Management</h2>
          </div>
          <p>Manage and track student achievements and recognitions.</p>
        </div>
        <div className="header-actions">
          <button className="add-btn" onClick={openAddModal}>
            <Plus size={18} /> Add Achievement
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary-color)' }}>
             <Trophy size={24} />
          </div>
          <div className="stat-content">
            <p>Total Records</p>
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--success-color)' }}>
             <Award size={24} />
          </div>
          <div className="stat-content">
            <p>Academic</p>
            <h3>{stats.academic}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--info-color)' }}>
             <Star size={24} />
          </div>
          <div className="stat-content">
            <p>Extracurricular</p>
            <h3>{stats.extracurricular}</h3>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by student, ID, or title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Academic">Academic</option>
          <option value="Extracurricular">Extracurricular</option>
          <option value="Leadership">Leadership</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('studentName')}>
                <div>Student Name {getSortIcon('studentName')}</div>
              </th>
              <th onClick={() => handleSort('studentId')}>
                <div>ID Number {getSortIcon('studentId')}</div>
              </th>
              <th onClick={() => handleSort('title')}>
                <div>Title {getSortIcon('title')}</div>
              </th>
              <th onClick={() => handleSort('category')}>
                <div>Category {getSortIcon('category')}</div>
              </th>
              <th onClick={() => handleSort('date')}>
                <div>Date {getSortIcon('date')}</div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(achievement => (
                <tr key={achievement.id}>
                  <td><strong>{achievement.studentName}</strong></td>
                  <td>{achievement.studentId}</td>
                  <td>{achievement.title}</td>
                  <td>
                    <span className={`category-badge ${achievement.category.toLowerCase()}`}>
                      {achievement.category}
                    </span>
                  </td>
                  <td>{new Date(achievement.date).toLocaleDateString()}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditModal(achievement)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(achievement.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No achievements found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedAchievements.length)} of {sortedAchievements.length} results
            </div>
            <div className="pagination-controls">
              <button 
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  style={currentPage === page ? { backgroundColor: 'var(--primary-color)', color: 'white', borderColor: 'var(--primary-color)' } : {}}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? "Edit Achievement" : "Add New Achievement"}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Student Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Student ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 2021-0001"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Achievement Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Dean's Lister"
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Category</label>
                    <select 
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Academic">Academic</option>
                      <option value="Extracurricular">Extracurricular</option>
                      <option value="Leadership">Leadership</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Date Achieved</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Provide details about the achievement..."
                  ></textarea>
                </div>

                <div className="modal-footer" style={{ padding: '16px 0 0 0', marginTop: '16px' }}>
                  <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingId ? "Save Changes" : "Add Achievement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementManagement;
