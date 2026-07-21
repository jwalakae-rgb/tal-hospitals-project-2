import { useState } from 'react';
import toast from 'react-hot-toast';
import { createAppointment } from '../api/appointments';
import Button from './Button';
import Input from './Input';
import Select from './Select';

const TIME_SLOTS = [
  '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
  '11:00-11:30', '11:30-12:00', '14:00-14:30', '14:30-15:00',
  '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
];

export default function BookAppointmentModal({ doctor, onClose, onBooked }) {
  const [form, setForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    consultationType: 'in-person',
    reasonForVisit: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createAppointment({ doctorId: doctor._id, ...form });
      toast.success('Appointment requested! Watch your appointments list for approval.');
      onBooked?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-pop max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display font-semibold text-lg text-ink-950">Book with Dr. {doctor.user?.name}</h2>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-700 text-xl leading-none">×</button>
        </div>
        <p className="text-sm text-ink-500 mb-5">{doctor.specialization} · ₹{doctor.consultationFee} consultation fee</p>

        {error && (
          <div className="mb-4 text-sm text-signal-danger bg-signal-dangerBg border border-signal-danger/20 rounded-sm px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Appointment date"
            type="date"
            required
            min={minDate}
            value={form.appointmentDate}
            onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
          />
          <Select
            label="Time slot"
            required
            value={form.timeSlot}
            onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
          >
            <option value="">Select a time</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </Select>
          <Select
            label="Consultation type"
            value={form.consultationType}
            onChange={(e) => setForm({ ...form, consultationType: e.target.value })}
          >
            <option value="in-person">In-person</option>
            <option value="video">Video call</option>
            <option value="phone">Phone call</option>
          </Select>
          <label className="block">
            <span className="block text-sm font-medium text-ink-700 mb-1.5">Reason for visit (optional)</span>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-sm border border-line text-sm focus:ring-2 focus:ring-clinical-500/30 focus:border-clinical-500"
              value={form.reasonForVisit}
              onChange={(e) => setForm({ ...form, reasonForVisit: e.target.value })}
              placeholder="Briefly describe your symptoms or reason for the visit"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="accent" loading={loading} className="flex-1">Confirm booking</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
