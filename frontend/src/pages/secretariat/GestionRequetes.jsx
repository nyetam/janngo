import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDateTime } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import requeteService from '../../services/requeteService';
import { PeriodSelector, usePeriodFilter } from '../../hooks/usePeriodFilter';
import DocumentsPanel from '../../components/common/DocumentsPanel';
import Toast, { useToast } from '../../components/common/Toast';
import Layout from '../../components/common/Layout';

export default function GestionRequetes() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  const [selected, setSelected] = useState(null);
  const [motif, setMotif] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();
  const [expandDocs, setExpandDocs] = useState({});

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const aTraiter = filtree.filter((r) => r.statut === 'EN_ATTENTE');

  const handleTransmettre = async (r) => {
    setActionLoading(true);
    try {
      if (r.type === 'ATTESTATION') {
        await requeteService.transmettreAttestation(r.id, motif);
      } else if (r.type === 'CORRECTION_NOM') {
        await requeteService.transmettreCorrectionNom(r.id, motif);
      }
      const dest = r.type === 'ATTESTATION' ? 'Directeur Adjoint' : 'Directeur';
      showToast(`Requête transmise au ${dest} avec succès.`, 'success');
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
    <Layout title="Gestion des requêtes">
      {toast && <Toast {...toast} onDismiss={clearToast} />}
      <main className="flex-1 p-4 md:p-6 space-y-4">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-gray-800">Requêtes à traiter</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {aTraiter.length} requête(s) en attente sur la période sélectionnée
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
        ) : aTraiter.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">✅</p>
            <p>Aucune requête en attente sur cette période</p>
            <Link to="/secretariat" className="text-blue-500 text-sm hover:underline mt-2 inline-block">
              ← Retour au tableau de bord
            </Link>
          </div>
        ) : (
          aTraiter.map((r) => (
            <div key={r.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex gap-3 items-start min-w-0">
                  <span className="text-3xl flex-shrink-0">{TYPES_REQUETE[r.type]?.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{TYPES_REQUETE[r.type]?.label}</p>
                    <p className="text-sm text-gray-500">
                      {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                      {' · '}
                      <span className="font-mono text-xs">{r.etudiant?.matricule}</span>
                    </p>
                    <p className="text-xs text-gray-400">{formatDateTime(r.dateDepot)}</p>

                    {r.correctionNom && (
                      <p className="text-sm mt-1.5 text-orange-600">
                        <span className="line-through">{r.correctionNom.ancienNom}</span>
                        {' → '}
                        <strong>{r.correctionNom.nouveauNom}</strong>
                      </p>
                    )}
                    {r.attestation && (
                      <p className="text-sm mt-1.5 text-blue-600">
                        {r.attestation.typeAttestation} · {r.attestation.anneeAcademique} · {r.attestation.nombreExemplaires} ex.
                      </p>
                    )}
                    {r.description && (
                      <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">« {r.description} »</p>
                    )}

                    <button
                      onClick={() => setExpandDocs((p) => ({ ...p, [r.id]: !p[r.id] }))}
                      className="text-xs text-blue-500 hover:underline mt-1.5"
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
                  <div className="flex gap-2">
                    <Link
                      to={`/secretariat/requete/${r.id}`}
                      className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      👁 Détail
                    </Link>
                    <button
                      onClick={() => { setSelected(r); setMotif(''); }}
                      className="btn-primary text-sm"
                    >
                      📤 Transmettre
                    </button>
                  </div>
                </div>
              </div>

              {selected?.id === r.id && (
                <div className="border-t border-blue-100 bg-blue-50/30 -mx-6 px-6 py-4 rounded-b-xl space-y-3">
                  <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                    <span>📤</span>
                    <span>
                      Transmettre à : <strong>
                        {r.type === 'ATTESTATION' ? 'Directeur Adjoint' : 'Directeur'}
                      </strong>
                    </span>
                  </div>
                  <div>
                    <label className="label">Commentaire (optionnel)</label>
                    <textarea
                      className="input-field resize-none" rows={2}
                      placeholder="Observations ou remarques sur le dossier..."
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleTransmettre(r)}
                      disabled={actionLoading}
                      className="btn-primary"
                    >
                      {actionLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                          En cours...
                        </span>
                      ) : '✓ Confirmer la transmission'}
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
