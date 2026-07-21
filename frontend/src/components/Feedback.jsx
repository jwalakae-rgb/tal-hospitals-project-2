export function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <span className="w-6 h-6 border-2 border-clinical-100 border-t-clinical-700 rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="w-12 h-12 rounded-full bg-clinical-50 border border-clinical-100 mx-auto mb-4 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-clinical-500">
          <path d="M9 12h6m-6 4h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" strokeWidth="1.5" />
        </svg>
      </div>
      <h3 className="font-display font-semibold text-ink-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-sm mx-auto mb-4">{description}</p>}
      {action}
    </div>
  );
}
