import { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

export default function Rapports() {
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  const charger = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debut) params.debut = debut;
      if (fin) params.fin = fin;
      const { data } = await api.get('/rapports/activite', { params });
      setRapport(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const TYPE_LABELS = { ATTESTATION: 'Attestations', CORRECTION_NOM: 'Corrections nom', CONTESTATION_NOTE: 'Contestations note' };
  const STATUT_LABELS = { EN_ATTENTE: 'En attente', EN_COURS: 'En cours', VALIDEE: 'Validées', REJETEE: 'Rejetées', CLOTUREE: 'Clôturées', ATTENTE_INFO: 'Info requise' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Rapports d'activité" />
        <main className="flex-1 p-6 space-y-6">
          {/* Filtres */}
          <div className="card flex gap-4 items-end">
            <div>
              <label className="label">Date début</label>
              <input type="date" className="input-field" value={debut} onChange={(e) => setDebut(e.target.value)} />
            </div>
            <div>
              <label className="label">Date fin</label>
              <input type="date" className="input-field" value={fin} onChange={(e) => setFin(e.target.value)} />
            </div>
            <button onClick={charger} className="btn-primary">Actualiser</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : rapport ? (
            <>
              <div className="card text-center">
                <p className="text-5xl font-bold text-blue-600">{rapport.totalRequetes}</p>
                <p className="text-gray-500 mt-1">Total des requêtes</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold mb-4">Par type de requête</h3>
                  <div className="space-y-3">
                    {rapport.parType?.map((t) => (
                      <div key={t.type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{TYPE_LABELS[t.type] || t.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-blue-200 rounded-full" style={{ width: `${(t.total / rapport.totalRequetes) * 100}px` }}></div>
                          <span className="font-bold text-gray-800">{t.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-4">Par statut</h3>
                  <div className="space-y-3">
                    {rapport.parStatut?.map((s) => (
                      <div key={s.statut} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{STATUT_LABELS[s.statut] || s.statut}</span>
                        <span className="font-bold text-gray-800">{s.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
