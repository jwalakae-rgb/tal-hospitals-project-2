import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getDoctors, updateAvailability } from '../../api/doctors';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Spinner } from '../../components/Feedback';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Availability() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDoctors({ search: user?.name, limit: 5 });
        const mine = res.data.doctors.find((d) => d.user?.email === user?.email);
        if (mine) {
          setDoctor(mine);
          setSlots(mine.availability?.length ? mine.availability : []);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const addSlot = () => setSlots((prev) => [...prev, { day: 'Monday', startTime: '09:00', endTime: '13:00' }]);
  const updateSlot = (idx, field, value) =>
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  const removeSlot = (idx) => setSlots((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAvailability(doctor._id, slots);
      toast.success('Availability updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!doctor) return <p className="text-ink-500">Could not find your doctor profile.</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">My availability</h1>
        <p className="text-ink-500 text-sm">Set the days and hours patients can book you for.</p>
      </div>

      <Card className="p-6">
        <div className="space-y-3 mb-5">
          {slots.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-paper border border-line rounded-sm p-3">
              <select
                value={slot.day}
                onChange={(e) => updateSlot(idx, 'day', e.target.value)}
                className="px-3 py-2 rounded-sm border border-line text-sm bg-white"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                className="px-3 py-2 rounded-sm border border-line text-sm bg-white"
              />
              <span className="text-ink-500 text-sm">to</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                className="px-3 py-2 rounded-sm border border-line text-sm bg-white"
              />
              <button onClick={() => removeSlot(idx)} className="ml-auto text-ink-300 hover:text-signal-danger px-2">×</button>
            </div>
          ))}
          {slots.length === 0 && <p className="text-sm text-ink-500">No availability set yet.</p>}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={addSlot}>+ Add slot</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Save availability</Button>
        </div>
      </Card>
    </div>
  );
}
