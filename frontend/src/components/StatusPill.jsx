const STYLES = {
  pending: 'bg-signal-warningBg text-signal-warning',
  approved: 'bg-signal-infoBg text-signal-info',
  completed: 'bg-signal-successBg text-signal-success',
  cancelled: 'bg-signal-dangerBg text-signal-danger',
  rejected: 'bg-signal-dangerBg text-signal-danger',
  rescheduled: 'bg-vital-100 text-vital-700',
};

const DOTS = {
  pending: 'bg-signal-warning',
  approved: 'bg-signal-info',
  completed: 'bg-signal-success',
  cancelled: 'bg-signal-danger',
  rejected: 'bg-signal-danger',
  rescheduled: 'bg-vital-500',
};

export default function StatusPill({ status }) {
  const style = STYLES[status] || 'bg-ink-300/30 text-ink-700';
  const dot = DOTS[status] || 'bg-ink-500';
  return (
    <span className={`status-pill ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
