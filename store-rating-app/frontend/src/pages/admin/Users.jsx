import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';

const ADMIN_LINKS = [
  { to: '/admin',        label: 'Dashboard', end: true },
  { to: '/admin/users',  label: 'Users' },
  { to: '/admin/stores', label: 'Stores' },
];

const ROLES = ['user', 'owner', 'admin'];

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/admin/users', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New User</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name (20–60 chars)</label>
            <input name="name" value={form.name} onChange={handleChange} required minLength={20} maxLength={60} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">Normal User</option>
                <option value="owner">Store Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Password (8–16 chars, 1 uppercase, 1 special)</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} maxLength={16} />
          </div>
          <div className="form-group">
            <label>Address (max 400 chars)</label>
            <input name="address" value={form.address} onChange={handleChange} maxLength={400} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── User Detail Modal ─────────────────────────────────────────────────────────
function UserDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then((r) => setUser(r.data))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>User Details</h2>
        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : !user ? (
          <div className="alert alert-error">User not found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>NAME</div>
              <div>{user.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>EMAIL</div>
              <div>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>ADDRESS</div>
              <div>{user.address || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>ROLE</div>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </div>
            {/* Show store rating if user is a store owner */}
            {user.role === 'owner' && (
              <div style={{ padding: '14px', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>STORE RATING</div>
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  <span className="text-muted">Store: </span>{user.store_name || 'No store assigned'}
                </div>
                {user.store_avg_rating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarRating value={Math.round(user.store_avg_rating)} readOnly size="sm" />
                    <span className="text-accent">{Number(user.store_avg_rating).toFixed(1)}</span>
                    <span className="text-muted" style={{ fontSize: 12 }}>avg rating</span>
                  </div>
                ) : (
                  <span className="text-muted" style={{ fontSize: 13 }}>No ratings yet</span>
                )}
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>JOINED</div>
              <div>{new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filters, setFilters]   = useState({ name: '', email: '', role: '', address: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.name)    params.name    = filters.name;
      if (filters.email)   params.email   = filters.email;
      if (filters.role)    params.role    = filters.role;
      if (filters.address) params.address = filters.address;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const columns = [
    { key: 'name',    label: 'Name' },
    { key: 'email',   label: 'Email' },
    { key: 'role',    label: 'Role',    render: (row) => <span className={`badge badge-${row.role}`}>{row.role}</span> },
    { key: 'address', label: 'Address', render: (row) => (
      <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.address || '—'}
      </span>
    )},
    { key: 'created_at', label: 'Joined', render: (row) => new Date(row.created_at).toLocaleDateString() },
    { key: 'actions', label: '', sortable: false, render: (row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUserId(row.id)}>View</button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="app-layout">
      <Sidebar links={ADMIN_LINKS} />
      <main className="main-content">
        <div className="page-header">
          <h1>Users</h1>
          <p>Manage all registered users</p>
        </div>

        {/* Filters — all 4: name, email, address, role */}
        <div className="filter-bar">
          <input placeholder="Search name…"    value={filters.name}    onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <input placeholder="Search email…"   value={filters.email}   onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
          <input placeholder="Search address…" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowAddModal(true)}>
            + Add User
          </button>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-center"><span className="spinner" /></div>
          ) : (
            <SortableTable columns={columns} data={users} emptyText="No users found" />
          )}
        </div>

        {showAddModal && (
          <AddUserModal onClose={() => setShowAddModal(false)} onSuccess={fetchUsers} />
        )}

        {selectedUserId && (
          <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        )}
      </main>
    </div>
  );
}
