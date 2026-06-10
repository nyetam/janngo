import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDate } from '../../utils/helpers';
import { usePeriodFilter, PeriodSelector } from '../../hooks/usePeriodFilter';
import Layout from '../../components/common/Layout';

export default function DirecteurDashboard() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const aValider = liste.filter((r) => r.type === 'CORRECTION_NOM' && r.statut === 'EN_COURS');
  const validees = liste.filter((r) => r.type === 'CORRECTION_NOM' && r.statut === 'VALIDEE');
  const rejetees = liste.filter((r) => r.type === 'CORRECTION_NOM' && r.statut === 'REJETEE');
  const aValiderPeriode = filtree.filter((r) => r.type === 'CORRECTION_NOM' && r.statut === 'EN_COURS');

  return (
    <Layout title="Direction">
      <main className="flex-1 p-4 md:p-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-amber-50 text-amber-800 border-amber-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{aValider.length}</p><p className="text-sm mt-1">À valider</p></div>
              <span className="text-4xl opacity-40">✏️</span>
            </div>
          </div>
          <div className="card bg-green-50 text-green-700 border-green-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{validees.length}</p><p className="text-sm mt-1">Validées</p></div>
              <span className="text-4xl opacity-40">✅</span>
            </div>
          </div>
          <div className="card bg-red-50 text-red-700 border-red-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{rejetees.length}</p><p className="text-sm mt-1">Rejetées</p></div>
              <span className="text-4xl opacity-40">❌</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-semibold text-gray-800">Corrections de nom à valider</h3>
            <div className="flex items-center gap-3">
              <PeriodSelector
                periode={periode}
                onChange={setPeriode}
                onRefresh={() => dispatch(fetchRequetes())}
                loading={loading}
              />
              <Link to="/directeur/validation" className="text-sm text-blue-600 hover:underline">Voir tout →</Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : aValiderPeriode.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm">Aucune requête à valider sur cette période</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aValiderPeriode.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  to={`/directeur/requete/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="text-red-500 line-through">{r.correctionNom?.ancienNom}</span>
                      {' → '}<span className="text-green-600">{r.correctionNom?.nouveauNom}</span>
                      {' · '}{formatDate(r.dateDepot)}
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
