const VARIANTS = {
  primary: 'bg-clinical-700 text-white hover:bg-clinical-900 disabled:bg-clinical-300',
  accent: 'bg-vital-500 text-white hover:bg-vital-700 disabled:bg-vital-300',
  ghost: 'bg-transparent text-clinical-900 hover:bg-clinical-50 border border-line',
  danger: 'bg-white text-signal-danger border border-signal-danger hover:bg-signal-dangerBg',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm font-semibold text-sm transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
