import { useState } from 'react';
import { format } from 'date-fns';
import useFetch from '../../hooks/useFetch';
import { getAllAppointments } from '../../api/appointments';
import Card from '../../components/Card';
import StatusPill from '../../components/StatusPill';
import Select from '../../components/Select';
import { Spinner, EmptyState } from '../../components/Feedback';

export default function AppointmentsAdmin() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading } = useFetch(
    () => getAllAppointments({ status: statusFilter || undefined, limit: 50 }),
    [statusFilter]
  );
  const appointments = data?.data?.appointments || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Appointment monitoring</h1>
          <p className="text-ink-500 text-sm">{data?.meta?.total ?? 0} total appointments across all doctors.</p>
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
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Doctor</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Date & time</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium text-ink-900">{a.patient?.user?.name}</td>
                  <td className="px-5 py-3 text-ink-500">Dr. {a.doctor?.user?.name}</td>
                  <td className="px-5 py-3 text-ink-500">{a.department?.name}</td>
                  <td className="px-5 py-3 text-ink-500">
                    {format(new Date(a.appointmentDate), 'MMM d, yyyy')} · {a.timeSlot}
                  </td>
                  <td className="px-5 py-3"><StatusPill status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
