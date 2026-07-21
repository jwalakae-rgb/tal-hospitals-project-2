export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink-700 mb-1.5">{label}</span>}
      <select
        className={`w-full px-3.5 py-2.5 rounded-sm border text-sm bg-white focus:ring-2 focus:ring-clinical-500/30 focus:border-clinical-500 transition-colors ${
          error ? 'border-signal-danger' : 'border-line'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="block text-xs text-signal-danger mt-1">{error}</span>}
    </label>
  );
}
