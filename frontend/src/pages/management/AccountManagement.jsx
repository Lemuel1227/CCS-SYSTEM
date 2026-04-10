import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Users,
  ShieldAlert,
  GraduationCap,
  Settings
} from 'lucide-react';
import axios from 'axios';
import './AccountManagement.css';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  // Get current logged in user from localStorage to restrict edits
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const toTitleStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'inactive') return 'Inactive';
    if (s === 'suspended') return 'Suspended';
    return 'Active';
  };

  const toApiStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'inactive') return 'inactive';
    if (s === 'suspended') return 'suspended';
    return 'active';
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      // Map API response fields to what AccountManagement UI expects
      const mappedUsers = response.data.map(u => ({
        id: u._id,
        userId: u.userId,
        fullName: u.name,
        email: u.email,
        role: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student',
        status: toTitleStatus(u.accountStatus),
        requiresPasswordChange: u.requiresPasswordChange
      }));
      setAccounts(mappedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showToast('Failed to load users from the server.', 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    password: '',
    role: 'Student',
    status: 'Active'
  });

  // Derived stats
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(a => a.status === 'Active').length;
  const adminAccounts = accounts.filter(a => a.role === 'Admin').length;
  const facultyAccounts = accounts.filter(a => a.role === 'Faculty').length;

  // Derived filtered data
  const filteredAccounts = accounts.filter(acc => {
    const userIdSearch = acc.userId ? acc.userId.toLowerCase()     : '';
    const fullNameSearch = acc.fullName ? acc.fullName.toLowerCase() : '';
    const emailSearch = acc.email ? acc.email.toLowerCase()        : '';

    const matchesSearch = 
      userIdSearch.includes(searchTerm.toLowerCase()) || 
      fullNameSearch.includes(searchTerm.toLowerCase()) ||
      emailSearch.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleOpenCreate = () => {
    setCurrentAccount(null);
    setFormData({ userId: '', fullName: '', email: '', password: '', role: 'Student', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setCurrentAccount(acc);
    setFormData({ ...acc });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = (acc) => {
    setCurrentAccount(acc);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${currentAccount.id}`);
      setAccounts(accounts.filter(a => a.id !== currentAccount.id));
      setIsDeleteModalOpen(false);
      showToast(`Account deleted successfully.`, 'error');
      setCurrentAccount(null);
    } catch (err) {
      console.error('Delete error', err);
      showToast('Failed to delete account.', 'error');
    }
  };

  const handleConfirmResetPassword = async () => {
    try {
      await axios.put(`/api/users/${currentAccount.id}/reset-password`);
      
      // Update local state to reflect the reset visually
      setAccounts(accounts.map(acc => 
        acc.id === currentAccount.id 
          ? { ...acc, requiresPasswordChange: true }
          : acc
      ));

      setIsResetModalOpen(false);
      setIsModalOpen(false);
      showToast(`Password for ${currentAccount.userId} reset successfully to default.`);
    } catch (err) {
      console.error('Reset password error', err);
      showToast('Failed to reset password.', 'error');
    }
  };

  const handleResetPassword = () => {
    setIsResetModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (currentAccount) {
      try {
        const payload = {
          name: formData.fullName,
          email: formData.email,
          role: formData.role.toLowerCase(),
          accountStatus: toApiStatus(formData.status)
        };
        // Don't send empty passwords on edit
        if (formData.password) payload.password = formData.password;

        const response = await axios.put(`/api/users/${currentAccount.id}`, payload);
        
        const updatedData = {
          ...formData, 
          id: currentAccount.id,
          role: response.data.role.charAt(0).toUpperCase() + response.data.role.slice(1),
          status: toTitleStatus(response.data.accountStatus || formData.status)
        };
        
        setAccounts(accounts.map(acc => acc.id === currentAccount.id ? updatedData : acc));
        showToast('Account updated successfully.');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating account:', error);
        showToast('Failed to update account.', 'error');
      }
    } else {
      // Create via backend Admin override
      try {
        const payload = {
          userId: formData.userId,
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role.toLowerCase(),
          accountStatus: toApiStatus(formData.status)
        };

        const response = await axios.post('/api/auth/register', payload);

        const newAccount = { 
          id: response.data._id,
          userId: response.data.userId,
          fullName: response.data.name,
          email: response.data.email,
          role: response.data.role.charAt(0).toUpperCase() + response.data.role.slice(1),
          status: toTitleStatus(response.data.accountStatus || formData.status),
          requiresPasswordChange: response.data.requiresPasswordChange
        };
        setAccounts([...accounts, newAccount]);
        showToast('New account created successfully.');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error creating account:', error);
        showToast(
          error.response?.data?.message || 'Error creating account. Are you an Admin?', 
          'error'
        );
      }
    }
  };

  return (
    <div className="page-container">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Settings size={32} color="var(--primary-color)" />
            <h1 className="page-title" style={{ margin: 0 }}>Account Management</h1>
          </div>
          <p className="page-subtitle">Manage system users, roles, and access.</p>
        </div>
        <button className="primary-btn" onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>Add Account</span>
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalAccounts}</div>
            <div className="stat-label">Total Accounts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green-icon">
            <User size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value text-success">{activeAccounts}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple-icon">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value text-admin">{adminAccounts}</div>
            <div className="stat-label">Administrators</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange-icon">
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value text-faculty">{facultyAccounts}</div>
            <div className="stat-label">Faculty Members</div>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="controls-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-box">
            <Filter size={18} className="filter-icon" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Faculty">Faculty</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((acc) => (
                <tr key={acc.id}>
                  <td className="font-medium">
                    <div className="user-id-cell">
                      <div className="avatar-circle">
                        {(acc.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      {acc.userId}
                    </div>
                  </td>
                  <td>{acc.fullName}</td>
                  <td>{acc.email}</td>
                  <td className="password-cell">
                    {acc.requiresPasswordChange ? (
                      <span style={{ color: '#f59e0b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} />
                        Default
                      </span>
                    ) : (
                      <span style={{ color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} />
                        Custom
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`role-badge role-${acc.role.toLowerCase()}`}>
                      {acc.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${acc.status.toLowerCase()}`}>
                      {acc.status === 'Active' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {acc.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="icon-btn edit-btn" onClick={() => handleOpenEdit(acc)} title="Edit Account">
                      <Edit2 size={18} />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => handleConfirmDelete(acc)} title="Delete Account">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-state-content">
                    <div className="empty-state-icon-wrapper">
                      <Search size={32} className="empty-icon" />
                    </div>
                    <h3>No accounts found</h3>
                    <p>We couldn't find any accounts matching your current filters.</p>
                    <button className="secondary-btn" onClick={() => { setSearchTerm(''); setRoleFilter('All'); }}>Clear Filters</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentAccount ? 'Edit Account' : 'Create New Account'}</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>User ID</label>
                <input 
                  type="text" 
                  name="userId" 
                  value={formData.userId} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="e.g., student_123"
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="name@ccs.edu"
                />
              </div>

              {(!currentAccount || (currentAccount && currentAccount.id === currentUser._id)) && (
                <div className="form-group">
                  <label>{currentAccount ? "Change Password" : "Password"}</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleFormChange} 
                    required={!currentAccount} 
                    placeholder={currentAccount ? "Leave blank to keep current password" : "Enter initial password"}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleFormChange}>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {currentAccount && currentAccount.id !== currentUser._id ? (
                  <button 
                    type="button" 
                    className="secondary-btn" 
                    onClick={handleResetPassword}
                    style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px' }}
                    title="Reset this user's password to 'password123'"
                  >
                    <RefreshCw size={16} />
                    Reset Password
                  </button>
                ) : <div></div>}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">
                    {currentAccount ? 'Save Changes' : 'Create Account'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header border-none">
              <h2 className="text-danger">Delete Account</h2>
              <button className="close-modal-btn" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the account for <strong>{currentAccount?.fullName}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="danger-btn" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* PASSWORD RESET CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header border-none">
              <h2 className="text-warning">Reset Password</h2>
              <button className="close-modal-btn" onClick={() => setIsResetModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reset the password for <strong>{currentAccount?.fullName}</strong>?</p>
              <p className="text-muted">The password will be reset to the system default: <strong>password123</strong>.</p>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setIsResetModalOpen(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleConfirmResetPassword}>Yes, Reset Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
