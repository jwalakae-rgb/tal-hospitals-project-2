import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { getDoctors } from '../../api/doctors';
import { getDepartments } from '../../api/departments';
import Card from '../../components/Card';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Spinner, EmptyState } from '../../components/Feedback';
import BookAppointmentModal from '../../components/BookAppointmentModal';

export default function FindDoctors() {
  const [filters, setFilters] = useState({ department: '', search: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { data: deptData } = useFetch(() => getDepartments(), []);
  const departments = deptData?.data?.departments || [];

  const { data, loading, refetch } = useFetch(
    () => getDoctors({ department: filters.department || undefined, search: filters.search || undefined, limit: 20 }),
    [filters.department, filters.search]
  );
  const doctors = data?.data?.doctors || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Find a doctor</h1>
        <p className="text-ink-500 text-sm">Search by name, specialty, or department, then book a slot that works for you.</p>
      </div>

      <Card className="p-5 mb-6 grid sm:grid-cols-2 gap-4">
        <Input
          label="Search"
          placeholder="Doctor name or specialty"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          label="Department"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </Select>
      </Card>

      {loading ? (
        <Spinner />
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors found" description="Try a different search term or department." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {doctors.map((doc) => (
            <Card key={doc._id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-semibold text-ink-950">Dr. {doc.user?.name}</p>
                  <p className="text-sm text-ink-500">{doc.specialization}</p>
                </div>
                <span className="text-xs font-semibold text-clinical-700 bg-clinical-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {doc.department?.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-ink-500 mb-4">
                <span>{doc.experience} yrs experience</span>
                <span>·</span>
                <span>₹{doc.consultationFee} fee</span>
              </div>
              <Button
                variant="primary"
                className="mt-auto"
                disabled={!doc.isAvailableForBooking}
                onClick={() => setSelectedDoctor(doc)}
              >
                {doc.isAvailableForBooking ? 'Book appointment' : 'Not accepting bookings'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <BookAppointmentModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onBooked={refetch}
        />
      )}
    </div>
  );
}
