import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';

const USER_LINKS = [
  { to: '/dashboard', label: 'Stores', end: true },
];

function RateModal({ store, onClose, onSuccess }) {
  const [rating, setRating] = useState(store.user_rating || 0);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return setError('Please select a rating');
    setError('');
    setLoading(true);
    try {
      await api.post(`/stores/${store.id}/rate`, { rating });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{store.user_rating ? 'Update Rating' : 'Rate Store'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{store.name}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
          <span style={{ fontSize: 36, display: 'flex', gap: 6 }}>
            {[1,2,3,4,5].map((n) => (
              <span
                key={n}
                onClick={() => setRating(n)}
                style={{ cursor: 'pointer', color: n <= rating ? 'var(--accent)' : 'var(--border)', fontSize: 40, lineHeight: 1 }}
              >★</span>
            ))}
          </span>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
          {rating ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
        </p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !rating}>
            {loading ? <span className="spinner" /> : store.user_rating ? 'Update' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const [stores, setStores]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState({ name: '', address: '' });
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.name)    params.name    = search.name;
      if (search.address) params.address = search.address;
      const { data } = await api.get('/stores', { params });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  return (
    <div className="app-layout">
      <Sidebar links={USER_LINKS} />
      <main className="main-content">
        <div className="page-header">
          <h1>Stores</h1>
          <p>Browse and rate stores</p>
        </div>

        <div className="filter-bar" style={{ marginBottom: 20 }}>
          <input
            placeholder="Search by name…"
            value={search.name}
            onChange={(e) => setSearch({ ...search, name: e.target.value })}
          />
          <input
            placeholder="Search by address…"
            value={search.address}
            onChange={(e) => setSearch({ ...search, address: e.target.value })}
          />
        </div>

        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : stores.length === 0 ? (
          <div className="empty-state">No stores found</div>
        ) : (
          <div className="store-grid">
            {stores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-card-name">{store.name}</div>
                <div className="store-card-meta">{store.address}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{store.email}</div>

                <div className="store-card-rating">
                  <div>
                    <StarRating value={Math.round(store.avg_rating || 0)} readOnly size="sm" />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {store.avg_rating ? `${Number(store.avg_rating).toFixed(1)} avg` : 'No ratings yet'} · {store.total_ratings} review{store.total_ratings !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {store.user_rating && (
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                        Your rating: {store.user_rating}★
                      </div>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedStore(store)}
                    >
                      {store.user_rating ? 'Edit rating' : 'Rate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedStore && (
          <RateModal
            store={selectedStore}
            onClose={() => setSelectedStore(null)}
            onSuccess={fetchStores}
          />
        )}
      </main>
    </div>
  );
}
