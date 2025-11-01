import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import adminApi from '../../services/api/adminApi';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';

export default function AdminUsers() {
  const { currUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);
  
  // Selected user for actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!currUser || currUser.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    loadUsers();
  }, [currUser, navigate, pagination.page, debouncedSearch, roleFilter, activeFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        role: roleFilter,
        isActive: activeFilter,
      });

      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, data) => {
    try {
      const response = await adminApi.updateUser(userId, data);
      if (response.success) {
        toast.success('User updated successfully');
        setShowUserModal(false);
        loadUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, permanent = false) => {
    try {
      const response = await adminApi.deleteUser(userId, permanent);
      if (response.success) {
        toast.success(response.message || 'User deleted successfully');
        setShowDeleteModal(false);
        loadUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await adminApi.resetUserPassword(selectedUser._id, newPassword);
      if (response.success) {
        toast.success('Password reset successfully');
        setShowPasswordModal(false);
        setNewPassword('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-full min-w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className='text-left'>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage all user accounts</p>
            </div>
            <button
              onClick={() => navigate(`/p/${currUser._id}/admin`)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                placeholder="Search by email or username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role || 'user')}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(user.isActive !== undefined && user.isActive !== null) ? (user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') : 'bg-green-100 text-green-800'}`}>
                          {(user.isActive !== undefined && user.isActive !== null) ? (user.isActive ? 'Active' : 'Inactive') : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSave={(data) => handleUpdateUser(selectedUser._id, data)}
        />
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onDelete={(permanent) => handleDeleteUser(selectedUser._id, permanent)}
        />
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
            setNewPassword('');
          }}
          onSave={handleResetPassword}
          password={newPassword}
          setPassword={setNewPassword}
        />
      )}
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    isActive: user.isActive !== undefined ? user.isActive : true,
    isVerified: user.isVerified !== undefined ? user.isVerified : false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Verified</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete User Modal Component
function DeleteUserModal({ user, onClose, onDelete }) {
  const [permanent, setPermanent] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">Delete User</h2>
        <p className="mb-4 text-gray-700">
          Are you sure you want to {permanent ? 'permanently delete' : 'deactivate'} user <strong>{user.username}</strong>?
        </p>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={permanent}
            onChange={(e) => setPermanent(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Permanently delete (cannot be undone)</span>
        </label>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(permanent)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {permanent ? 'Delete Permanently' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Reset Password Modal Component
function ResetPasswordModal({ user, onClose, onSave, password, setPassword }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        <p className="mb-4 text-gray-700">
          Reset password for user <strong>{user.username}</strong>
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter new password (min 6 characters)"
            minLength={6}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

