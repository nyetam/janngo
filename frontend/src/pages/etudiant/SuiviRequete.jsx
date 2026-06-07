import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import requeteService from '../../services/requeteService';
import { getStatutClass, getStatutLabel, formatDateTime } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Chatbot from '../../components/common/Chatbot';
import api from '../../services/api';

// Types de documents par type de requête (Correction 1)
const TYPES_DOCS = {
  ATTESTATION:       ['QUITUS', 'PROFIL', 'CNI', 'LETTRE'],
  CORRECTION_NOM:    ['QUITUS', 'LETTRE'],
  CONTESTATION_NOTE: ['FICHE_REQUETE', 'COPIE_NOTE'],
};

const LABEL_DOC = {
  QUITUS: 'Quitus', PROFIL: 'Profil étudiant', CNI: 'CNI',
  LETTRE: 'Lettre au Directeur', FICHE_REQUETE: 'Fiche de requête',
  COPIE_NOTE: 'Feuille de note', AUTRE: 'Autre',
};

// Optionnel par type de requête
const DOC_OPTIONNEL = { COPIE_NOTE: true };

export default function SuiviRequete() {
  const { id } = useParams();
  const [requete, setRequete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [uploadMsg, setUploadMsg] = useState(null);

  const charger = async () => {
    try {
      const r = await requeteService.detail(id);
      setRequete(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, [id]);

  // Correction 4 : autoriser upload seulement si EN_ATTENTE OU doc rejeté
  const peutUploader = (typeDoc) => {
    if (!requete) return false;
    if (requete.statut === 'EN_ATTENTE') return true;
    const docExistant = requete.documents?.find((d) => d.type === typeDoc);
    // Seulement si explicitement rejeté par le personnel (valide=false)
    return docExistant && !docExistant.valide;
  };

  const ouvrirDocument = (docId) => {
    const token = localStorage.getItem('janngo_token');
    fetch(`/api/documents/${docId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => window.open(URL.createObjectURL(blob), '_blank'))
      .catch(() => alert('Impossible d\'ouvrir ce document.'));
  };

  const handleUpload = async (e, typeDoc) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading((p) => ({ ...p, [typeDoc]: true }));
    setUploadMsg(null);
    const fd = new FormData();
    fd.append('fichier', file);
    fd.append('requete_id', id);
    fd.append('type', typeDoc);
    try {
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadMsg({ ok: true, text: 'Document remplacé avec succès !' });
      await charger();
    } catch (err) {
      setUploadMsg({ ok: false, text: err.response?.data?.message || 'Erreur lors de l\'upload' });
    } finally {
      setUploading((p) => ({ ...p, [typeDoc]: false }));
    }
    e.target.value = '';
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  if (!requete) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <p className="text-gray-500 mb-2">Requête introuvable</p>
          <Link to="/etudiant/mes-requetes" className="text-blue-600 hover:underline text-sm">← Retour</Link>
        </div>
      </div>
    </div>
  );

  const typesDocRequis = TYPES_DOCS[requete.type] || [];
  const docParType = {};
  requete.documents?.forEach((d) => { docParType[d.type] = d; });
  const isVerrouille = requete.statut !== 'EN_ATTENTE';
  const hasDocRejete = requete.documents?.some((d) => !d.valide);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Suivi de requête" />
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-5">
          <Link to="/etudiant/mes-requetes" className="text-sm text-blue-600 hover:underline">← Mes requêtes</Link>

          {/* En-tête */}
          <div className="card">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{TYPES_REQUETE[requete.type]?.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{TYPES_REQUETE[requete.type]?.label}</h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Requête #{requete.id} · {formatDateTime(requete.dateDepot)}
                  </p>
                </div>
              </div>
              <span className={`${getStatutClass(requete.statut)} text-sm px-3 py-1`}>
                {getStatutLabel(requete.statut)}
              </span>
            </div>
            {requete.description && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg italic">
                « {requete.description} »
              </p>
            )}
          </div>

          {/* Détails spécifiques */}
          {(requete.attestation || requete.correctionNom || requete.contestationNote) && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Détails de la demande</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {requete.attestation && <>
                  <div><dt className="text-gray-400 text-xs">Type</dt><dd className="font-medium">{requete.attestation.typeAttestation}</dd></div>
                  <div><dt className="text-gray-400 text-xs">Année</dt><dd className="font-medium">{requete.attestation.anneeAcademique}</dd></div>
                  <div><dt className="text-gray-400 text-xs">Exemplaires</dt><dd className="font-medium">{requete.attestation.nombreExemplaires}</dd></div>
                </>}
                {requete.correctionNom && <>
                  <div><dt className="text-gray-400 text-xs">Nom actuel</dt><dd className="font-medium text-red-500 line-through">{requete.correctionNom.ancienNom}</dd></div>
                  <div><dt className="text-gray-400 text-xs">Nom demandé</dt><dd className="font-medium text-green-600">{requete.correctionNom.nouveauNom}</dd></div>
                </>}
                {requete.contestationNote && <>
                  <div><dt className="text-gray-400 text-xs">Matière</dt><dd className="font-medium">{requete.contestationNote.matiere}</dd></div>
                  <div><dt className="text-gray-400 text-xs">Note contestée</dt><dd className="font-medium text-red-500 text-lg">{requete.contestationNote.noteContestee}/20</dd></div>
                  {requete.contestationNote.noteCorrigee != null && (
                    <div><dt className="text-gray-400 text-xs">Note corrigée</dt><dd className="font-medium text-green-600 text-lg">{requete.contestationNote.noteCorrigee}/20</dd></div>
                  )}
                </>}
              </dl>
            </div>
          )}

          {/* Documents */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Pièces justificatives</h3>
              {isVerrouille && hasDocRejete && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full animate-pulse">
                  ⚠ Des documents ont été rejetés — veuillez les remplacer
                </span>
              )}
              {isVerrouille && !hasDocRejete && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  🔒 Dossier en cours de traitement
                </span>
              )}
            </div>

            {uploadMsg && (
              <div className={`text-sm mb-3 p-3 rounded-lg border ${
                uploadMsg.ok
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {uploadMsg.text}
              </div>
            )}

            <div className="space-y-2.5">
              {typesDocRequis.map((typeDoc) => {
                const doc = docParType[typeDoc];
                const canUpload = peutUploader(typeDoc);
                const isUploading = uploading[typeDoc];
                const isOptional = DOC_OPTIONNEL[typeDoc];

                // Correction 3 : n'afficher un badge négatif QUE si rejeté (valide=false)
                const estRejete = doc && !doc.valide;
                const estPresent = doc && doc.valide;

                return (
                  <div
                    key={typeDoc}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-colors ${
                      estRejete    ? 'border-red-300 bg-red-50'
                      : estPresent ? 'border-green-200 bg-green-50'
                      : doc        ? 'border-blue-200 bg-blue-50' // présent mais non jugé encore
                      : 'border-dashed border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">
                        {estRejete ? '❌' : estPresent ? '✅' : doc ? '📎' : '⬜'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                          {LABEL_DOC[typeDoc]}
                          {isOptional && <span className="text-xs text-gray-400 italic font-normal">(optionnel)</span>}
                        </p>
                        {doc ? (
                          <>
                            <p className="text-xs text-gray-500 truncate max-w-xs" title={doc.nom}>{doc.nom}</p>
                            {/* Correction 3 : n'afficher le rejet QUE si valide=false */}
                            {estRejete && (
                              <p className="text-xs text-red-600 font-medium mt-0.5">
                                ❌ Document rejeté — veuillez le remplacer
                                {doc.motifRejet && ` · Motif : ${doc.motifRejet}`}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">
                            {isVerrouille ? 'Non fourni' : 'Aucun fichier sélectionné'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {doc && (
                        <button
                          onClick={() => ouvrirDocument(doc.id)}
                          className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          👁 Voir
                        </button>
                      )}

                      {/* Correction 4 : bouton remplacer SEULEMENT si rejeté */}
                      {canUpload && (
                        <label className={`text-xs border px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          isUploading
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : estRejete
                              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                              : requete.statut === 'EN_ATTENTE'
                                ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}>
                          {isUploading ? '...' : estRejete ? '🔄 Remplacer' : '📂 Choisir'}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleUpload(e, typeDoc)}
                            disabled={isUploading || (isVerrouille && !estRejete)}
                          />
                        </label>
                      )}

                      {isVerrouille && !canUpload && doc?.valide && (
                        <span className="text-xs text-gray-400 italic">Soumis</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historique */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Historique du traitement</h3>
            <div className="space-y-3">
              {(!requete.historique || requete.historique.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-4">Aucun historique disponible</p>
              )}
              {requete.historique?.map((h, i) => (
                <div key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    {i < requete.historique.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={getStatutClass(h.nouveauStatut)}>{getStatutLabel(h.nouveauStatut)}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(h.dateChangement)}</span>
                    </div>
                    {h.motif && <p className="text-sm text-gray-500 mt-1">{h.motif}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">Par : {h.changedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
