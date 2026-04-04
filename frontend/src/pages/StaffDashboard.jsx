import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Upload, Search,
  TrendingUp, Clock, CheckCircle, AlertCircle, Loader,
  ArrowRight, Activity
} from 'lucide-react';
import { getPatients } from '../services/patientService.js';
import { getUser } from '../utils/getUser.js';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [greeting, setGreeting]       = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12)      setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else                setGreeting('Good evening');

    getPatients()
      .then(data => setPatients(data || []))
      .catch(err => setError(err.message || 'Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

const user = getUser();

const staffName = user?.fullName || user?.name || user?.username || 'Staff';

  // Derive quick stats from patient data
  const totalPatients  = patients.length;
  const recentPatients = patients.filter(p => {
    const created = new Date(p.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  }).length;

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="text-sky-600 animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-sky-200 text-sm font-medium">{greeting}</p>
        <h1 className="text-2xl font-bold mt-0.5">{staffName} 👋</h1>
        <p className="text-sky-100 text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="text-red-500 flex-none" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Users size={20} />}
          label="Total Patients"
          value={totalPatients}
          color="sky"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="New This Week"
          value={recentPatients}
          color="emerald"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Reports Today"
          value="—"
          color="violet"
          sub="View in Reports"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Active Records"
          value={totalPatients}
          color="amber"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            icon={<Upload size={20} className="text-teal-600" />}
            title="Upload Report"
            description="Add a new lab, X-ray, prescription or any medical report"
            bg="bg-teal-50"
            border="border-teal-100"
            onClick={() => navigate('/staff-dashboard/upload')}
          />
          <QuickAction
            icon={<Search size={20} className="text-sky-600" />}
            title="Search Patients"
            description="Find a patient by name or ID and view their records"
            bg="bg-sky-50"
            border="border-sky-100"
            onClick={() => document.getElementById('patient-list')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </div>
      </div>

      {/* ── Patient List ── */}
      <div id="patient-list" className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Patients</h2>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full sm:w-64 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
          />
        </div>

        {filteredPatients.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            {search ? 'No patients match your search.' : 'No patients registered yet.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredPatients.map(patient => (
              <div
                key={patient._id}
                onClick={() => navigate(`/patients/${patient._id}`)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold flex-none">
                    {patient.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-400">{patient.patientId} · {patient.age}y · {patient.gender}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {patients.length > 8 && (
          <div className="px-5 py-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/patients')}
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              View all {patients.length} patients →
            </button>
          </div>
        )}
      </div>

      {/* ── Recent Activity (placeholder, wire up when you have activity API) ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-900 mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
          <Clock size={32} className="mb-2 opacity-40" />
          <p className="text-sm">Activity feed coming soon.</p>
          <p className="text-xs mt-0.5">Recent uploads and patient updates will appear here.</p>
        </div>
      </div>

    </div>
  );
}

/* ── Helper Components ── */

function StatCard({ icon, label, value, color, sub }) {
  const colors = {
    sky:     'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet:  'bg-violet-50 text-violet-600',
    amber:   'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function QuickAction({ icon, title, description, bg, border, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-4 rounded-2xl border ${border} ${bg} p-5 text-left hover:shadow-sm transition-all group w-full`}
    >
      <div className="flex-none w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 mt-1 transition-colors flex-none" />
    </button>
  );
}