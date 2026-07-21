import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getDepartments, createDepartment, deleteDepartment } from '../../api/departments';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Spinner, EmptyState } from '../../components/Feedback';

export default function DepartmentsAdmin() {
  const { data, loading, refetch } = useFetch(() => getDepartments(), []);
  const departments = data?.data?.departments || [];
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDepartment(form);
      toast.success('Department added.');
      setForm({ name: '', description: '' });
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this department? It must have no doctors assigned.')) return;
    try {
      await deleteDepartment(id);
      toast.success('Department deactivated.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Departments</h1>
        <p className="text-ink-500 text-sm">Organize doctors into departments patients can browse.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          {loading ? (
            <Spinner />
          ) : departments.length === 0 ? (
            <EmptyState title="No departments yet" description="Create your first department to organize doctors." />
          ) : (
            <div className="divide-y divide-line">
              {departments.map((d) => (
                <div key={d._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink-900">{d.name}</p>
                    {d.description && <p className="text-sm text-ink-500">{d.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(d._id)} className="text-xs font-semibold text-signal-danger hover:underline">
                    Deactivate
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-900 mb-4">Add department</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="block">
              <span className="block text-sm font-medium text-ink-700 mb-1.5">Description (optional)</span>
              <textarea
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-sm border border-line text-sm focus:ring-2 focus:ring-clinical-500/30 focus:border-clinical-500"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <Button type="submit" loading={saving} className="w-full">Add department</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
