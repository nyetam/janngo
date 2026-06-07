import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequetes } from '../../store/requeteSlice';
import requeteService from '../../services/requeteService';
import { formatDateTime, getStatutClass, getStatutLabel } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import { PeriodSelector, usePeriodFilter } from '../../hooks/usePeriodFilter';
import DocumentsPanel from '../../components/common/DocumentsPanel';
import Toast, { useToast } from '../../components/common/Toast';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

export default function TraitementRequetesDept() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState('FAVORABLE');
  const [commentaire, setCommentaire] = useState('');
  const [noteCorrigee, setNoteCorrigee] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();
  const [expandDocs, setExpandDocs] = useState({});

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const handleDecision = async (r) => {
    setActionLoading(true);
    try {
      if (r.type === 'ATTESTATION') {
        await requeteService.resultatAttestation(r.id, decision, commentaire);
      } else if (r.type === 'CONTESTATION_NOTE') {
        await requeteService.resultatContestation(r.id, decision, commentaire, noteCorrigee ? parseFloat(noteCorrigee) : null);
      }
      showToast(`Décision "${decision}" enregistrée avec succès.`, 'success');
      setSelected(null);
      dispatch(fetchRequetes());
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnalyser = async (r) => {
    try {
      await requeteService.analyserContestation(r.id, 'Dossier réceptionné — analyse en cours');
      showToast('Dossier réceptionné.', 'success');
      dispatch(fetchRequetes());
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {toast && <Toast {...toast} onDismiss={clearToast} />}
      <div className="flex-1 flex flex-col">
        <Navbar title="Traitement des requêtes" />
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
                  <div className="flex gap-3 items-start">
                    <span className="text-3xl">{TYPES_REQUETE[r.type]?.icon}</span>
                    <div>
                      <p className="font-semibold">{TYPES_REQUETE[r.type]?.label}</p>
                      <p className="text-sm text-gray-500">
                        {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom} · {r.etudiant?.matricule}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(r.dateDepot)}</p>

                      {r.attestation && <p className="text-sm mt-1 text-blue-700">{r.attestation.typeAttestation} · {r.attestation.anneeAcademique}</p>}
                      {r.contestationNote && (
                        <div className="mt-1 text-sm">
                          <p className="text-purple-700">Matière : <strong>{r.contestationNote.matiere}</strong> · Note : <strong className="text-red-500">{r.contestationNote.noteContestee}/20</strong></p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.contestationNote.motifContestation}</p>
                        </div>
                      )}

                      {/* Documents count + expand */}
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
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>

                    {r.type === 'CONTESTATION_NOTE' && r.statut === 'EN_ATTENTE' && (
                      <button onClick={() => handleAnalyser(r)} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                        📥 Réceptionner
                      </button>
                    )}

                    {['EN_COURS', 'EN_ATTENTE'].includes(r.statut) && (
                      <button
                        onClick={() => { setSelected(r); setDecision('FAVORABLE'); setCommentaire(''); setNoteCorrigee(''); }}
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
                            <input type="radio" name={`dec-${r.id}`} value={val} checked={decision === val}
                              onChange={() => setDecision(val)} />
                            <span className="text-sm font-medium">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {r.type === 'CONTESTATION_NOTE' && decision === 'FAVORABLE' && (
                      <div>
                        <label className="label">Note corrigée (si connue)</label>
                        <input type="number" min="0" max="20" step="0.25" className="input-field"
                          placeholder="Nouvelle note /20" value={noteCorrigee}
                          onChange={(e) => setNoteCorrigee(e.target.value)} />
                      </div>
                    )}

                    <div>
                      <label className="label">Commentaire de décision</label>
                      <textarea className="input-field resize-none" rows={2}
                        placeholder="Justification de la décision..."
                        value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleDecision(r)} disabled={actionLoading}
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
