import { useState } from 'react';
import requeteService from '../../services/requeteService';
import DocumentUploadSection from './DocumentUploadSection';
import api from '../../services/api';

const TYPES_ATTESTATION = [
  'Certificat de scolarité', 'Attestation de diplôme', 'Relevé de notes',
  'Attestation de réussite', 'Diplôme original', 'Autre',
];

// Correction 1 : 4 documents obligatoires pour une attestation
const DOCS_REQUIS = [
  { typeDoc: 'QUITUS',  label: 'Quitus de l\'année en cours',    required: true },
  { typeDoc: 'PROFIL',  label: 'Profil étudiant imprimé',         required: true },
  { typeDoc: 'CNI',     label: 'Copie de la CNI',                 required: true },
  { typeDoc: 'LETTRE',  label: 'Lettre adressée au Directeur',    required: true },
];

export default function FormulaireAttestation({ onSuccess }) {
  const [form, setForm] = useState({
    typeAttestation: '', anneeAcademique: '', nombreExemplaires: 1, description: '',
    // priorite : fixée NORMALE côté serveur, non exposée
  });
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDocChange  = (file, typeDoc) => setDocuments((p) => ({ ...p, [typeDoc]: file }));
  const handleDocRemove  = (typeDoc) => setDocuments((p) => { const n = { ...p }; delete n[typeDoc]; return n; });

  // Correction 2 : tous les docs obligatoires doivent être présents
  const docsManquants = DOCS_REQUIS.filter((d) => d.required && !documents[d.typeDoc]);
  const peutSoumettre = docsManquants.length === 0 && form.typeAttestation && form.anneeAcademique;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!peutSoumettre) return;
    setLoading(true);
    setError(null);
    try {
      const requete = await requeteService.creerAttestation({
        typeAttestation: form.typeAttestation,
        anneeAcademique: form.anneeAcademique,
        nombreExemplaires: form.nombreExemplaires,
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
      <div>
        <label className="label">Type d'attestation *</label>
        <select
          className="input-field"
          value={form.typeAttestation}
          onChange={(e) => setForm({ ...form, typeAttestation: e.target.value })}
          required
        >
          <option value="">Sélectionner...</option>
          {TYPES_ATTESTATION.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Année académique *</label>
          <input
            className="input-field" placeholder="Ex: 2024-2025"
            value={form.anneeAcademique}
            onChange={(e) => setForm({ ...form, anneeAcademique: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Nombre d'exemplaires</label>
          <input
            type="number" min="1" max="5" className="input-field"
            value={form.nombreExemplaires}
            onChange={(e) => setForm({ ...form, nombreExemplaires: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div>
        <label className="label">Motif / Description</label>
        <textarea
          className="input-field resize-none" rows={2}
          placeholder="Précisez le motif de votre demande..."
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

      {/* Correction 2 : bouton désactivé si docs manquants */}
      <div>
        <button
          type="submit"
          disabled={loading || !peutSoumettre}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Soumission en cours...
            </span>
          ) : 'Soumettre la demande'}
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
