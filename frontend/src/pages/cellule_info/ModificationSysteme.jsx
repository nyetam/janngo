import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequetes } from '../../store/requeteSlice';
import requeteService from '../../services/requeteService';
import { formatDateTime, getStatutClass, getStatutLabel } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import { PeriodSelector, usePeriodFilter } from '../../hooks/usePeriodFilter';
import DocumentsPanel from '../../components/common/DocumentsPanel';
import Layout from '../../components/common/Layout';

export default function ModificationSysteme() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  const [selected, setSelected] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [noteCorrigee, setNoteCorrigee] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [expandDocs, setExpandDocs] = useState({});

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const aModifier = filtree.filter((r) => r.statut === 'VALIDEE');

  const handleModifier = async (r) => {
    setActionLoading(true);
    setMsg(null);
    try {
      if (r.type === 'CORRECTION_NOM') {
        await requeteService.modifierCorrectionNom(r.id, commentaire || 'Nom modifié dans le système');
      } else if (r.type === 'CONTESTATION_NOTE') {
        const note = noteCorrigee ? parseFloat(noteCorrigee) : r.contestationNote?.noteCorrigee;
        await requeteService.modifierNote(r.id, note, commentaire || 'Note mise à jour dans le système');
      }
      setMsg({ type: 'success', text: '✅ Modification effectuée. Requête clôturée et étudiant notifié.' });
      setSelected(null);
      setCommentaire('');
      setNoteCorrigee('');
      dispatch(fetchRequetes());
    } catch (err) {
      setMsg({ type: 'error', text: '⚠ ' + (err.response?.data?.message || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="Modifications système">
      <main className="flex-1 p-4 md:p-6 space-y-4">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-gray-800">Modifications à effectuer</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {aModifier.length} requête(s) validée(s) sur la période sélectionnée
            </p>
          </div>
          <PeriodSelector
            periode={periode}
            onChange={setPeriode}
            onRefresh={() => dispatch(fetchRequetes())}
            loading={loading}
          />
        </div>

        {msg && (
          <div className={`p-3.5 rounded-xl text-sm font-medium ${
            msg.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : aModifier.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">✅</p>
            <p>Aucune modification à effectuer sur cette période</p>
          </div>
        ) : (
          aModifier.map((r) => (
            <div key={r.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex gap-3 items-start min-w-0">
                  <span className="text-3xl flex-shrink-0">{TYPES_REQUETE[r.type]?.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{TYPES_REQUETE[r.type]?.label}</p>
                    <p className="text-sm text-gray-500">
                      {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                      {' · '}<span className="font-mono text-xs">{r.etudiant?.matricule}</span>
                    </p>
                    <p className="text-xs text-gray-400">{formatDateTime(r.dateDepot)}</p>

                    {r.type === 'CORRECTION_NOM' && r.correctionNom && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-600 font-semibold mb-1">🖊 Modification à effectuer dans le système :</p>
                        <p className="text-sm">
                          Remplacer{' '}
                          <span className="font-medium text-red-500 line-through">{r.correctionNom.ancienNom}</span>
                          {' par '}
                          <span className="font-semibold text-green-600">{r.correctionNom.nouveauNom}</span>
                        </p>
                      </div>
                    )}

                    {r.type === 'CONTESTATION_NOTE' && r.contestationNote && (
                      <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                        <p className="text-xs text-purple-600 font-semibold">📊 Mise à jour de note :</p>
                        <p className="text-sm">
                          Matière : <strong>{r.contestationNote.matiere}</strong>
                        </p>
                        <p className="text-sm">
                          Note actuelle : <span className="text-red-500 font-medium">{r.contestationNote.noteContestee}/20</span>
                          {r.contestationNote.noteCorrigee != null && (
                            <> → <span className="text-green-600 font-semibold">{r.contestationNote.noteCorrigee}/20</span></>
                          )}
                        </p>
                      </div>
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
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                  <button
                    onClick={() => { setSelected(r); setCommentaire(''); setNoteCorrigee(''); setMsg(null); }}
                    className="btn-primary text-sm"
                  >
                    🔧 Marquer fait
                  </button>
                </div>
              </div>

              {selected?.id === r.id && (
                <div className="border-t pt-4 -mx-6 px-6 pb-4 bg-indigo-50/40 rounded-b-xl space-y-3">
                  <p className="text-sm font-medium text-indigo-700">
                    ✔ Confirmez que la modification a bien été effectuée dans le système informatique de l'IUT.
                  </p>

                  {r.type === 'CONTESTATION_NOTE' && !r.contestationNote?.noteCorrigee && (
                    <div>
                      <label className="label">Note corrigée saisie dans le système *</label>
                      <input
                        type="number" min="0" max="20" step="0.25"
                        className="input-field"
                        placeholder="Note mise à jour (ex: 13.50)"
                        value={noteCorrigee}
                        onChange={(e) => setNoteCorrigee(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="label">Commentaire de confirmation</label>
                    <textarea
                      className="input-field resize-none" rows={2}
                      placeholder="Ex: Nom modifié dans le système le 15/01/2025..."
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleModifier(r)}
                      disabled={actionLoading || (r.type === 'CONTESTATION_NOTE' && !r.contestationNote?.noteCorrigee && !noteCorrigee)}
                      className="btn-success"
                    >
                      {actionLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                          En cours...
                        </span>
                      ) : '✓ Confirmer — Clôturer la requête'}
                    </button>
                    <button onClick={() => setSelected(null)} className="btn-secondary">Annuler</button>
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
