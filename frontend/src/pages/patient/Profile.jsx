import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getMyPatientProfile, updateMyPatientProfile, uploadReport, getMyReports } from '../../api/patients';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { Spinner } from '../../components/Feedback';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, reportsRes] = await Promise.all([getMyPatientProfile(), getMyReports()]);
      setProfile(profileRes.data.patient);
      setReports(reportsRes.data.medicalReports);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { age, gender, city, address, bloodGroup } = profile;
      const res = await updateMyPatientProfile({ age, gender, city, address, bloodGroup });
      setProfile(res.data.patient);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('report', file);
    setUploading(true);
    try {
      const res = await uploadReport(formData);
      setReports(res.data.medicalReports);
      toast.success('Report uploaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading || !profile) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">My profile</h1>
        <p className="text-ink-500 text-sm">Keep your details current so doctors have accurate context.</p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-display font-semibold text-ink-900 mb-4">Account details</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-2">
          <Input label="Name" value={user?.name || ''} disabled />
          <Input label="Email" value={user?.email || ''} disabled />
        </div>
        <p className="text-xs text-ink-500">Contact hospital admin to change your name or email.</p>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-display font-semibold text-ink-900 mb-4">Medical details</h2>
        <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Age"
            type="number"
            min={0}
            max={130}
            value={profile.age ?? ''}
            onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Select
            label="Gender"
            value={profile.gender || ''}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="City"
            value={profile.city || ''}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          />
          <Select
            label="Blood group"
            value={profile.bloodGroup || ''}
            onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value || null })}
          >
            <option value="">Unknown</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <Input
              label="Address"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink-900">Medical reports</h2>
          <label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="ghost" loading={uploading} onClick={() => fileRef.current?.click()}>
              Upload report
            </Button>
          </label>
        </div>

        {reports.length === 0 ? (
          <p className="text-sm text-ink-500">No reports uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <a
                key={r._id}
                href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${r.filePath}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-3 bg-paper border border-line rounded-sm hover:border-clinical-300 transition-colors"
              >
                <span className="text-sm font-medium text-ink-900">{r.fileName}</span>
                <span className="text-xs text-ink-500">{new Date(r.uploadedAt).toLocaleDateString()}</span>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
