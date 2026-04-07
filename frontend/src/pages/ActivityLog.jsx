import { useEffect, useState } from 'react';
import { ChevronLeft, Activity, Loader, AlertCircle, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/adminService.js';

export default function ActivityLog() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setActivities(data.recentActivity || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load activity log');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filter by search text
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(a => a.text.toLowerCase().includes(query));
    }

    setFilteredActivities(filtered);
  }, [activities, searchText, filterType]);

  const getActivityColor = (type) => {
    if (type === 'staff_created') return 'bg-teal-50 border-teal-200 text-teal-700';
    if (type === 'report_uploaded') return 'bg-blue-50 border-blue-200 text-blue-700';
    return 'bg-slate-50 border-slate-200 text-slate-700';
  };

  const getActivityIcon = (type) => {
    if (type === 'staff_created') return '👤';
    if (type === 'report_uploaded') return '📄';
    return '📌';
  };

  const getActivityTypeLabel = (type) => {
    if (type === 'staff_created') return 'Staff Created';
    if (type === 'report_uploaded') return 'Report Uploaded';
    return 'Other';
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getFormattedDate = (timestamp) => {
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

  return (
    <div className="dash-page">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-sm text-slate-500 mt-1">View all system activities and events</p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-500 flex-none" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filter and search section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search activities…"
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Activities</option>
            <option value="staff_created">Staff Created</option>
            <option value="report_uploaded">Report Uploaded</option>
          </select>
        </div>
      </div>

      {/* Activity list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader size={32} className="text-teal-600 animate-spin" />
              <p className="text-slate-500 text-sm">Loading activities…</p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity size={40} className="text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No activities found</p>
            <p className="text-slate-400 text-sm mt-1">
              {searchText || filterType !== 'all' ? 'Try adjusting your filters' : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((activity, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Type badge */}
                  <div className={`flex-none px-3 py-1.5 rounded-lg border text-xs font-semibold ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)} {getActivityTypeLabel(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-slate-500">{getFormattedDate(activity.timestamp)}</p>
                      <span className="text-xs text-slate-400">•</span>
                      <p className="text-xs text-slate-400 font-medium">{getRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>

                  {/* Activity indicator */}
                  <div className={`flex-none w-2.5 h-2.5 rounded-full ${
                    activity.type === 'staff_created' ? 'bg-teal-500' :
                    activity.type === 'report_uploaded' ? 'bg-blue-500' :
                    'bg-slate-300'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {!loading && filteredActivities.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{filteredActivities.length}</span> of <span className="font-semibold">{activities.length}</span> activities
          </p>
          <button
            onClick={() => {
              setSearchText('');
              setFilterType('all');
            }}
            className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
