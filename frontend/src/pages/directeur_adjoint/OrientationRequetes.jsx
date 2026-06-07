import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import requeteService from '../../services/requeteService';
import { formatDateTime, getStatutClass, getStatutLabel } from '../../utils/helpers';
import { PeriodSelector, usePeriodFilter } from '../../hooks/usePeriodFilter';
import DocumentsPanel from '../../components/common/DocumentsPanel';
import Toast, { useToast } from '../../components/common/Toast';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

const ONGLETS = ['À orienter', 'Historique'];

export default function OrientationRequetes() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);
  const { toast, showToast, clearToast } = useToast();

  const [onglet, setOnglet] = useState(0); // 0 = À orienter, 1 = Historique
  const [selected, setSelected] = useState(null);
  const [service, setService] = useState('DEPARTEMENT');
  const [motif, setMotif] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [expandDocs, setExpandDocs] = useState({});

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  // Correction 6 : À orienter = ATTESTATION EN_COURS sans serviceTraitant
  // Le secrétariat les transmet en EN_COURS, le Dir Adj doit les orienter
  const aOrienter = filtree.filter(
    (r) => r.type === 'ATTESTATION'
      && r.statut === 'EN_COURS'
      && !r.attestation?.serviceTraitant
  );

  // Historique = ATTESTATION déjà orientées (serviceTraitant renseigné) ou terminées
  const historique = filtree.filter(
    (r) => r.type === 'ATTESTATION'
      && (r.attestation?.serviceTraitant || ['VALIDEE', 'REJETEE', 'CLOTUREE'].includes(r.statut))
  );

  const handleOrienter = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await requeteService.orienterAttestation(
        selected.id,
        service,
        motif || `Orienté vers : ${service === 'DEPARTEMENT' ? 'le Département' : 'la Scolarité'}`
      );
      const labelService = service === 'DEPARTEMENT' ? 'Département' : 'Scolarité';
      showToast(`✅ Requête orientée vers le ${labelService} avec succès.`);
      setSelected(null);
      setMotif('');
      setOnglet(1); // basculer sur historique
      dispatch(fetchRequetes()); // refresh immédiat
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
      // Recharger même en cas d'erreur : si la requête était déjà orientée,
      // la liste "À orienter" doit se mettre à jour immédiatement
      dispatch(fetchRequetes());
    } finally {
      setActionLoading(false);
    }
  };

  const SERVICE_LABEL = { DEPARTEMENT: 'Département', SCOLARITE: 'Scolarité' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {toast && <Toast {...toast} onDismiss={clearToast} />}

      <div className="flex-1 flex flex-col">
        <Navbar title="Attestations — Orientation" />
        <main className="flex-1 p-6 space-y-4">

          {/* En-tête avec onglets */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {ONGLETS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setOnglet(i)}
                  className={`px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                    onglet === i
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i === 0 ? '📤' : '📋'}
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    onglet === i ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {i === 0 ? aOrienter.length : historique.length}
                  </span>
                </button>
              ))}
            </div>
            <PeriodSelector
              periode={periode}
              onChange={setPeriode}
              onRefresh={() => dispatch(fetchRequetes())}
              loading={loading}
            />
          </div>

          {/* ── Onglet 0 : À orienter ── */}
          {onglet === 0 && (
            <>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : aOrienter.length === 0 ? (
                <div className="card text-center py-16 text-gray-400">
                  <p className="text-5xl mb-3">✅</p>
                  <p>Aucune attestation à orienter sur cette période</p>
                  <button
                    onClick={() => setOnglet(1)}
                    className="text-blue-500 text-sm hover:underline mt-2 inline-block"
                  >
                    Voir l'historique →
                  </button>
                </div>
              ) : (
                aOrienter.map((r) => (
                  <div key={r.id} className="card space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800">
                          {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                        </p>
                        <p className="text-xs text-gray-400">
                          <span className="font-mono">{r.etudiant?.matricule}</span>
                          {' · '}{r.etudiant?.filiere}{' · '}{r.etudiant?.niveau}
                          {' · '}{formatDateTime(r.dateDepot)}
                        </p>
                        {r.attestation && (
                          <p className="text-sm mt-1.5 text-blue-700 font-medium">
                            {r.attestation.typeAttestation} · {r.attestation.anneeAcademique} · {r.attestation.nombreExemplaires} ex.
                          </p>
                        )}
                        {r.description && (
                          <p className="text-xs text-gray-500 mt-1 italic">« {r.description} »</p>
                        )}

                        {/* DocumentsPanel visible pour Dir Adjoint (Correction 6) */}
                        <button
                          onClick={() => setExpandDocs((p) => ({ ...p, [r.id]: !p[r.id] }))}
                          className="text-xs text-blue-500 hover:underline mt-2"
                        >
                          📎 {r.documents?.length || 0} document(s) {expandDocs[r.id] ? '▲ Masquer' : '▼ Consulter'}
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
                            to={`/directeur-adjoint/requete/${r.id}`}
                            className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            👁 Détail
                          </Link>
                          <button
                            onClick={() => { setSelected(r); setService('DEPARTEMENT'); setMotif(''); }}
                            className="btn-primary text-sm"
                          >
                            🔄 Orienter
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Panel d'orientation */}
                    {selected?.id === r.id && (
                      <div className="border-t border-blue-100 pt-4 -mx-6 px-6 pb-4 bg-blue-50/30 rounded-b-xl space-y-3">
                        <p className="text-sm font-semibold text-blue-700">Orienter cette demande vers :</p>

                        <div className="flex gap-3">
                          {[
                            ['DEPARTEMENT', '🏢 Responsable Département', 'Pour analyse académique ou cas complexe'],
                            ['SCOLARITE', '📚 Service Scolarité', 'Pour traitement administratif standard'],
                          ].map(([val, label, desc]) => (
                            <label
                              key={val}
                              className={`flex-1 flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                                service === val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input type="radio" value={val} checked={service === val} onChange={() => setService(val)} />
                                <span className="text-sm font-medium">{label}</span>
                              </div>
                              <p className="text-xs text-gray-400 ml-5">{desc}</p>
                            </label>
                          ))}
                        </div>

                        <div>
                          <label className="label">Commentaire (optionnel)</label>
                          <textarea
                            className="input-field resize-none" rows={2}
                            placeholder="Instructions pour le service destinataire..."
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleOrienter}
                            disabled={actionLoading}
                            className="btn-primary"
                          >
                            {actionLoading ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                En cours...
                              </span>
                            ) : `✓ Orienter vers ${SERVICE_LABEL[service]}`}
                          </button>
                          <button onClick={() => setSelected(null)} className="btn-secondary">Annuler</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {/* ── Onglet 1 : Historique ── */}
          {onglet === 1 && (
            <>
              {historique.length === 0 ? (
                <div className="card text-center py-16 text-gray-400">
                  <p className="text-5xl mb-3">📋</p>
                  <p>Aucune requête orientée sur cette période</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historique.map((r) => {
                    const orientation = r.historique?.find((h) =>
                      h.motif?.toLowerCase().includes('orient')
                    );
                    return (
                      <div key={r.id} className="card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800">
                              {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                            </p>
                            <p className="text-xs text-gray-400">
                              <span className="font-mono">{r.etudiant?.matricule}</span>
                              {' · '}{formatDateTime(r.dateDepot)}
                            </p>
                            {r.attestation && (
                              <p className="text-sm mt-1 text-blue-700">
                                {r.attestation.typeAttestation}
                              </p>
                            )}

                            {/* Service d'orientation */}
                            {r.attestation?.serviceTraitant && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                                  Orienté → {SERVICE_LABEL[r.attestation.serviceTraitant]}
                                </span>
                                {orientation && (
                                  <span className="text-xs text-gray-400">
                                    {formatDateTime(orientation.dateChangement)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                            <Link
                              to={`/directeur-adjoint/requete/${r.id}`}
                              className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              👁 Voir détails
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
