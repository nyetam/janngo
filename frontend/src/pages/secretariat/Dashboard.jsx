import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDate } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import { usePeriodFilter, PeriodSelector } from '../../hooks/usePeriodFilter';
import Layout from '../../components/common/Layout';

export default function SecretariatDashboard() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const attAttestation = liste.filter((r) => r.type === 'ATTESTATION' && r.statut === 'EN_ATTENTE');
  const attCorrection = liste.filter((r) => r.type === 'CORRECTION_NOM' && r.statut === 'EN_ATTENTE');
  const totalEnAttente = attAttestation.length + attCorrection.length;
  const aTraiter = filtree.filter((r) => r.statut === 'EN_ATTENTE');

  return (
    <Layout title="Secrétariat">
      <main className="flex-1 p-4 md:p-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-yellow-50 text-yellow-800 border-yellow-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{totalEnAttente}</p><p className="text-sm mt-1">À traiter (total)</p></div>
              <span className="text-4xl opacity-40">📬</span>
            </div>
          </div>
          <div className="card bg-blue-50 text-blue-800 border-blue-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{attAttestation.length}</p><p className="text-sm mt-1">Attestations</p></div>
              <span className="text-4xl opacity-40">📄</span>
            </div>
          </div>
          <div className="card bg-amber-50 text-amber-800 border-amber-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{attCorrection.length}</p><p className="text-sm mt-1">Corrections nom</p></div>
              <span className="text-4xl opacity-40">✏️</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-semibold text-gray-800">Requêtes à traiter</h3>
            <div className="flex items-center gap-3">
              <PeriodSelector
                periode={periode}
                onChange={setPeriode}
                onRefresh={() => dispatch(fetchRequetes())}
                loading={loading}
              />
              <Link to="/secretariat/requetes" className="text-sm text-blue-600 hover:underline">Voir tout →</Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : aTraiter.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm">Aucune requête en attente sur la période sélectionnée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aTraiter.slice(0, 8).map((r) => (
                <Link
                  key={r.id}
                  to={`/secretariat/requete/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPES_REQUETE[r.type]?.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                      </p>
                      <p className="text-xs text-gray-400">
                        {TYPES_REQUETE[r.type]?.label} · {formatDate(r.dateDepot)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 hidden sm:inline">{r.documents?.length || 0} doc(s)</span>
                    <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
