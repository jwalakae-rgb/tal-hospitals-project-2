import { useState } from 'react';
import toast from 'react-hot-toast';
import { createPrescription } from '../api/prescriptions';
import Button from './Button';
import Input from './Input';

export default function PrescriptionModal({ appointment, onClose, onDone }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [treatmentCost, setTreatmentCost] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateMedicine = (idx, field, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  const addMedicine = () => setMedicines((prev) => [...prev, { name: '', dosage: '', frequency: '', duration: '' }]);
  const removeMedicine = (idx) => setMedicines((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!diagnosis.trim()) {
      setError('Diagnosis is required.');
      return;
    }
    setLoading(true);
    try {
      await createPrescription({
        appointmentId: appointment._id,
        diagnosis,
        notes,
        followUpDate: followUpDate || undefined,
        treatmentCost: treatmentCost ? Number(treatmentCost) : undefined,
        medicines: medicines.filter((m) => m.name.trim()),
      });
      toast.success('Prescription added and appointment marked completed.');
      onDone();
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
        className="bg-white rounded-lg shadow-pop max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display font-semibold text-lg text-ink-950">
            Add prescription — {appointment.patient?.user?.name}
          </h2>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-700 text-xl leading-none">×</button>
        </div>
        <p className="text-sm text-ink-500 mb-5">
          {new Date(appointment.appointmentDate).toLocaleDateString()} · {appointment.timeSlot}
        </p>

        {error && (
          <div className="mb-4 text-sm text-signal-danger bg-signal-dangerBg border border-signal-danger/20 rounded-sm px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Diagnosis" required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Seasonal allergic rhinitis" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink-700">Medicines</span>
              <button type="button" onClick={addMedicine} className="text-xs font-semibold text-clinical-700 hover:text-clinical-900">
                + Add medicine
              </button>
            </div>
            <div className="space-y-3">
              {medicines.map((m, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 bg-paper border border-line rounded-sm p-3">
                  <Input placeholder="Name" value={m.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} />
                  <Input placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} />
                  <Input placeholder="Frequency (e.g. twice daily)" value={m.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} />
                  <div className="flex gap-2">
                    <Input placeholder="Duration (e.g. 5 days)" value={m.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} />
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(idx)} className="text-ink-300 hover:text-signal-danger px-1">×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-ink-700 mb-1.5">Notes (optional)</span>
            <textarea
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-sm border border-line text-sm focus:ring-2 focus:ring-clinical-500/30 focus:border-clinical-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Follow-up date (optional)" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            <Input label="Treatment cost (optional)" type="number" min={0} value={treatmentCost} onChange={(e) => setTreatmentCost(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={loading} className="flex-1">Save prescription</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
