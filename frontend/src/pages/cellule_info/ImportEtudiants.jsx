import { useState, useRef, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../services/api';

function telechargerModele() {
  const lignes = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', 'NIVEAU D\'ETUDE', '', '', 'LICENCE 3'],
    ['', 'ANNEE ACADEMIQUE', '', '', '2025/2026'],
    ['', 'FILIERE', '', '', 'Informatique'],
    ['', '', '', '', ''],
    ['', 'N°', 'MATRICULE', 'NOMS & PRENOMS', 'PASSWORD'],
    ['', '1', '25I01001', 'DIALLO AMADOU', 'Pass1234'],
    ['', '2', '25I01002', 'SOW FATOUMATA AMINATA', 'Pass5678'],
  ];
  const csvContent = lignes.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modele_import_etudiants.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exporterRapportCSV(rapport) {
  const entetes = ['MATRICULE', 'ACTION', 'NOM_COMPLET', 'EMAIL', 'STATUT'];
  const lignesOK = rapport.details.map((d) => [d.matricule, d.action, d.nom || '', d.email || '', 'OK']);
  const lignesErr = rapport.details_erreurs.map((d) => [d.matricule, 'ERREUR', '', '', d.raison]);
  const toutes = [entetes, ...lignesOK, ...lignesErr];
  const csvContent = toutes.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport_import_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ETAPES = { UPLOAD: 'UPLOAD', APERCU: 'APERCU', RAPPORT: 'RAPPORT' };

export default function ImportEtudiants() {
  const [etape, setEtape] = useState(ETAPES.UPLOAD);
  const [fichier, setFichier] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [apercu, setApercu] = useState(null);
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [progression, setProgression] = useState(null);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) traiterFichier(f);
  }, []);

  const traiterFichier = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xls', 'xlsx'].includes(ext)) {
      setErreur('Seuls les fichiers Excel (.xls, .xlsx) sont acceptés.');
      return;
    }
    setFichier(f);
    setErreur(null);
    lancerPreview(f);
  };

  const lancerPreview = async (f) => {
    setLoading(true);
    setErreur(null);
    try {
      const fd = new FormData();
      fd.append('fichier', f);
      const { data } = await api.post('/admin/preview-excel', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApercu(data);
      setEtape(ETAPES.APERCU);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de lecture du fichier.');
    } finally {
      setLoading(false);
    }
  };

  const lancerImport = async () => {
    setLoading(true);
    setErreur(null);
    const rapportCumule = { total: apercu.total, crees: 0, mis_a_jour: 0, erreurs: 0, details: [], details_erreurs: [] };
    setProgression({ traites: 0, total: apercu.total });
    try {
      let hasMore = true;
      let offset  = 0;
      while (hasMore) {
        const fd = new FormData();
        fd.append('fichier', fichier);
        fd.append('offset', String(offset));
        const { data } = await api.post('/admin/import-etudiants', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 0,
        });
        rapportCumule.crees      += data.crees      || 0;
        rapportCumule.mis_a_jour += data.mis_a_jour || 0;
        rapportCumule.erreurs    += data.erreurs    || 0;
        rapportCumule.details.push(...(data.details || []));
        rapportCumule.details_erreurs.push(...(data.details_erreurs || []));
        const traites = rapportCumule.crees + rapportCumule.mis_a_jour + rapportCumule.erreurs;
        setProgression({ traites, total: data.total || apercu.total });
        hasMore = data.hasMore;
        offset  = data.nextOffset;
      }
      setRapport(rapportCumule);
      setEtape(ETAPES.RAPPORT);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'import.');
    } finally {
      setLoading(false);
      setProgression(null);
    }
  };

  const recommencer = () => {
    setEtape(ETAPES.UPLOAD);
    setFichier(null);
    setApercu(null);
    setRapport(null);
    setErreur(null);
    setProgression(null);
  };

  return (
    <Layout title="Import des étudiants">
      <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {[
            { key: ETAPES.UPLOAD, label: '1. Fichier', icon: '📁' },
            { key: ETAPES.APERCU, label: '2. Aperçu', icon: '👁' },
            { key: ETAPES.RAPPORT, label: '3. Rapport', icon: '📊' },
          ].map((e, i, arr) => (
            <div key={e.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
                etape === e.key
                  ? 'bg-blue-600 text-white shadow'
                  : (arr.findIndex((x) => x.key === etape) > i)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                <span>{e.icon}</span>
                <span className="hidden sm:inline">{e.label}</span>
              </div>
              {i < arr.length - 1 && <span className="text-gray-300 text-lg">→</span>}
            </div>
          ))}
        </div>

        {/* ── ÉTAPE 1 : Upload ── */}
        {etape === ETAPES.UPLOAD && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-1">Import de la liste de classe Excel</h2>
              <p className="text-sm text-gray-500">
                Importez le fichier Excel fourni par l'IUT. Toutes les feuilles seront traitées automatiquement.
              </p>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".xls,.xlsx"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) traiterFichier(f); e.target.value = ''; }}
              />
              <div className="text-6xl mb-4">{dragOver ? '📂' : '📥'}</div>
              <p className="text-lg font-semibold text-gray-700">
                {dragOver ? 'Déposez le fichier ici' : 'Glissez votre fichier Excel ici'}
              </p>
              <p className="text-sm text-gray-400 mt-2">ou cliquez pour parcourir</p>
              <p className="text-xs text-gray-300 mt-3">Formats acceptés : .xls, .xlsx · Taille max : 20 MB</p>
            </div>

            {loading && (
              <div className="card flex items-center gap-3 text-blue-600">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0" />
                <p className="text-sm">Lecture du fichier en cours...</p>
              </div>
            )}

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">⚠ {erreur}</div>
            )}

            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 text-sm">📋 Format du fichier attendu</h3>
              <div className="text-xs text-blue-700 space-y-1.5">
                <p>• <strong>Ligne 6, col E</strong> : Niveau d'étude (ex: LICENCE 3)</p>
                <p>• <strong>Ligne 7, col E</strong> : Année académique (ex: 2025/2026)</p>
                <p>• <strong>Ligne 8, col E</strong> : Filière (ex: Informatique)</p>
                <p>• <strong>À partir de la ligne 10</strong> : Données étudiants</p>
                <p className="ml-4">- Colonne C : MATRICULE</p>
                <p className="ml-4">- Colonne D : NOMS &amp; PRENOMS (en majuscules)</p>
                <p className="ml-4">- Colonne E : PASSWORD</p>
                <p>• Chaque feuille = une classe / filière</p>
              </div>
              <button
                onClick={telechargerModele}
                className="mt-3 text-xs bg-white text-blue-600 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                ⬇ Télécharger le modèle CSV
              </button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Aperçu ── */}
        {etape === ETAPES.APERCU && apercu && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card bg-blue-50 border-blue-200 text-center">
                <p className="text-3xl font-bold text-blue-700">{apercu.total}</p>
                <p className="text-sm text-blue-600 mt-1">Étudiants détectés</p>
              </div>
              <div className="card bg-purple-50 border-purple-200 text-center">
                <p className="text-3xl font-bold text-purple-700">{apercu.feuilles?.length || 1}</p>
                <p className="text-sm text-purple-600 mt-1">Feuille(s) Excel</p>
              </div>
              <div className="card bg-gray-50 text-center">
                <p className="text-lg font-bold text-gray-700 truncate">{fichier?.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {fichier ? `${(fichier.size / 1024).toFixed(0)} KB` : ''}
                </p>
              </div>
            </div>

            {apercu.feuilles?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Feuilles détectées</h3>
                <div className="flex flex-wrap gap-2">
                  {apercu.feuilles.map((f) => (
                    <span key={f} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="card overflow-hidden p-0">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Aperçu (10 premiers étudiants)</h3>
                <span className="text-xs text-gray-400">sur {apercu.total} au total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Matricule', 'Nom', 'Prénom', 'Email (généré)', 'Password', 'Filière', 'Niveau', 'Feuille'].map((h) => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {apercu.apercu.map((e, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs font-medium text-gray-800">{e.matricule}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{e.nom}</td>
                        <td className="px-4 py-2.5 text-gray-600">{e.prenom}</td>
                        <td className="px-4 py-2.5 text-blue-600 text-xs">{e.email}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-amber-700 bg-amber-50">{e.passwordApercu || '****'}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{e.filiere}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{e.niveau}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{e.feuille}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">⚠ {erreur}</div>
            )}

            {loading && progression && (
              <div className="card border-blue-200 bg-blue-50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0" />
                  <p className="font-semibold text-blue-800 text-sm flex-1">
                    Traitement : {progression.traites}/{progression.total} étudiants
                  </p>
                  <span className="font-bold text-blue-700 text-sm tabular-nums">
                    {Math.round((progression.traites / Math.max(progression.total, 1)) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.round((progression.traites / Math.max(progression.total, 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600">⏳ Import en cours — ne fermez pas cette page</p>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button onClick={lancerImport} disabled={loading} className="btn-primary flex items-center gap-2 px-6">
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    {progression ? `Tranche en cours... (${progression.traites}/${progression.total})` : 'Préparation...'}
                  </>
                ) : (
                  <>📥 Valider et importer les {apercu.total} étudiants</>
                )}
              </button>
              <button onClick={recommencer} disabled={loading} className="btn-secondary">← Autre fichier</button>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Rapport ── */}
        {etape === ETAPES.RAPPORT && rapport && (
          <div className="space-y-5">
            <div className={`card text-center py-8 ${rapport.erreurs === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="text-5xl mb-3">{rapport.erreurs === 0 ? '🎉' : '⚠️'}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Import terminé !</h2>
              <p className="text-gray-500 text-sm">
                {rapport.erreurs === 0
                  ? 'Tous les étudiants ont été traités avec succès.'
                  : `${rapport.erreurs} erreur(s) à vérifier.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total traités', value: rapport.total, color: 'bg-blue-50 text-blue-700', icon: '📋' },
                { label: 'Comptes créés', value: rapport.crees, color: 'bg-green-50 text-green-700', icon: '✅' },
                { label: 'Mis à jour', value: rapport.mis_a_jour, color: 'bg-purple-50 text-purple-700', icon: '🔄' },
                { label: 'Erreurs', value: rapport.erreurs, color: rapport.erreurs > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500', icon: rapport.erreurs > 0 ? '❌' : '—' },
              ].map((s) => (
                <div key={s.label} className={`card ${s.color} border-0`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{s.value}</p>
                      <p className="text-sm mt-0.5 opacity-80">{s.label}</p>
                    </div>
                    <span className="text-3xl opacity-60">{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {rapport.details_erreurs.length > 0 && (
              <div className="card border-red-200 bg-red-50">
                <h3 className="font-semibold text-red-800 mb-3">❌ Erreurs ({rapport.details_erreurs.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rapport.details_erreurs.map((e, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm bg-white p-2.5 rounded-lg border border-red-100">
                      <span className="font-mono text-red-600 text-xs font-bold flex-shrink-0">{e.matricule}</span>
                      <span className="text-red-700">{e.raison}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rapport.details.length > 0 && (
              <details className="card">
                <summary className="font-semibold text-gray-800 cursor-pointer select-none">
                  ✅ Étudiants traités avec succès ({rapport.details.length}) — cliquer pour voir
                </summary>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 uppercase border-b">
                      <tr>
                        <th className="text-left py-2 pr-4">Matricule</th>
                        <th className="text-left py-2 pr-4">Nom complet</th>
                        <th className="text-left py-2 pr-4">Email</th>
                        <th className="text-left py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rapport.details.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2 pr-4 font-mono text-xs">{d.matricule}</td>
                          <td className="py-2 pr-4">{d.nom}</td>
                          <td className="py-2 pr-4 text-blue-600 text-xs">{d.email || '—'}</td>
                          <td className="py-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              d.action === 'CREE' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {d.action === 'CREE' ? '+ Créé' : '↻ MàJ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            <div className="flex flex-wrap gap-3">
              <button onClick={() => exporterRapportCSV(rapport)} className="btn-secondary flex items-center gap-2">
                ⬇ Télécharger le rapport CSV
              </button>
              <button onClick={recommencer} className="btn-primary">📥 Nouvel import</button>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
