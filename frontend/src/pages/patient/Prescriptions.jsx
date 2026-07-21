import { format } from 'date-fns';
import useFetch from '../../hooks/useFetch';
import { getMyPrescriptions } from '../../api/prescriptions';
import Card from '../../components/Card';
import { Spinner, EmptyState } from '../../components/Feedback';

export default function Prescriptions() {
  const { data, loading } = useFetch(() => getMyPrescriptions(), []);
  const prescriptions = data?.data?.prescriptions || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Prescriptions</h1>
        <p className="text-ink-500 text-sm">Diagnoses, medicines, and follow-up notes from your doctors.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : prescriptions.length === 0 ? (
        <EmptyState title="No prescriptions yet" description="Prescriptions added by your doctor after a visit will show up here." />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <Card key={p._id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-semibold text-ink-950">{p.diagnosis}</p>
                  <p className="text-sm text-ink-500">
                    Dr. {p.doctor?.user?.name} · {format(new Date(p.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {p.treatmentCost > 0 && (
                  <span className="text-sm font-semibold text-clinical-700">₹{p.treatmentCost}</span>
                )}
              </div>

              {p.medicines?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Medicines</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {p.medicines.map((m, idx) => (
                      <div key={idx} className="bg-paper border border-line rounded-sm px-3 py-2 text-sm">
                        <p className="font-medium text-ink-900">{m.name}</p>
                        <p className="text-xs text-ink-500">{[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {p.notes && <p className="text-sm text-ink-700 mb-2">{p.notes}</p>}
              {p.followUpDate && (
                <p className="text-xs text-signal-info bg-signal-infoBg inline-block px-2.5 py-1 rounded-full">
                  Follow up on {format(new Date(p.followUpDate), 'MMM d, yyyy')}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
