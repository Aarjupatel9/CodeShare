import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import adminApi from '../../services/api/adminApi';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';

export default function AdminActivity() {
  const { currUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  
  // Modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Filters
  const [email, setEmail] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [errorLevel, setErrorLevel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [excludeAdmin, setExcludeAdmin] = useState(false);

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState({
    actions: {},
    resourceTypes: [],
    errorLevels: []
  });
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Debounce email search input
  const debouncedEmail = useDebounce(email, 1000);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (!currUser || currUser.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    if (!loadingFilters) {
      loadActivities();
    }
  }, [currUser, navigate, pagination.page, debouncedEmail, action, resourceType, errorLevel, startDate, endDate, excludeAdmin, loadingFilters]);

  const loadFilterOptions = async () => {
    try {
      setLoadingFilters(true);
      const response = await adminApi.getActivityFilterOptions();
      if (response.success && response.data) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error('Failed to load filter options');
    } finally {
      setLoadingFilters(false);
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getActivityLogs({
        page: pagination.page,
        limit: pagination.limit,
        email: debouncedEmail || undefined,
        action: action || undefined,
        resourceType: resourceType || undefined,
        errorLevel: errorLevel || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        excludeAdmin: excludeAdmin ? 'true' : undefined,
      });

      if (response.success) {
        setActivities(response.data.activities || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedLog(activity);
    setShowLogModal(true);
  };

  const getActionColor = (action) => {
    if (action.includes('login') || action.includes('register')) return 'bg-green-100 text-green-800';
    if (action.includes('delete') || action.includes('error')) return 'bg-red-100 text-red-800';
    if (action.includes('create') || action.includes('upload')) return 'bg-blue-100 text-blue-800';
    if (action.includes('update') || action.includes('edit')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Helper function to render JSON details in a more readable format
  const renderDetails = (details) => {
    if (!details || typeof details !== 'object') return null;
    
    const renderValue = (value, indent = 0) => {
      if (value === null) {
        return <span className="text-gray-500">null</span>;
      }
      
      if (typeof value === 'string') {
        return <span className="text-yellow-300">"{value}"</span>;
      }
      
      if (typeof value === 'number') {
        return <span className="text-blue-400">{value}</span>;
      }
      
      if (typeof value === 'boolean') {
        return <span className="text-purple-400">{value.toString()}</span>;
      }
      
      if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-400">[]</span>;
        return (
          <span>
            <span className="text-gray-400">[</span>
            {value.map((item, i) => (
              <div key={i} style={{ marginLeft: `${(indent + 1) * 16}px` }}>
                {renderValue(item, indent + 1)}
                {i < value.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
            <div style={{ marginLeft: `${indent * 16}px` }}>
              <span className="text-gray-400">]</span>
            </div>
          </span>
        );
      }
      
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return <span className="text-gray-400">{'{}'}</span>;
        return (
          <span>
            <span className="text-gray-400">{'{'}</span>
            {keys.map((key, i) => (
              <div key={key} style={{ marginLeft: `${(indent + 1) * 16}px` }}>
                <span className="text-cyan-400">"{key}"</span>
                <span className="text-gray-400">: </span>
                {renderValue(value[key], indent + 1)}
                {i < keys.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            ))}
            <div style={{ marginLeft: `${indent * 16}px` }}>
              <span className="text-gray-400">{'}'}</span>
            </div>
          </span>
        );
      }
      
      return <span className="text-gray-300">{String(value)}</span>;
    };
    
    return <div className="text-left">{renderValue(details)}</div>;
  };

  return (
    <div className="min-h-full min-w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className='text-left'>
              <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-sm text-gray-600 mt-1">View system activity and logs</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Email/Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                placeholder="Search by email or username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingFilters}
              >
                <option value="">All Actions</option>
                {Object.entries(filterOptions.actions || {}).map(([category, actions]) => (
                  <optgroup key={category} label={category}>
                    {actions.map((act) => (
                      <option key={act} value={act}>
                        {act.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => {
                  setResourceType(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingFilters}
              >
                <option value="">All Types</option>
                {filterOptions.resourceTypes?.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt.charAt(0).toUpperCase() + rt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Error Level</label>
              <select
                value={errorLevel}
                onChange={(e) => {
                  setErrorLevel(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingFilters}
              >
                <option value="">All Levels</option>
                {filterOptions.errorLevels?.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setEmail('');
                  setAction('');
                  setResourceType('');
                  setErrorLevel('');
                  setStartDate('');
                  setEndDate('');
                  setExcludeAdmin(false);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Additional Filter: Exclude Admin */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="excludeAdmin"
              checked={excludeAdmin}
              onChange={(e) => {
                setExcludeAdmin(e.target.checked);
                setPagination({ ...pagination, page: 1 });
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="excludeAdmin" className="ml-2 block text-sm text-gray-700">
              Exclude admin/moderator activity
            </label>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  activities.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.userId?.username || activity.userId?.email || 'System'}
                        </div>
                        {activity.userId?.email && activity.userId.username && (
                          <div className="text-sm text-gray-500">{activity.userId.email}</div>
                        )}
                        {activity.userId?.role && (activity.userId.role === 'admin' || activity.userId.role === 'moderator') && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {activity.userId.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(activity.action)}`}>
                          {activity.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-900">
                          {activity.resourceType || '-'}
                        </div>
                        {activity.resourceId && (
                          <div className="text-xs text-gray-500">ID: {activity.resourceId.substring(0, 20)}...</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        {new Date(activity.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetails(activity)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="View full details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
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
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
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

      {/* Log Details Modal */}
      {showLogModal && selectedLog && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setShowLogModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Activity Log Details</h3>
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="text-white hover:text-gray-200 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* User Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">User Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Username:</span>
                      <span className="text-sm text-gray-900">{selectedLog.userId?.username || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <span className="text-sm text-gray-900">{selectedLog.userId?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Role:</span>
                      <span className={`text-sm font-semibold ${(selectedLog.userId?.role === 'admin' || selectedLog.userId?.role === 'moderator') ? 'text-purple-600' : 'text-gray-900'}`}>
                        {selectedLog.userId?.role || 'user'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">User ID:</span>
                      <span className="text-sm text-gray-600 font-mono">{selectedLog.userId?._id || 'System'}</span>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Activity Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Action:</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                        {selectedLog.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Resource Type:</span>
                      <span className="text-sm text-gray-900">{selectedLog.resourceType || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Resource ID:</span>
                      <span className="text-sm text-gray-600 font-mono break-all">{selectedLog.resourceId || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Timestamp:</span>
                      <span className="text-sm text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Request Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Request Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">IP Address:</span>
                      <span className="text-sm text-gray-900 font-mono">{selectedLog.ipAddress || '-'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-1">User Agent:</span>
                      <span className="text-xs text-gray-600 break-all">{selectedLog.userAgent || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Error/Details Information */}
                {(selectedLog.errorMessage || selectedLog.details) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Additional Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {selectedLog.errorMessage && (
                        <div>
                          <span className="text-sm font-medium text-red-600 block mb-2">Error Message:</span>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 text-left whitespace-pre-wrap font-mono">{selectedLog.errorMessage}</p>
                          </div>
                        </div>
                      )}
                      {selectedLog.errorLevel && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Error Level:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedLog.errorLevel === 'error' ? 'bg-red-100 text-red-800' :
                            selectedLog.errorLevel === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedLog.errorLevel}
                          </span>
                        </div>
                      )}
                      {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700 block mb-2">Details:</span>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto overflow-x-auto">
                            <div className="text-xs font-mono">
                              {renderDetails(selectedLog.details)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

