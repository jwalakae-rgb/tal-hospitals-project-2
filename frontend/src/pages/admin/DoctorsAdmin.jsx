import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getDoctors, createDoctor, deleteDoctor } from '../../api/doctors';
import { getDepartments } from '../../api/departments';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { Spinner, EmptyState } from '../../components/Feedback';

function CreateDoctorModal({ departments, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    department: departments[0]?._id || '', specialization: '', experience: '', consultationFee: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createDoctor({
        ...form,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
      });
      toast.success('Doctor account created.');
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-pop max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-ink-950">Add doctor</h2>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-700 text-xl leading-none">×</button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-signal-danger bg-signal-dangerBg border border-signal-danger/20 rounded-sm px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Temporary password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Department" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </Select>
          <Input label="Specialization" required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          <Input label="Experience (years)" type="number" min={0} required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          <Input label="Consultation fee (₹)" type="number" min={0} required value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={loading} className="flex-1">Create doctor</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DoctorsAdmin() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: deptData } = useFetch(() => getDepartments(), []);
  const departments = deptData?.data?.departments || [];

  const { data, loading, refetch } = useFetch(() => getDoctors({ limit: 50 }), []);
  const doctors = data?.data?.doctors || [];

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this doctor account?')) return;
    try {
      await deleteDoctor(id);
      toast.success('Doctor deactivated.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Doctors</h1>
          <p className="text-ink-500 text-sm">Manage doctor accounts and their department assignments.</p>
        </div>
        <Button variant="accent" onClick={() => setShowCreate(true)} disabled={departments.length === 0}>
          + Add doctor
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors yet" description="Add your first doctor to get started." />
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Specialization</th>
                <th className="px-5 py-3">Fee</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d._id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium text-ink-900">Dr. {d.user?.name}</td>
                  <td className="px-5 py-3 text-ink-500">{d.department?.name}</td>
                  <td className="px-5 py-3 text-ink-500">{d.specialization}</td>
                  <td className="px-5 py-3 text-ink-500">₹{d.consultationFee}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${d.isAvailableForBooking ? 'bg-signal-successBg text-signal-success' : 'bg-signal-dangerBg text-signal-danger'}`}>
                      {d.isAvailableForBooking ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(d._id)} className="text-xs font-semibold text-signal-danger hover:underline">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate && (
        <CreateDoctorModal departments={departments} onClose={() => setShowCreate(false)} onCreated={refetch} />
      )}
    </div>
  );
}
