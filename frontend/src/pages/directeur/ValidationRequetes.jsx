import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDateTime } from '../../utils/helpers';
import requeteService from '../../services/requeteService';
import { PeriodSelector, usePeriodFilter } from '../../hooks/usePeriodFilter';
import DocumentsPanel from '../../components/common/DocumentsPanel';
import Toast, { useToast } from '../../components/common/Toast';
import Layout from '../../components/common/Layout';

export default function ValidationRequetes() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState('APPROUVE');
  const [motif, setMotif] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();
  const [expandDocs, setExpandDocs] = useState({});

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const aValider = filtree.filter((r) => r.type === 'CORRECTION_NOM' && r.statut === 'EN_COURS');

  const handleDecision = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await requeteService.validerCorrectionNom(selected.id, decision, motif);
      const label = decision === 'APPROUVE' ? 'approuvée' : 'rejetée';
      showToast(`Correction de nom ${label}. La cellule informatique sera notifiée.`, 'success');
      setSelected(null);
      setMotif('');
      dispatch(fetchRequetes());
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="Validation — Corrections de nom">
      {toast && <Toast {...toast} onDismiss={clearToast} />}
      <main className="flex-1 p-4 md:p-6 space-y-4">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-gray-800">Corrections de nom à valider</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {aValider.length} requête(s) sur la période sélectionnée
            </p>
          </div>
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
        ) : aValider.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">✅</p>
            <p>Aucune correction de nom à valider sur cette période</p>
            <Link to="/directeur" className="text-blue-500 text-sm hover:underline mt-2 inline-block">
              ← Retour au tableau de bord
            </Link>
          </div>
        ) : (
          aValider.map((r) => (
            <div key={r.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800">
                    {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                  </p>
                  <p className="text-xs text-gray-400">
                    <span className="font-mono">{r.etudiant?.matricule}</span>
                    {' · '}{r.etudiant?.filiere}{' · '}{r.etudiant?.niveau}
                    {' · '}{formatDateTime(r.dateDepot)}
                  </p>

                  {r.correctionNom && (
                    <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-600 font-semibold mb-1">Modification demandée :</p>
                      <p className="text-sm">
                        <span className="text-red-500 line-through font-medium">{r.correctionNom.ancienNom}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-green-600 font-semibold">{r.correctionNom.nouveauNom}</span>
                      </p>
                    </div>
                  )}

                  {r.description && (
                    <p className="text-xs text-gray-500 mt-1.5 italic">« {r.description} »</p>
                  )}

                  <button
                    onClick={() => setExpandDocs((p) => ({ ...p, [r.id]: !p[r.id] }))}
                    className="text-xs text-blue-500 hover:underline mt-2"
                  >
                    📎 {r.documents?.length || 0} document(s) {expandDocs[r.id] ? '▲ Masquer' : '▼ Voir'}
                  </button>
                  {expandDocs[r.id] && (
                    <div className="mt-2">
                      <DocumentsPanel
                        documents={r.documents || []}
                        onDocumentUpdated={() => dispatch(fetchRequetes())}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                  <div className="flex gap-2">
                    <Link
                      to={`/directeur/requete/${r.id}`}
                      className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      👁 Détail
                    </Link>
                    <button
                      onClick={() => { setSelected(r); setDecision('APPROUVE'); setMotif(''); }}
                      className="btn-primary text-sm"
                    >
                      ⚖ Décision
                    </button>
                  </div>
                </div>
              </div>

              {selected?.id === r.id && (
                <div className="border-t pt-4 -mx-6 px-6 pb-4 bg-gray-50/50 rounded-b-xl space-y-3">
                  <div>
                    <label className="label">Décision *</label>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {[
                        ['APPROUVE', '✅ Approuver', 'green'],
                        ['REJETE', '❌ Rejeter', 'red'],
                      ].map(([val, label, color]) => (
                        <label
                          key={val}
                          className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors min-w-32 ${
                            decision === val
                              ? color === 'green' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`dec-dir-${r.id}`}
                            value={val}
                            checked={decision === val}
                            onChange={() => setDecision(val)}
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Commentaire de décision</label>
                    <textarea
                      className="input-field resize-none" rows={2}
                      placeholder="Justification ou observations..."
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleDecision}
                      disabled={actionLoading}
                      className={decision === 'APPROUVE' ? 'btn-success' : 'btn-danger'}
                    >
                      {actionLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                          En cours...
                        </span>
                      ) : `Confirmer : ${decision === 'APPROUVE' ? 'Approuver' : 'Rejeter'}`}
                    </button>
                    <button onClick={() => setSelected(null)} className="btn-secondary">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </Layout>
  );
}
