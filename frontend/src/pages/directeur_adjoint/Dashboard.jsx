import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDate } from '../../utils/helpers';
import { usePeriodFilter, PeriodSelector } from '../../hooks/usePeriodFilter';
import Layout from '../../components/common/Layout';

export default function DirecteurAdjointDashboard() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const aOrienter = liste.filter((r) =>
    r.type === 'ATTESTATION' && r.statut === 'EN_COURS' && !r.attestation?.serviceTraitant
  );
  const orientees = liste.filter((r) =>
    r.type === 'ATTESTATION' && !!r.attestation?.serviceTraitant
  );
  const aOrienterPeriode = filtree.filter((r) =>
    r.type === 'ATTESTATION' && r.statut === 'EN_COURS' && !r.attestation?.serviceTraitant
  );

  return (
    <Layout title="Direction Adjointe">
      <main className="flex-1 p-4 md:p-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-blue-50 text-blue-800 border-blue-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{aOrienter.length}</p><p className="text-sm mt-1">À orienter</p></div>
              <span className="text-4xl opacity-40">🔄</span>
            </div>
          </div>
          <div className="card bg-green-50 text-green-700 border-green-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{orientees.length}</p><p className="text-sm mt-1">Orientées</p></div>
              <span className="text-4xl opacity-40">✅</span>
            </div>
          </div>
          <div className="card bg-gray-50 text-gray-700">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{liste.filter((r) => r.type === 'ATTESTATION').length}</p><p className="text-sm mt-1">Total attestations</p></div>
              <span className="text-4xl opacity-40">📄</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-semibold text-gray-800">Attestations à orienter</h3>
            <div className="flex items-center gap-3">
              <PeriodSelector
                periode={periode}
                onChange={setPeriode}
                onRefresh={() => dispatch(fetchRequetes())}
                loading={loading}
              />
              <Link to="/directeur-adjoint/orientation" className="text-sm text-blue-600 hover:underline">Voir tout →</Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : aOrienterPeriode.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm">Aucune attestation à orienter sur cette période</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aOrienterPeriode.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  to={`/directeur-adjoint/requete/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.attestation?.typeAttestation} · {formatDate(r.dateDepot)}
                    </p>
                  </div>
                  <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
