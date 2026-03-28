import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

const ADMIN_LINKS = [
  { to: '/admin',         label: 'Dashboard', end: true },
  { to: '/admin/users',   label: 'Users' },
  { to: '/admin/stores',  label: 'Stores' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar links={ADMIN_LINKS} />
      <main className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>System overview</p>
        </div>

        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats?.totalUsers ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Stores</div>
                <div className="stat-value">{stats?.totalStores ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Ratings</div>
                <div className="stat-value">{stats?.totalRatings ?? 0}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <div className="section-header">
                  <h2>Quick Links</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/admin/users" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                    → Manage Users
                  </Link>
                  <Link to="/admin/stores" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                    → Manage Stores
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
