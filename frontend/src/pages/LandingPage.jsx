import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Book in a few taps',
    body: 'Search doctors by department or specialty, check live availability, and reserve a slot without a phone call.',
    icon: 'M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  },
  {
    title: 'One record, every visit',
    body: 'Reports, prescriptions, and visit history stay attached to a single patient profile your doctor can see instantly.',
    icon: 'M14 3v5h5M6 3h8l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z',
  },
  {
    title: 'Built for the front desk too',
    body: 'Admins track department load, doctor utilization, and cancellations from one dashboard instead of five spreadsheets.',
    icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zm0 9h7v7h-7v-7zm-9 0h7v7H4v-7z',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-vital-500 flex items-center justify-center font-display font-bold text-white text-sm">T</div>
            <span className="font-display font-semibold text-ink-950">TALHospitals</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-700 hover:text-clinical-900 px-3 py-2">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-clinical-700 hover:bg-clinical-900 px-4 py-2.5 rounded-sm transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs font-semibold tracking-wide uppercase text-clinical-700 bg-clinical-50 border border-clinical-100 px-3 py-1 rounded-full mb-5">
            Patient & Appointment Management
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-ink-950 leading-tight mb-5">
            Hospital scheduling that doesn't feel like a waiting room.
          </h1>
          <p className="text-ink-500 text-lg leading-relaxed mb-8 max-w-md">
            Patients book and track visits, doctors manage their queue and prescriptions, and admins see the whole
            hospital's operations — all in one place.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-vital-500 hover:bg-vital-700 px-5 py-3 rounded-sm transition-colors"
            >
              Book your first appointment
            </Link>
            <Link to="/login" className="text-sm font-semibold text-ink-700 hover:text-clinical-900">
              I already have an account →
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-clinical-100 rounded-xl -z-10 rotate-1" />
          <div className="bg-white border border-line rounded-lg shadow-pop p-6">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-4">Today's queue · Cardiology</p>
            {[
              { name: 'Arjun Verma', time: '09:00', status: 'Approved' },
              { name: 'Sneha Reddy', time: '09:30', status: 'Pending' },
              { name: 'Vikram Singh', time: '10:00', status: 'Completed' },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between py-3 border-b border-line last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-900">{row.name}</p>
                  <p className="text-xs text-ink-500">{row.time}</p>
                </div>
                <span className="text-xs font-semibold text-clinical-700 bg-clinical-50 px-2.5 py-1 rounded-full">
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white border border-line rounded-lg p-6">
            <div className="w-10 h-10 rounded-sm bg-clinical-50 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 text-clinical-700">
                <path d={f.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-ink-900 mb-2">{f.title}</h3>
            <p className="text-sm text-ink-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line py-8">
        <div className="max-w-6xl mx-auto px-6 text-xs text-ink-500">
          © {new Date().getFullYear()} TALHospitals. Internship demo project — not for clinical use.
        </div>
      </footer>
    </div>
  );
}
