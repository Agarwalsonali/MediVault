import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, Activity, Loader, AlertCircle, Search, Filter, Download, RefreshCw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActivityLogs, getFailedLogins, getActivityStats, exportActivityLogs } from '../services/adminService.js';

const ACTION_COLORS = {
  LOGIN: 'bg-green-50 text-green-700 border-green-200',
  LOGOUT: 'bg-blue-50 text-blue-700 border-blue-200',
  LOGIN_FAILED: 'bg-red-50 text-red-700 border-red-200',
  ACCOUNT_LOCKED: 'bg-orange-50 text-orange-700 border-orange-200',
  UPLOAD_FILE: 'bg-teal-50 text-teal-700 border-teal-200',
  DELETE_FILE: 'bg-red-50 text-red-700 border-red-200',
  DELETE_RECORD: 'bg-red-50 text-red-700 border-red-200',
  PROFILE_UPDATE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CREATE_STAFF: 'bg-green-50 text-green-700 border-green-200',
  UPDATE_STAFF: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  DELETE_STAFF: 'bg-red-50 text-red-700 border-red-200',
};

const ROLE_COLORS = {
  Admin: 'bg-purple-100 text-purple-800',
  Doctor: 'bg-blue-100 text-blue-800',
  Nurse: 'bg-teal-100 text-teal-800',
  Staff: 'bg-cyan-100 text-cyan-800',
  Patient: 'bg-green-100 text-green-800',
};

export default function ActivityLog() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState({});
  const [exporting, setExporting] = useState(false);
  const [failedLoginsCount, setFailedLoginsCount] = useState(0);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const query = {
        page,
        limit: 20,
        ...(filterAction !== 'all' && { action: filterAction }),
        ...(filterRole !== 'all' && { userRole: filterRole }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchText && { userName: searchText })
      };

      const response = await getActivityLogs(query);
      setActivities(response.logs || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalLogs(response.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load activity logs');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterAction, filterRole, filterStatus, searchText]);

  const fetchActivityStats = useCallback(async () => {
    try {
      const statsData = await getActivityStats();
      setStats(statsData);
      setFailedLoginsCount(statsData.failedLoginCount || 0);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  useEffect(() => {
    fetchActivityStats();
  }, [fetchActivityStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivityLogs();
      fetchActivityStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchActivityLogs, fetchActivityStats]);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportActivityLogs({
        ...(filterAction !== 'all' && { action: filterAction }),
        ...(filterRole !== 'all' && { userRole: filterRole }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to export logs');
    } finally {
      setExporting(false);
    }
  };

  const getActionBadgeClass = (action) => ACTION_COLORS[action] || 'bg-slate-50 text-slate-700 border-slate-200';
  const getRoleBadgeClass = (role) => ROLE_COLORS[role] || 'bg-slate-100 text-slate-800';

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimeRelative = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Back to dashboard"
        >
          <ChevronLeft size={20} className="text-slate-300" />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4b5563', margin: 0 }}>
            Activity Monitor
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#667a8a', margin: '4px 0 0 0' }}>
            Real-time system activity and audit logs
          </p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', borderRadius: '0.75rem', border: '1px solid #fecaca', backgroundColor: '#fee2e2', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <AlertCircle size={16} className="text-red-600 flex-none" />
          <p style={{ fontSize: '0.875rem', color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="mv-card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#667a8a', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Total Activities</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-teal)', margin: '8px 0 0 0' }}>{totalLogs}</p>
        </div>
        <div className="mv-card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#667a8a', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Failed Logins</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: failedLoginsCount > 5 ? 'var(--mv-danger)' : 'var(--mv-navy)', margin: '8px 0 0 0' }}>{failedLoginsCount}</p>
        </div>
        <div className="mv-card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#667a8a', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Success Rate</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-success)', margin: '8px 0 0 0' }}>
            {stats.totalActivities ? Math.round((stats.successfulLoginCount / stats.totalActivities) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mv-card animate-fade-up" style={{ marginBottom: '1.5rem' }}>
        <div className="mv-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="mv-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Filter size={18} />
            Filters & Search
          </p>
          <button
            onClick={() => {
              fetchActivityLogs();
              fetchActivityStats();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm"
            title="Refresh logs"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        <div className="mv-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--mv-border)', paddingLeft: '1rem' }}>
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                  color: '#4b5563'
                }}
              />
            </div>

            {/* Action Filter */}
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--mv-border)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#1f2937'
              }}
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGIN_FAILED">Failed Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="UPLOAD_FILE">Upload File</option>
              <option value="DELETE_FILE">Delete File</option>
              <option value="PROFILE_UPDATE">Profile Update</option>
              <option value="CREATE_STAFF">Create Staff</option>
              <option value="UPDATE_STAFF">Update Staff</option>
              <option value="DELETE_STAFF">Delete Staff</option>
              <option value="ACCOUNT_LOCKED">Account Locked</option>
            </select>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--mv-border)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#1f2937'
              }}
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Staff">Staff</option>
              <option value="Patient">Patient</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--mv-border)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#1f2937'
              }}
            >
              <option value="all">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || activities.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--mv-teal)',
              color: 'white',
              border: 'none',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: exporting || activities.length === 0 ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>
      </div>

      {/* Activity Monitor Table */}
      <div className="mv-card animate-fade-up">
        <div className="mv-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} className="text-teal-600" />
            <p className="mv-card-title" style={{ margin: 0 }}>
              Activity Trace Monitor
            </p>
          </div>
        </div>
        <div className="mv-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.5rem' }}>
              <Loader size={20} className="animate-spin text-teal-600" />
              <span style={{ color: '#667a8a' }}>Loading activities...</span>
            </div>
          ) : activities.length > 0 ? (
            <>
              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--mv-border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#667a8a' }}>
                        Time
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#667a8a' }}>
                        User
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#667a8a' }}>
                        Role
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#667a8a' }}>
                        Action
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#667a8a' }}>
                        Resource
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#667a8a' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, idx) => (
                      <tr key={activity._id} style={{ 
                        borderBottom: '1px solid var(--mv-border)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(45, 212, 191, 0.02)'
                      }}>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#4b5563', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span>{formatTime(activity.timestamp)}</span>
                            <span style={{ fontSize: '0.75rem', color: '#667a8a' }}>{formatTimeRelative(activity.timestamp)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4b5563', fontWeight: 600 }}>
                          {activity.userName}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(activity.userRole)}`}>
                            {activity.userRole}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionBadgeClass(activity.action)}`}>
                            {activity.action}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
                          {activity.resourceName || activity.resourceType || '-'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: activity.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.1)' : 
                                           activity.status === 'FAILED' ? 'rgba(239, 68, 68, 0.1)' : 
                                           'rgba(107, 114, 128, 0.1)',
                            color: activity.status === 'SUCCESS' ? '#22c55e' : 
                                   activity.status === 'FAILED' ? '#ef4444' : 
                                   '#667a8a'
                          }}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem', borderTop: '1px solid var(--mv-border)' }}>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.875rem', color: '#667a8a', margin: '0 0.5rem' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
              <Activity size={40} className="text-slate-300 mb-3" />
              <p style={{ color: '#667a8a', textAlign: 'center' }}>No activities found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
