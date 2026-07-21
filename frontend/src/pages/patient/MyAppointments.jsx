import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getMyAppointments, cancelAppointment, rescheduleAppointment } from '../../api/appointments';
import Card from '../../components/Card';
import StatusPill from '../../components/StatusPill';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Input from '../../components/Input';
import { Spinner, EmptyState } from '../../components/Feedback';

const TIME_SLOTS = [
  '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
  '11:00-11:30', '11:30-12:00', '14:00-14:30', '14:30-15:00',
  '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
];

function RescheduleForm({ appointment, onDone }) {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!date || !slot) return toast.error('Pick a new date and time slot.');
    setLoading(true);
    try {
      await rescheduleAppointment(appointment._id, { appointmentDate: date, timeSlot: slot });
      toast.success('Appointment rescheduled.');
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3 mt-3 bg-clinical-50 border border-clinical-100 rounded-sm p-3">
      <Input type="date" label="New date" min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} />
      <Select label="New time" value={slot} onChange={(e) => setSlot(e.target.value)}>
        <option value="">Select time</option>
        {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Button variant="primary" loading={loading} onClick={submit}>Save</Button>
      <Button variant="ghost" onClick={() => onDone(false)}>Cancel</Button>
    </div>
  );
}

export default function MyAppointments() {
  const [statusFilter, setStatusFilter] = useState('');
  const [reschedulingId, setReschedulingId] = useState(null);
  const { data, loading, refetch } = useFetch(
    () => getMyAppointments({ status: statusFilter || undefined, limit: 50 }),
    [statusFilter]
  );
  const appointments = data?.data?.appointments || [];

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">My appointments</h1>
          <p className="text-ink-500 text-sm">Track, reschedule, or cancel your upcoming and past visits.</p>
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
        <EmptyState title="No appointments found" description="Appointments matching this filter will appear here." />
      ) : (
        <div className="space-y-4">
          {appointments.map((a) => (
            <Card key={a._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-ink-950">Dr. {a.doctor?.user?.name}</p>
                  <p className="text-sm text-ink-500">{a.department?.name} · {a.doctor?.specialization}</p>
                  <p className="text-sm text-ink-700 mt-1">
                    {format(new Date(a.appointmentDate), 'EEEE, MMM d, yyyy')} · {a.timeSlot}
                  </p>
                  {a.reasonForVisit && <p className="text-sm text-ink-500 mt-1">"{a.reasonForVisit}"</p>}
                  {a.status === 'cancelled' && a.cancellationReason && (
                    <p className="text-xs text-signal-danger mt-1">Reason: {a.cancellationReason}</p>
                  )}
                </div>
                <StatusPill status={a.status} />
              </div>

              {['pending', 'approved'].includes(a.status) && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-line">
                  <Button
                    variant="ghost"
                    onClick={() => setReschedulingId(reschedulingId === a._id ? null : a._id)}
                  >
                    Reschedule
                  </Button>
                  <Button variant="danger" onClick={() => handleCancel(a._id)}>Cancel</Button>
                </div>
              )}

              {reschedulingId === a._id && (
                <RescheduleForm
                  appointment={a}
                  onDone={(shouldRefetch = true) => {
                    setReschedulingId(null);
                    if (shouldRefetch) refetch();
                  }}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
