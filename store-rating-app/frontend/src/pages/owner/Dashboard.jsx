import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import StarRating from '../../components/StarRating';
import SortableTable from '../../components/SortableTable';
import api from '../../api/axios';

const OWNER_LINKS = [
  { to: '/owner', label: 'My Stores', end: true },
];

export default function OwnerDashboard() {
  const [stores, setStores]         = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratings, setRatings]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  useEffect(() => {
    api.get('/stores/my-stores')
      .then((r) => {
        setStores(r.data);
        if (r.data.length > 0) selectStore(r.data[0]);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const selectStore = async (store) => {
    setSelectedStore(store);
    setRatingsLoading(true);
    try {
      const { data } = await api.get(`/stores/my-stores/${store.id}/ratings`);
      setRatings(data.ratings || []);
    } finally {
      setRatingsLoading(false);
    }
  };

  const ratingColumns = [
    { key: 'user_name',  label: 'User' },
    { key: 'user_email', label: 'Email' },
    { key: 'rating',     label: 'Rating', render: (row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StarRating value={row.rating} readOnly size="sm" />
        <span className="text-accent">{row.rating}</span>
      </span>
    )},
    { key: 'updated_at', label: 'Last Updated', render: (row) => new Date(row.updated_at).toLocaleDateString() },
  ];

  return (
    <div className="app-layout">
      <Sidebar links={OWNER_LINKS} />
      <main className="main-content">
        <div className="page-header">
          <h1>My Stores</h1>
          <p>View ratings and feedback for your stores</p>
        </div>

        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : stores.length === 0 ? (
          <div className="empty-state">You don't own any stores yet. Contact an admin to get a store assigned.</div>
        ) : (
          <>
            {/* Store selector tabs if multiple stores */}
            {stores.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    className={`btn ${selectedStore?.id === s.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => selectStore(s)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {selectedStore && (
              <>
                {/* Store summary card */}
                <div className="stat-grid" style={{ marginBottom: 24 }}>
                  <div className="stat-card">
                    <div className="stat-label">Average Rating</div>
                    <div className="stat-value">
                      {selectedStore.avg_rating ? Number(selectedStore.avg_rating).toFixed(1) : '—'}
                    </div>
                    <StarRating value={Math.round(selectedStore.avg_rating || 0)} readOnly size="sm" />
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total Ratings</div>
                    <div className="stat-value">{selectedStore.total_ratings ?? 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Store Email</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 8, color: 'var(--text)' }}>
                      {selectedStore.email}
                    </div>
                  </div>
                </div>

                {/* Ratings table */}
                <div className="card">
                  <div className="section-header">
                    <h2>User Ratings</h2>
                    <span className="text-muted" style={{ fontSize: 12 }}>{ratings.length} total</span>
                  </div>

                  {ratingsLoading ? (
                    <div className="loading-center"><span className="spinner" /></div>
                  ) : (
                    <SortableTable
                      columns={ratingColumns}
                      data={ratings}
                      emptyText="No ratings yet for this store"
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
