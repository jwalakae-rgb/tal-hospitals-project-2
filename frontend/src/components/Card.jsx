export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-lg border border-line shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}
