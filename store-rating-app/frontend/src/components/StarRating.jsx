export default function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'star-display' : '';

  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${sizeClass} ${n <= (value || 0) ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange && onChange(n)}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
