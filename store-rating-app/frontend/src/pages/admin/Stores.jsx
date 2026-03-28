import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import SortableTable from '../../components/SortableTable';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';

const ADMIN_LINKS = [
  { to: '/admin',         label: 'Dashboard', end: true },
  { to: '/admin/users',   label: 'Users' },
  { to: '/admin/stores',  label: 'Stores' },
];

function AddStoreModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'owner' } }).then((r) => setOwners(r.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, owner_id: form.owner_id || null };
      await api.post('/admin/stores', payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Store</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Store Name (20–60 chars)</label>
            <input name="name" value={form.name} onChange={handleChange} required minLength={20} maxLength={60} />
          </div>
          <div className="form-group">
            <label>Store Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address (max 400 chars)</label>
            <input name="address" value={form.address} onChange={handleChange} required maxLength={400} />
          </div>
          <div className="form-group">
            <label>Owner (optional)</label>
            <select name="owner_id" value={form.owner_id} onChange={handleChange}>
              <option value="">No owner</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStores() {
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ name: '', address: '' });

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.name)    params.name    = filters.name;
      if (filters.address) params.address = filters.address;
      const { data } = await api.get('/admin/stores', { params });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this store?')) return;
    await api.delete(`/admin/stores/${id}`);
    fetchStores();
  };

  const columns = [
    { key: 'name',          label: 'Name' },
    { key: 'email',         label: 'Email' },
    { key: 'address',       label: 'Address', render: (row) => <span style={{ maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.address}</span> },
    { key: 'owner_name',    label: 'Owner', render: (row) => row.owner_name || <span className="text-muted">—</span> },
    { key: 'avg_rating',    label: 'Avg Rating', render: (row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StarRating value={Math.round(row.avg_rating || 0)} readOnly size="sm" />
        <span className="text-accent">{row.avg_rating ? Number(row.avg_rating).toFixed(1) : '—'}</span>
        <span className="text-muted" style={{ fontSize: 11 }}>({row.total_ratings})</span>
      </span>
    )},
    { key: 'actions', label: '', sortable: false, render: (row) => (
      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Delete</button>
    )},
  ];

  return (
    <div className="app-layout">
      <Sidebar links={ADMIN_LINKS} />
      <main className="main-content">
        <div className="page-header">
          <h1>Stores</h1>
          <p>Manage all stores and their ratings</p>
        </div>

        <div className="filter-bar">
          <input placeholder="Search name…"    value={filters.name}    onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <input placeholder="Search address…" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowModal(true)}>
            + Add Store
          </button>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-center"><span className="spinner" /></div>
          ) : (
            <SortableTable columns={columns} data={stores} emptyText="No stores found" />
          )}
        </div>

        {showModal && (
          <AddStoreModal onClose={() => setShowModal(false)} onSuccess={fetchStores} />
        )}
      </main>
    </div>
  );
}
