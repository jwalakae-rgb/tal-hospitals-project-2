import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getDoctors, updateDoctor } from '../../api/doctors';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Spinner } from '../../components/Feedback';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDoctors({ search: user?.name, limit: 5 });
        const mine = res.data.doctors.find((d) => d.user?.email === user?.email);
        setDoctor(mine || null);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { specialization, experience, consultationFee, bio, isAvailableForBooking } = doctor;
      const res = await updateDoctor(doctor._id, { specialization, experience, consultationFee, bio, isAvailableForBooking });
      setDoctor(res.data.doctor);
      toast.success('Profile updated.');
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
        <h1 className="text-2xl font-semibold mb-1">My profile</h1>
        <p className="text-ink-500 text-sm">This is what patients see when they search for a doctor.</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-2">
          <Input label="Name" value={user?.name || ''} disabled />
          <Input label="Email" value={user?.email || ''} disabled />
        </div>
        <p className="text-xs text-ink-500">Department: {doctor.department?.name}</p>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Specialization"
            value={doctor.specialization}
            onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
          />
          <Input
            label="Experience (years)"
            type="number"
            min={0}
            value={doctor.experience}
            onChange={(e) => setDoctor({ ...doctor, experience: Number(e.target.value) })}
          />
          <Input
            label="Consultation fee (₹)"
            type="number"
            min={0}
            value={doctor.consultationFee}
            onChange={(e) => setDoctor({ ...doctor, consultationFee: Number(e.target.value) })}
          />
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={doctor.isAvailableForBooking}
              onChange={(e) => setDoctor({ ...doctor, isAvailableForBooking: e.target.checked })}
              className="w-4 h-4 accent-clinical-700"
            />
            <span className="text-sm text-ink-700">Currently accepting bookings</span>
          </label>
          <div className="sm:col-span-2">
            <label className="block">
              <span className="block text-sm font-medium text-ink-700 mb-1.5">Bio</span>
              <textarea
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-sm border border-line text-sm focus:ring-2 focus:ring-clinical-500/30 focus:border-clinical-500"
                value={doctor.bio || ''}
                onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
              />
            </label>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
