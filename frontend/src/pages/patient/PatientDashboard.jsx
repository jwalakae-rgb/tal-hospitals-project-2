import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { getMyAppointments } from '../../api/appointments';
import Card from '../../components/Card';
import StatusPill from '../../components/StatusPill';
import Button from '../../components/Button';
import { Spinner, EmptyState } from '../../components/Feedback';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => getMyAppointments({ limit: 5 }), []);
  const appointments = data?.data?.appointments || [];

  const upcoming = appointments.filter((a) => ['pending', 'approved', 'rescheduled'].includes(a.status));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Hi {user?.name?.split(' ')[0]}, here's your care at a glance.</h1>
        <p className="text-ink-500 text-sm">Book new visits, track appointments, and see your prescriptions.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Upcoming visits</p>
          <p className="text-3xl font-display font-semibold text-ink-950">{upcoming.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Total appointments</p>
          <p className="text-3xl font-display font-semibold text-ink-950">{data?.meta?.total ?? 0}</p>
        </Card>
        <Card className="p-5 flex flex-col justify-between">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Need to see a doctor?</p>
          <Link to="/app/doctors">
            <Button variant="accent" className="w-full">Book an appointment</Button>
          </Link>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink-900">Recent appointments</h2>
          <Link to="/app/appointments" className="text-sm font-semibold text-clinical-700 hover:text-clinical-900">
            View all →
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No appointments yet"
            description="Once you book a visit, it'll show up here."
            action={
              <Link to="/app/doctors">
                <Button variant="primary">Find a doctor</Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-line">
            {appointments.map((a) => (
              <div key={a._id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900"> {a.doctor?.user?.name}</p>
                  <p className="text-sm text-ink-500">
                    {format(new Date(a.appointmentDate), 'MMM d, yyyy')} · {a.timeSlot} · {a.department?.name}
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
