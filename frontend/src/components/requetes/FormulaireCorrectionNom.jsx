import { useState } from 'react';
import requeteService from '../../services/requeteService';
import DocumentUploadSection from './DocumentUploadSection';
import api from '../../services/api';

// Correction 1 : 2 documents obligatoires pour une correction de nom
const DOCS_REQUIS = [
  { typeDoc: 'QUITUS', label: 'Quitus de l\'année en cours',  required: true },
  { typeDoc: 'LETTRE', label: 'Lettre adressée au Directeur', required: true },
];

export default function FormulaireCorrectionNom({ onSuccess }) {
  const [form, setForm] = useState({
    ancienNom: '', nouveauNom: '', description: '',
    // priorite : fixée NORMALE côté serveur
  });
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDocChange = (file, typeDoc) => setDocuments((p) => ({ ...p, [typeDoc]: file }));
  const handleDocRemove = (typeDoc) => setDocuments((p) => { const n = { ...p }; delete n[typeDoc]; return n; });

  const docsManquants = DOCS_REQUIS.filter((d) => d.required && !documents[d.typeDoc]);
  const peutSoumettre = docsManquants.length === 0 && form.ancienNom && form.nouveauNom;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!peutSoumettre) return;
    setLoading(true);
    setError(null);
    try {
      const requete = await requeteService.creerCorrectionNom({
        ancienNom: form.ancienNom,
        nouveauNom: form.nouveauNom,
        description: form.description,
      });

      for (const [typeDoc, file] of Object.entries(documents)) {
        if (!file) continue;
        const fd = new FormData();
        fd.append('fichier', file);
        fd.append('requete_id', requete.id);
        fd.append('type', typeDoc);
        await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      onSuccess?.(requete);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Nom actuel (incorrect) *</label>
          <input
            className="input-field" placeholder="Nom incorrect dans le système"
            value={form.ancienNom}
            onChange={(e) => setForm({ ...form, ancienNom: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Nom correct souhaité *</label>
          <input
            className="input-field" placeholder="Nom correct"
            value={form.nouveauNom}
            onChange={(e) => setForm({ ...form, nouveauNom: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Description / Précisions</label>
        <textarea
          className="input-field resize-none" rows={3}
          placeholder="Expliquez l'erreur constatée..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* Documents requis */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800">
            Pièces justificatives <span className="text-red-500">*</span>
          </label>
          {docsManquants.length > 0 ? (
            <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              {docsManquants.length} document(s) manquant(s)
            </span>
          ) : (
            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              ✅ Tous les documents fournis
            </span>
          )}
        </div>
        <div className="space-y-2.5">
          {DOCS_REQUIS.map((doc) => (
            <DocumentUploadSection
              key={doc.typeDoc}
              label={doc.label}
              typeDoc={doc.typeDoc}
              required={doc.required}
              optional={!doc.required}
              file={documents[doc.typeDoc] || null}
              onChange={handleDocChange}
              onRemove={handleDocRemove}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || !peutSoumettre}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Soumission en cours...' : 'Soumettre la demande'}
        </button>
        {!peutSoumettre && docsManquants.length > 0 && (
          <p className="text-xs text-orange-500 text-center mt-2">
            ⚠️ Veuillez joindre tous les documents obligatoires avant de soumettre
          </p>
        )}
      </div>
    </form>
  );
}
