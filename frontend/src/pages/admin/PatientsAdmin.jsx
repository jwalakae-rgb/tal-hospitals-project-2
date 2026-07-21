import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { getPatients } from '../../api/patients';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { Spinner, EmptyState } from '../../components/Feedback';

export default function PatientsAdmin() {
  const [search, setSearch] = useState('');
  const { data, loading } = useFetch(() => getPatients({ search: search || undefined, limit: 50 }), [search]);
  const patients = data?.data?.patients || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Patients</h1>
          <p className="text-ink-500 text-sm">{data?.meta?.total ?? 0} registered patients.</p>
        </div>
        <Input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
      </div>

      {loading ? (
        <Spinner />
      ) : patients.length === 0 ? (
        <EmptyState title="No patients found" description="Try a different search." />
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase tracking-wide">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Age</th>
                <th className="px-5 py-3">Gender</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium text-ink-900">{p.user?.name}</td>
                  <td className="px-5 py-3 text-ink-500">{p.user?.email}</td>
                  <td className="px-5 py-3 text-ink-500">{p.city || '—'}</td>
                  <td className="px-5 py-3 text-ink-500">{p.age ?? '—'}</td>
                  <td className="px-5 py-3 text-ink-500 capitalize">{p.gender || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
