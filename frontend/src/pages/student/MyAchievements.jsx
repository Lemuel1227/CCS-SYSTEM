import React, { useState, useMemo } from 'react';
import { Award, Trophy, Star, Search, Filter, Calendar, MapPin, Download, Share2, TrendingUp, BookOpen, Activity, ChevronDown } from 'lucide-react';
import './MyAchievements.css';

const mockAchievements = [
  {
    id: 1,
    title: 'Dean\'s Lister',
    category: 'Academic',
    date: '2025-12-15',
    displayDate: 'December 2025',
    issuer: 'College of Computer Studies',
    description: 'Awarded for achieving a General Weighted Average (GWA) of 1.4 or higher during the First Semester of AY 2025-2026.',
    icon: <Trophy size={24} style={{ color: 'var(--success-text)' }} />,
    color: 'var(--success-text)',
    backgroundColor: 'var(--success-bg)'
  },
  {
    id: 2,
    title: '1st Place Hackathon Winner',
    category: 'Extracurricular',
    date: '2025-10-05',
    displayDate: 'October 2025',
    issuer: 'TechNova University Event',
    description: 'Developed an innovative AI-driven student assistance application within 48 hours.',
    icon: <Award size={24} style={{ color: 'var(--info-text)' }} />,
    color: 'var(--info-text)',
    backgroundColor: 'var(--info-bg)'
  },
  {
    id: 3,
    title: 'Excellence in Programming',
    category: 'Academic',
    date: '2025-05-20',
    displayDate: 'May 2025',
    issuer: 'IT Department',
    description: 'Recognized for top performance in Advanced Data Structures and Algorithms.',
    icon: <Star size={24} style={{ color: 'var(--success-text)' }} />,
    color: 'var(--success-text)',
    backgroundColor: 'var(--success-bg)'
  },
  {
    id: 4,
    title: 'Student Leader of the Year',
    category: 'Leadership',
    date: '2024-11-10',
    displayDate: 'November 2024',
    issuer: 'University Student Council',
    description: 'Honored for outstanding leadership and service to the student body.',
    icon: <TrendingUp size={24} style={{ color: 'var(--warning-text)' }} />,
    color: 'var(--warning-text)',
    backgroundColor: 'var(--warning-bg)'
  }
];

export default function MyAchievements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'Academic', 'Extracurricular', 'Leadership'];

  const filteredAndSortedAchievements = useMemo(() => {
    let result = mockAchievements.filter(ach => {
      const matchesSearch = ach.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ach.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterCategory === 'All' || ach.category === filterCategory;
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [searchTerm, filterCategory, sortBy]);

  const stats = [
    { label: 'Total Achievements', value: mockAchievements.length, icon: <Award size={24} style={{color: 'var(--primary-color)'}} />, bg: 'var(--primary-light)' },
    { label: 'Academic', value: mockAchievements.filter(a => a.category === 'Academic').length, icon: <BookOpen size={24} style={{color: 'var(--success-text)'}} />, bg: 'var(--success-bg)' },
    { label: 'Extracurricular', value: mockAchievements.filter(a => a.category === 'Extracurricular').length, icon: <Activity size={24} style={{color: 'var(--info-text)'}} />, bg: 'var(--info-bg)' },
    { label: 'Leadership', value: mockAchievements.filter(a => a.category === 'Leadership').length, icon: <TrendingUp size={24} style={{color: 'var(--warning-text)'}} />, bg: 'var(--warning-bg)' }
  ];

  return (
    <div className="my-achievements-container">
      
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1>My Achievements</h1>
          <p>
            A showcase of your academic milestones, awards, and extracurricular successes.
          </p>
        </div>
        <button className="download-btn">
          <Download size={18} />
          Download Portfolio
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.bg }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Controls / Toggles */}
      <div className="achievements-controls">
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by title or description..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={16} />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="chevron" size={16} />
          </div>

          <div className="select-wrapper">
            <select 
              className="no-icon-left"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="chevron" size={16} />
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {filteredAndSortedAchievements.length > 0 ? (
          filteredAndSortedAchievements.map((achievement) => (
            <div key={achievement.id} className="achievement-card" style={{ borderColor: achievement.color === 'var(--border-color)' ? undefined : 'var(--border-color)' }}>
              {/* Top Color Accent */}
              <div 
                className="achievement-color-bar" 
                style={{ backgroundColor: achievement.color }} 
              />
              
              <div className="achievement-header">
                <div 
                  className="achievement-icon-wrapper"
                  style={{ backgroundColor: achievement.backgroundColor }}
                >
                  {achievement.icon}
                </div>
                <span className="achievement-badge">
                  {achievement.category}
                </span>
              </div>
              
              <h3>{achievement.title}</h3>
              <p className="description">{achievement.description}</p>
              
              <div style={{ marginTop: 'auto' }}>
                <div className="achievement-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{achievement.displayDate}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{achievement.issuer}</span>
                  </div>
                </div>
                
                {/* Action Footer */}
                <div className="achievement-footer">
                  <button className="view-btn">
                    View Certificate
                  </button>
                  
                  <div className="action-icons">
                    <button className="icon-btn" aria-label="Share">
                      <Share2 size={18} />
                    </button>
                    <button className="icon-btn" aria-label="Download">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={32} />
            </div>
            <h3>No achievements found</h3>
            <p>
              We couldn't find any achievements matching your current search and filter criteria.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilterCategory('All'); setSortBy('newest'); }}
              className="download-btn"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
