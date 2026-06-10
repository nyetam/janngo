import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDate } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import { usePeriodFilter, PeriodSelector } from '../../hooks/usePeriodFilter';
import Layout from '../../components/common/Layout';

export default function CelluleInfoDashboard() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const aModifier = liste.filter((r) =>
    ['CORRECTION_NOM', 'CONTESTATION_NOTE'].includes(r.type) && r.statut === 'VALIDEE'
  );
  const cloturees = liste.filter((r) =>
    ['CORRECTION_NOM', 'CONTESTATION_NOTE'].includes(r.type) && r.statut === 'CLOTUREE'
  );
  const aModifierPeriode = filtree.filter((r) =>
    ['CORRECTION_NOM', 'CONTESTATION_NOTE'].includes(r.type) && r.statut === 'VALIDEE'
  );

  return (
    <Layout title="Cellule Informatique">
      <main className="flex-1 p-4 md:p-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-indigo-50 text-indigo-700 border-indigo-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{aModifier.length}</p><p className="text-sm mt-1">Modifications à faire</p></div>
              <span className="text-4xl opacity-40">🔧</span>
            </div>
          </div>
          <div className="card bg-green-50 text-green-700 border-green-200">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{cloturees.length}</p><p className="text-sm mt-1">Modifications faites</p></div>
              <span className="text-4xl opacity-40">✅</span>
            </div>
          </div>
          <div className="card bg-gray-50 text-gray-700">
            <div className="flex items-center justify-between">
              <div><p className="text-3xl font-bold">{liste.length}</p><p className="text-sm mt-1">Total</p></div>
              <span className="text-4xl opacity-40">📋</span>
            </div>
          </div>
        </div>

        {/* Accès rapide Import */}
        <Link
          to="/cellule-info/import-etudiants"
          className="card border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all block"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📥</div>
            <div>
              <h3 className="font-semibold text-gray-800">Import des étudiants</h3>
              <p className="text-sm text-gray-500 mt-0.5">Importer la liste de classe depuis le fichier Excel de l'IUT.</p>
            </div>
            <span className="ml-auto text-gray-400 text-xl flex-shrink-0">→</span>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-semibold text-gray-800">Modifications à effectuer</h3>
            <div className="flex items-center gap-3">
              <PeriodSelector
                periode={periode}
                onChange={setPeriode}
                onRefresh={() => dispatch(fetchRequetes())}
                loading={loading}
              />
              <Link to="/cellule-info/modifications" className="text-sm text-blue-600 hover:underline">Voir tout →</Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : aModifierPeriode.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm">Aucune modification à effectuer sur cette période</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aModifierPeriode.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  to={`/cellule-info/requete/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPES_REQUETE[r.type]?.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{TYPES_REQUETE[r.type]?.label}</p>
                      <p className="text-xs text-gray-400">
                        {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom} · {formatDate(r.dateDepot)}
                      </p>
                      {r.type === 'CORRECTION_NOM' && r.correctionNom && (
                        <p className="text-xs text-orange-600">
                          <span className="line-through">{r.correctionNom.ancienNom}</span> → {r.correctionNom.nouveauNom}
                        </p>
                      )}
                    </div>
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
