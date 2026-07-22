import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const TABS = [
  {
    key: 'patient',
    label: 'Patient',
    icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0',
  },
  {
    key: 'doctor',
    label: 'Doctor',
    icon: 'M6 3v6a4 4 0 008 0V3M10 15a6 6 0 006-6M18 21a3 3 0 100-6 3 3 0 000 6z',
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: 'M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01',
  },
];

const DEMO_CREDS = {
  patient: {
    email: 'arjun.verma@example.com',
    password: 'Patient@1234',
  },
  doctor: {
    email: 'aditi.sharma@talhospitals.com',
    password: 'Doctor@1234',
  },
  admin: {
    email: 'admin@talhospitals.com',
    password: 'Admin@1234',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      const from = location.state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-vital-500 flex items-center justify-center font-display font-bold text-white text-sm">T</div>
            <span className="font-display font-semibold text-ink-950">TALHospitals</span>
          </Link>
        </div>

        <Card className="p-8">
          <h1 className="text-xl font-display font-semibold text-ink-950 mb-1">Log in to your account</h1>
          <p className="text-sm text-ink-500 mb-6">Enter your credentials to continue.</p>

          {error && (
            <div className="mb-4 text-sm text-signal-danger bg-signal-dangerBg border border-signal-danger/20 rounded-sm px-3.5 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Log in
            </Button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-6">
            New patient?{' '}
            <Link to="/register" className="font-semibold text-clinical-700 hover:text-clinical-900">
              Create an account
            </Link>
          </p>
        </Card>

        <div className="mt-6 bg-clinical-50 border border-clinical-100 rounded-sm px-4 py-3 text-xs text-clinical-900">
          <p className="font-semibold mb-1">Demo credentials (after seeding)</p>
          <p>Admin: admin@talhospitals.com / Admin@1234</p>
          <p>Doctor: aditi.sharma@talhospitals.com / Doctor@1234</p>
          <p>Patient: arjun.verma@example.com / Patient@1234</p>
        </div>
      </div>
    </div>
  );
}
