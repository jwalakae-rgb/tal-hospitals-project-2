import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getMyAppointments, updateAppointmentStatus } from '../../api/appointments';
import Card from '../../components/Card';
import StatusPill from '../../components/StatusPill';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { Spinner, EmptyState } from '../../components/Feedback';
import PrescriptionModal from '../../components/PrescriptionModal';

export default function AppointmentRequests() {
  const [statusFilter, setStatusFilter] = useState('');
  const [prescribingFor, setPrescribingFor] = useState(null);
  const { data, loading, refetch } = useFetch(
    () => getMyAppointments({ status: statusFilter || undefined, limit: 50 }),
    [statusFilter]
  );
  const appointments = data?.data?.appointments || [];

  const handleStatus = async (id, status) => {
    let cancellationReason;
    if (status === 'cancelled' || status === 'rejected') {
      cancellationReason = window.prompt('Optional reason:') || '';
    }
    try {
      await updateAppointmentStatus(id, { status, cancellationReason });
      toast.success(`Appointment ${status}.`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Appointment requests</h1>
          <p className="text-ink-500 text-sm">Approve, reject, or complete patient bookings.</p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments found" description="Bookings matching this filter will appear here." />
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => (
            <Card key={a._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-ink-950">{a.patient?.user?.name}</p>
                  <p className="text-sm text-ink-500">{a.patient?.user?.email} · {a.patient?.user?.phone}</p>
                  <p className="text-sm text-ink-700 mt-1">
                    {format(new Date(a.appointmentDate), 'EEEE, MMM d, yyyy')} · {a.timeSlot} · {a.consultationType}
                  </p>
                  {a.reasonForVisit && <p className="text-sm text-ink-500 mt-1">"{a.reasonForVisit}"</p>}
                </div>
                <StatusPill status={a.status} />
              </div>

              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-line">
                {a.status === 'pending' && (
                  <>
                    <Button variant="primary" onClick={() => handleStatus(a._id, 'approved')}>Approve</Button>
                    <Button variant="danger" onClick={() => handleStatus(a._id, 'rejected')}>Reject</Button>
                  </>
                )}
                {a.status === 'rescheduled' && (
                  <>
                    <Button variant="primary" onClick={() => handleStatus(a._id, 'approved')}>Approve new time</Button>
                    <Button variant="danger" onClick={() => handleStatus(a._id, 'rejected')}>Reject</Button>
                  </>
                )}
                {a.status === 'approved' && (
                  <>
                    <Button variant="primary" onClick={() => setPrescribingFor(a)}>Add prescription & complete</Button>
                    <Button variant="danger" onClick={() => handleStatus(a._id, 'cancelled')}>Cancel</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {prescribingFor && (
        <PrescriptionModal
          appointment={prescribingFor}
          onClose={() => setPrescribingFor(null)}
          onDone={refetch}
        />
      )}
    </div>
  );
}
