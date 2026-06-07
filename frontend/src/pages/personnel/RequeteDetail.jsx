/**
 * Page de détail d'une requête — commune à tous les rôles personnel.
 * Accessible via /secretariat/requete/:id, /directeur/requete/:id, etc.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import requeteService from '../../services/requeteService';
import { getStatutClass, getStatutLabel, formatDateTime } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import DocumentsPanel from '../../components/common/DocumentsPanel';

const RETOUR_PAR_ROLE = {
  SECRETAIRE: '/secretariat/requetes',
  DIRECTEUR: '/directeur/validation',
  DIR_ADJOINT: '/directeur-adjoint/orientation',
  RESP_DEPT: '/departement/traitement',
  SCOLARITE: '/scolarite/traitement',
  CELLULE_INFO: '/cellule-info/modifications',
};

export default function RequeteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur } = useSelector((s) => s.auth);
  const role = utilisateur?.role;

  const [requete, setRequete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const charger = () => {
    setLoading(true);
    requeteService.detail(id)
      .then(setRequete)
      .catch((err) => setError(err.response?.data?.message || 'Requête introuvable'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, [id]);

  const retour = RETOUR_PAR_ROLE[role] || '/';

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  if (error || !requete) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Détail requête" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-3">{error || 'Requête introuvable'}</p>
            <button onClick={() => navigate(retour)} className="btn-secondary">← Retour</button>
          </div>
        </div>
      </div>
    </div>
  );

  const etudiant = requete.etudiant;
  const util = etudiant?.utilisateur;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Détail de la requête" />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-5">
          {/* Navigation retour */}
          <button onClick={() => navigate(retour)} className="text-sm text-blue-600 hover:underline">
            ← Retour à la liste
          </button>

          {/* En-tête */}
          <div className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{TYPES_REQUETE[requete.type]?.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{TYPES_REQUETE[requete.type]?.label}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Requête #{requete.id} · Déposée le {formatDateTime(requete.dateDepot)}
                  </p>
                  {requete.priorite === 'URGENTE' && (
                    <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      ⚡ Urgente
                    </span>
                  )}
                </div>
              </div>
              <span className={`${getStatutClass(requete.statut)} text-sm px-3 py-1`}>
                {getStatutLabel(requete.statut)}
              </span>
            </div>

            {requete.description && (
              <p className="mt-4 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg italic">
                « {requete.description} »
              </p>
            )}
          </div>

          {/* Infos étudiant */}
          {etudiant && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Étudiant</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-gray-400 text-xs">Nom complet</dt><dd className="font-medium">{util?.prenom} {util?.nom}</dd></div>
                <div><dt className="text-gray-400 text-xs">Matricule</dt><dd className="font-medium">{etudiant.matricule}</dd></div>
                <div><dt className="text-gray-400 text-xs">Filière</dt><dd className="font-medium">{etudiant.filiere}</dd></div>
                <div><dt className="text-gray-400 text-xs">Niveau</dt><dd className="font-medium">{etudiant.niveau}</dd></div>
                <div><dt className="text-gray-400 text-xs">Email</dt><dd className="font-medium">{util?.email}</dd></div>
                <div><dt className="text-gray-400 text-xs">Statut étudiant</dt><dd className="font-medium">{etudiant.statut}</dd></div>
              </dl>
            </div>
          )}

          {/* Détails spécifiques au type */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Détails de la demande</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {requete.attestation && <>
                <div><dt className="text-gray-400 text-xs">Type attestation</dt><dd className="font-medium">{requete.attestation.typeAttestation}</dd></div>
                <div><dt className="text-gray-400 text-xs">Année académique</dt><dd className="font-medium">{requete.attestation.anneeAcademique}</dd></div>
                <div><dt className="text-gray-400 text-xs">Exemplaires</dt><dd className="font-medium">{requete.attestation.nombreExemplaires}</dd></div>
              </>}

              {requete.correctionNom && <>
                <div>
                  <dt className="text-gray-400 text-xs">Nom actuel (incorrect)</dt>
                  <dd className="font-medium text-red-500 line-through">{requete.correctionNom.ancienNom}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs">Nom demandé (correct)</dt>
                  <dd className="font-medium text-green-600">{requete.correctionNom.nouveauNom}</dd>
                </div>
              </>}

              {requete.contestationNote && <>
                <div><dt className="text-gray-400 text-xs">Matière</dt><dd className="font-medium">{requete.contestationNote.matiere}</dd></div>
                <div>
                  <dt className="text-gray-400 text-xs">Note contestée</dt>
                  <dd className="font-medium text-red-500 text-lg">{requete.contestationNote.noteContestee}/20</dd>
                </div>
                {requete.contestationNote.noteCorrigee != null && (
                  <div>
                    <dt className="text-gray-400 text-xs">Note corrigée validée</dt>
                    <dd className="font-medium text-green-600 text-lg">{requete.contestationNote.noteCorrigee}/20</dd>
                  </div>
                )}
                <div className="col-span-2">
                  <dt className="text-gray-400 text-xs">Motif de contestation</dt>
                  <dd className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">{requete.contestationNote.motifContestation}</dd>
                </div>
                {requete.contestationNote.decisionDepartement && (
                  <div className="col-span-2">
                    <dt className="text-gray-400 text-xs">Décision département</dt>
                    <dd className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">{requete.contestationNote.decisionDepartement}</dd>
                  </div>
                )}
              </>}
            </dl>
          </div>

          {/* Documents */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">
              Documents joints
              <span className="ml-2 text-sm font-normal text-gray-400">({requete.documents?.length || 0})</span>
            </h3>
            <DocumentsPanel
              documents={requete.documents || []}
              onDocumentUpdated={charger}
            />
          </div>

          {/* Historique */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Historique du traitement</h3>
            <div className="space-y-3">
              {requete.historique?.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Aucun historique</p>
              )}
              {requete.historique?.map((h, i) => (
                <div key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    {i < (requete.historique?.length ?? 0) - 1 && (
                      <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={getStatutClass(h.nouveauStatut)}>{getStatutLabel(h.nouveauStatut)}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(h.dateChangement)}</span>
                    </div>
                    {h.motif && <p className="text-sm text-gray-600 mt-1">{h.motif}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">Par : {h.changedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traitements */}
          {requete.traitements?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Journal des traitements</h3>
              <div className="space-y-2">
                {requete.traitements.map((t) => (
                  <div key={t.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-gray-700">{t.etape}</p>
                      {t.commentaire && <p className="text-gray-500 text-xs mt-0.5">{t.commentaire}</p>}
                      <p className="text-gray-400 text-xs mt-0.5">
                        {t.personnel?.utilisateur?.prenom} {t.personnel?.utilisateur?.nom} · {formatDateTime(t.dateTraitement)}
                      </p>
                    </div>
                    {t.decision && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.decision === 'APPROUVE' ? 'bg-green-100 text-green-700'
                        : t.decision === 'REJETE' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t.decision}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
