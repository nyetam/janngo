import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDate } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import { usePeriodFilter, PeriodSelector } from '../../hooks/usePeriodFilter';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

export default function DepartementDashboard() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { filtree, periode, setPeriode } = usePeriodFilter(liste);

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  // Département : ATTESTATION orientées vers DEPARTEMENT + CONTESTATION_NOTE EN_COURS
  const aTraiter = liste.filter((r) =>
    (r.type === 'ATTESTATION' && r.statut === 'EN_COURS' && r.attestation?.serviceTraitant === 'DEPARTEMENT') ||
    (r.type === 'CONTESTATION_NOTE' && r.statut === 'EN_COURS')
  );
  // Traitées = décision prise (VALIDEE ou REJETEE)
  const traitees = liste.filter((r) =>
    ['ATTESTATION', 'CONTESTATION_NOTE'].includes(r.type) && ['VALIDEE', 'REJETEE'].includes(r.statut)
  );

  const aTraiterPeriode = filtree.filter((r) =>
    (r.type === 'ATTESTATION' && r.statut === 'EN_COURS' && r.attestation?.serviceTraitant === 'DEPARTEMENT') ||
    (r.type === 'CONTESTATION_NOTE' && r.statut === 'EN_COURS')
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Département" />
        <main className="flex-1 p-6 space-y-6">

          <div className="grid grid-cols-3 gap-4">
            <div className="card bg-blue-50 text-blue-800 border-blue-200">
              <div className="flex items-center justify-between">
                <div><p className="text-3xl font-bold">{aTraiter.length}</p><p className="text-sm mt-1">À traiter</p></div>
                <span className="text-4xl opacity-40">⚙️</span>
              </div>
            </div>
            <div className="card bg-green-50 text-green-700 border-green-200">
              <div className="flex items-center justify-between">
                <div><p className="text-3xl font-bold">{traitees.length}</p><p className="text-sm mt-1">Décisions prises</p></div>
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

          <div className="card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="font-semibold text-gray-800">Requêtes assignées</h3>
              <div className="flex items-center gap-3">
                <PeriodSelector
                  periode={periode}
                  onChange={setPeriode}
                  onRefresh={() => dispatch(fetchRequetes())}
                  loading={loading}
                />
                <Link to="/departement/traitement" className="text-sm text-blue-600 hover:underline">Voir tout →</Link>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : filtree.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-sm">Aucune requête sur cette période</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtree.slice(0, 8).map((r) => (
                  <Link
                    key={r.id}
                    to={`/departement/requete/${r.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{TYPES_REQUETE[r.type]?.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{TYPES_REQUETE[r.type]?.label}</p>
                        <p className="text-xs text-gray-400">
                          {r.etudiant?.utilisateur?.prenom} {r.etudiant?.utilisateur?.nom} · {formatDate(r.dateDepot)}
                        </p>
                        <p className="text-xs text-gray-400">📎 {r.documents?.length || 0} doc(s)</p>
                      </div>
                    </div>
                    <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
