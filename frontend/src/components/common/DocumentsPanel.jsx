/**
 * DocumentsPanel — côté personnel administratif.
 * - Ouvrir un document dans un nouvel onglet
 * - Valider / Invalider avec motif obligatoire (Correction 5)
 * - Révalider un document rejeté
 */
import { useState } from 'react';
import api from '../../services/api';
import { formatDate, formatFileSize } from '../../utils/helpers';

const TYPE_LABELS = {
  QUITUS: 'Quitus', CNI: 'CNI', LETTRE: 'Lettre au Directeur',
  PROFIL: 'Profil étudiant', FICHE_REQUETE: 'Fiche de requête',
  COPIE_NOTE: 'Copie note / Feuille de note', AUTRE: 'Autre',
};

// Modal interne pour saisir le motif de rejet
function ModalRejet({ doc, onConfirm, onCancel }) {
  const [motif, setMotif] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
        <h3 className="font-semibold text-gray-800">❌ Rejeter le document</h3>
        <p className="text-sm text-gray-500">
          Document : <strong>{doc.nom}</strong>
        </p>
        <div>
          <label className="label">Motif du rejet <span className="text-red-500">*</span></label>
          <textarea
            className="input-field resize-none" rows={3}
            placeholder="Ex: Document illisible, mauvaise pièce, signature manquante..."
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => motif.trim() && onConfirm(motif.trim())}
            disabled={!motif.trim()}
            className="btn-danger flex-1 disabled:opacity-50"
          >
            Confirmer le rejet
          </button>
          <button onClick={onCancel} className="btn-secondary flex-1">Annuler</button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPanel({ documents = [], onDocumentUpdated }) {
  const [loading, setLoading]       = useState({});
  const [rejetModal, setRejetModal] = useState(null); // doc en cours de rejet

  const ouvrirDocument = (doc) => {
    const token = localStorage.getItem('janngo_token');
    setLoading((p) => ({ ...p, [doc.id]: 'open' }));
    fetch(`/api/documents/${doc.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        window.open(URL.createObjectURL(blob), '_blank');
        setLoading((p) => ({ ...p, [doc.id]: null }));
      })
      .catch(() => {
        alert('Impossible d\'ouvrir ce document.');
        setLoading((p) => ({ ...p, [doc.id]: null }));
      });
  };

  const valider = async (doc) => {
    setLoading((p) => ({ ...p, [doc.id]: 'validate' }));
    try {
      await api.patch(`/documents/${doc.id}/valider`, { valide: true });
      onDocumentUpdated?.();
    } catch { alert('Erreur lors de la validation.'); }
    finally { setLoading((p) => ({ ...p, [doc.id]: null })); }
  };

  const rejeter = async (doc, motifRejet) => {
    setRejetModal(null);
    setLoading((p) => ({ ...p, [doc.id]: 'validate' }));
    try {
      await api.patch(`/documents/${doc.id}/valider`, { valide: false, motifRejet });
      onDocumentUpdated?.();
    } catch { alert('Erreur lors du rejet.'); }
    finally { setLoading((p) => ({ ...p, [doc.id]: null })); }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-5 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-2xl mb-1">📎</p>
        <p className="text-sm">Aucun document joint</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal de rejet */}
      {rejetModal && (
        <ModalRejet
          doc={rejetModal}
          onConfirm={(motif) => rejeter(rejetModal, motif)}
          onCancel={() => setRejetModal(null)}
        />
      )}

      <div className="space-y-2">
        {documents.map((doc) => {
          const isLoading = !!loading[doc.id];
          return (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                !doc.valide
                  ? 'border-red-200 bg-red-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              {/* Infos doc */}
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {doc.valide ? '✅' : '❌'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate" title={doc.nom}>
                    {doc.nom}
                  </p>
                  <p className="text-xs text-gray-400">
                    {TYPE_LABELS[doc.type] || doc.type}
                    {doc.taille ? ` · ${formatFileSize(doc.taille)}` : ''}
                    {doc.dateUpload ? ` · ${formatDate(doc.dateUpload)}` : ''}
                  </p>
                  {/* Motif de rejet */}
                  {!doc.valide && doc.motifRejet && (
                    <p className="text-xs text-red-600 mt-0.5 italic">
                      Motif : {doc.motifRejet}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                {/* Ouvrir */}
                <button
                  onClick={() => ouvrirDocument(doc)}
                  disabled={isLoading}
                  className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  title="Ouvrir dans un nouvel onglet"
                >
                  {loading[doc.id] === 'open' ? '...' : '👁 Voir'}
                </button>

                {/* Valider / Invalider */}
                {doc.valide ? (
                  <button
                    onClick={() => setRejetModal(doc)}
                    disabled={isLoading}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Rejeter ce document"
                  >
                    {loading[doc.id] === 'validate' ? '...' : '✗ Invalider'}
                  </button>
                ) : (
                  <button
                    onClick={() => valider(doc)}
                    disabled={isLoading}
                    className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    title="Révalider ce document"
                  >
                    {loading[doc.id] === 'validate' ? '...' : '✓ Révalider'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
