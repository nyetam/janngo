import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequetes } from '../../store/requeteSlice';
import requeteService from '../../services/requeteService';
import { formatDateTime, getStatutClass, getStatutLabel } from '../../utils/helpers';
import { PeriodSelector, usePeriodFilter } from '../../hooks/usePeriodFilter';
import DocumentsPanel from '../../components/common/DocumentsPanel';
import Toast, { useToast } from '../../components/common/Toast';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

export default function TraitementRequetesScol() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState('FAVORABLE');
  const [motif, setMotif] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();
  const [expandDocs, setExpandDocs] = useState({});

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const handleDecision = async () => {
    setActionLoading(true);
    try {
      await requeteService.resultatAttestation(selected.id, decision, motif);
      showToast(`Décision "${decision}" enregistrée avec succès.`, 'success');
      setSelected(null);
      dispatch(fetchRequetes());
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {toast && <Toast {...toast} onDismiss={clearToast} />}
      <div className="flex-1 flex flex-col">
        <Navbar title="Traitement attestations" />
        <main className="flex-1 p-6 space-y-4">

          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-gray-700">{filtree.length} requête(s)</h2>
            <PeriodSelector
              periode={periode}
              onChange={setPeriode}
              onRefresh={() => dispatch(fetchRequetes())}
              loading={loading}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filtree.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              <p className="text-5xl mb-3">✅</p><p>Aucune requête sur cette période</p>
            </div>
          ) : (
            filtree.map((r) => (
              <div key={r.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.etudiant?.matricule} · {r.etudiant?.filiere} · {formatDateTime(r.dateDepot)}
                    </p>
                    {r.attestation && (
                      <p className="text-sm mt-1.5 text-blue-700 font-medium">
                        {r.attestation.typeAttestation} · {r.attestation.anneeAcademique} · {r.attestation.nombreExemplaires} ex.
                      </p>
                    )}
                    {r.description && <p className="text-xs text-gray-500 mt-1 italic">« {r.description} »</p>}

                    <button
                      onClick={() => setExpandDocs((p) => ({ ...p, [r.id]: !p[r.id] }))}
                      className="text-xs text-blue-500 hover:underline mt-1"
                    >
                      📎 {r.documents?.length || 0} document(s) {expandDocs[r.id] ? '▲' : '▼'}
                    </button>
                    {expandDocs[r.id] && (
                      <div className="mt-2">
                        <DocumentsPanel documents={r.documents || []} onDocumentUpdated={() => dispatch(fetchRequetes())} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                    {r.statut === 'EN_COURS' && (
                      <button
                        onClick={() => { setSelected(r); setDecision('FAVORABLE'); setMotif(''); }}
                        className="btn-primary text-sm"
                      >
                        Décision
                      </button>
                    )}
                  </div>
                </div>

                {selected?.id === r.id && (
                  <div className="border-t pt-3 space-y-3 bg-gray-50/50 -mx-6 px-6 pb-3 rounded-b-xl">
                    <div>
                      <label className="label">Décision *</label>
                      <div className="flex gap-3 mt-1">
                        {[['FAVORABLE', '✅ FAVORABLE'], ['DEFAVORABLE', '❌ DÉFAVORABLE']].map(([val, label]) => (
                          <label key={val} className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                            decision === val
                              ? val === 'FAVORABLE' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}>
                            <input type="radio" name={`dec-scol-${r.id}`} value={val}
                              checked={decision === val} onChange={() => setDecision(val)} />
                            <span className="text-sm font-medium">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">Motif</label>
                      <textarea className="input-field resize-none" rows={2}
                        placeholder="Justification..." value={motif}
                        onChange={(e) => setMotif(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleDecision} disabled={actionLoading}
                        className={decision === 'FAVORABLE' ? 'btn-success' : 'btn-danger'}>
                        {actionLoading ? 'En cours...' : `Confirmer : ${decision}`}
                      </button>
                      <button onClick={() => setSelected(null)} className="btn-secondary">Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
