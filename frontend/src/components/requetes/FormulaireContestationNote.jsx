import { useState } from 'react';
import requeteService from '../../services/requeteService';
import DocumentUploadSection from './DocumentUploadSection';
import api from '../../services/api';

// Correction 1 : fiche de requête obligatoire, feuille de note optionnelle
const DOCS_REQUIS = [
  { typeDoc: 'FICHE_REQUETE', label: 'Fiche de requête complétée et signée', required: true, optional: false },
  { typeDoc: 'COPIE_NOTE',    label: 'Feuille de note',                       required: false, optional: true },
];

export default function FormulaireContestationNote({ onSuccess }) {
  const [form, setForm] = useState({
    matiere: '', noteContestee: '', motifContestation: '', description: '',
    // priorite fixée NORMALE côté serveur
  });
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDocChange = (file, typeDoc) => setDocuments((p) => ({ ...p, [typeDoc]: file }));
  const handleDocRemove = (typeDoc) => setDocuments((p) => { const n = { ...p }; delete n[typeDoc]; return n; });

  // Correction 2 : seule la fiche de requête est obligatoire
  const docsManquants = DOCS_REQUIS.filter((d) => d.required && !documents[d.typeDoc]);
  const peutSoumettre = docsManquants.length === 0 && form.matiere && form.noteContestee && form.motifContestation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!peutSoumettre) return;
    setLoading(true);
    setError(null);
    try {
      const requete = await requeteService.creerContestationNote({
        matiere: form.matiere,
        noteContestee: parseFloat(form.noteContestee),
        motifContestation: form.motifContestation,
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
          <label className="label">Matière concernée *</label>
          <input
            className="input-field" placeholder="Ex: Mathématiques Discrètes"
            value={form.matiere}
            onChange={(e) => setForm({ ...form, matiere: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Note contestée *</label>
          <input
            type="number" min="0" max="20" step="0.25"
            className="input-field" placeholder="Ex: 8.50"
            value={form.noteContestee}
            onChange={(e) => setForm({ ...form, noteContestee: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Motif de la contestation *</label>
        <textarea
          className="input-field resize-none" rows={4}
          placeholder="Expliquez précisément pourquoi vous contestez cette note..."
          value={form.motifContestation}
          onChange={(e) => setForm({ ...form, motifContestation: e.target.value })}
          required
        />
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800">
            Pièces justificatives
          </label>
          {docsManquants.length > 0 ? (
            <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              Fiche de requête manquante
            </span>
          ) : (
            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              ✅ Document obligatoire fourni
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
              optional={doc.optional}
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
          {loading ? 'Soumission en cours...' : 'Soumettre la contestation'}
        </button>
        {!peutSoumettre && docsManquants.length > 0 && (
          <p className="text-xs text-orange-500 text-center mt-2">
            ⚠️ La fiche de requête est obligatoire avant de soumettre
          </p>
        )}
      </div>
    </form>
  );
}
