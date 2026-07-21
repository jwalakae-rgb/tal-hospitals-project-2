import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useFetch from '../../hooks/useFetch';
import { getOverview, getDepartmentPerformance, getDoctorUtilization, getPatientDemographics } from '../../api/admin';
import Card from '../../components/Card';
import { Spinner } from '../../components/Feedback';

const COLORS = ['#0F6B65', '#E8734A', '#2A5FA0', '#B4790F', '#C1443A', '#5FA89F'];

export default function AdminDashboard() {
  const { data: overview, loading: l1 } = useFetch(() => getOverview(), []);
  const { data: deptPerf, loading: l2 } = useFetch(() => getDepartmentPerformance(), []);
  const { data: docUtil, loading: l3 } = useFetch(() => getDoctorUtilization(), []);
  const { data: demo, loading: l4 } = useFetch(() => getPatientDemographics(), []);

  const kpi = overview?.data;
  const deptData = deptPerf?.data?.departmentPerformance || [];
  const utilData = docUtil?.data?.doctorUtilization || [];
  const cityData = (demo?.data?.byCity || []).slice(0, 8).map((d) => ({ name: d._id || 'Unknown', value: d.count }));
  const genderData = (demo?.data?.byGender || []).map((d) => ({ name: d._id || 'Unspecified', value: d.count }));

  if (l1) return <Spinner />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Hospital analytics</h1>
        <p className="text-ink-500 text-sm">Live snapshot of patients, doctors, appointments, and revenue.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-5 mb-8">
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Patients</p>
          <p className="text-3xl font-display font-semibold text-ink-950">{kpi?.totalPatients ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Doctors</p>
          <p className="text-3xl font-display font-semibold text-ink-950">{kpi?.totalDoctors ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Appointments</p>
          <p className="text-3xl font-display font-semibold text-ink-950">{kpi?.totalAppointments ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Cancellation rate</p>
          <p className="text-3xl font-display font-semibold text-signal-danger">{kpi?.cancellationRate ?? '0%'}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-4">Department performance</h2>
          {l2 ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE4E2" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalAppointments" fill="#0F6B65" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#5FA89F" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-4">Doctor utilization</h2>
          {l3 ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={utilData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE4E2" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="totalAppointments" fill="#E8734A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-4">Patients by city</h2>
          {l4 ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE4E2" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0A4A46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900 mb-4">Gender distribution</h2>
          {l4 ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {genderData.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
