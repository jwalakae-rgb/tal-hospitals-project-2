import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { getMyAppointments } from '../../api/appointments';
import Card from '../../components/Card';
import StatusPill from '../../components/StatusPill';
import { Spinner, EmptyState } from '../../components/Feedback';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => getMyAppointments({ limit: 8 }), []);
  const appointments = data?.data?.appointments || [];
  const pending = appointments.filter((a) => a.status === 'pending');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]}</h1>
        <p className="text-ink-500 text-sm">Here's what's on your schedule.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Pending requests</p>
          <p className="text-3xl font-display font-semibold text-ink-950">{pending.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Total appointments</p>
          <p className="text-3xl font-display font-semibold text-ink-950">{data?.meta?.total ?? 0}</p>
        </Card>
        <Card className="p-5 flex flex-col justify-between">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Manage your schedule</p>
          <Link to="/app/availability" className="text-sm font-semibold text-clinical-700 hover:text-clinical-900">
            Update availability →
          </Link>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink-900">Recent appointment activity</h2>
          <Link to="/app/appointments" className="text-sm font-semibold text-clinical-700 hover:text-clinical-900">
            View all →
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <EmptyState title="No appointments yet" description="Patient bookings will appear here." />
        ) : (
          <div className="divide-y divide-line">
            {appointments.map((a) => (
              <div key={a._id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900">{a.patient?.user?.name}</p>
                  <p className="text-sm text-ink-500">
                    {format(new Date(a.appointmentDate), 'MMM d, yyyy')} · {a.timeSlot}
                  </p>
                </div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
