import { useState } from 'react';

export default function SortableTable({ columns, data, emptyText = 'No data found' }) {
  const [sort, setSort] = useState({ field: null, dir: 'asc' });

  const toggleSort = (field) => {
    setSort((prev) =>
      prev.field === field ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' }
    );
  };

  const sorted = [...data].sort((a, b) => {
    if (!sort.field) return 0;
    const av = a[sort.field] ?? '';
    const bv = b[sort.field] ?? '';
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} onClick={() => col.sortable !== false && toggleSort(col.key)}>
                {col.label}
                {col.sortable !== false && sort.field === col.key && (
                  <span className="sort-arrow">{sort.dir === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty-state">{emptyText}</td></tr>
          ) : (
            sorted.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? '—'}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
