import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDate } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import Layout from '../../components/common/Layout';
import Chatbot from '../../components/common/Chatbot';

export default function MesRequetes() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const [filtre, setFiltre] = useState('TOUS');

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const filtrees = filtre === 'TOUS' ? liste : liste.filter((r) => r.statut === filtre);

  return (
    <Layout title="Mes requêtes">
      <main className="flex-1 p-4 md:p-6">
        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['TOUS', 'EN_ATTENTE', 'EN_COURS', 'VALIDEE', 'REJETEE', 'CLOTUREE'].map((s) => (
            <button
              key={s}
              onClick={() => setFiltre(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtre === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'TOUS' ? 'Toutes' : getStatutLabel(s)}
              {s !== 'TOUS' && (
                <span className="ml-1.5 bg-black/10 px-1.5 rounded-full text-xs">
                  {liste.filter((r) => r.statut === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : filtrees.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-lg font-medium">Aucune requête</p>
            {filtre === 'TOUS' && (
              <Link to="/etudiant/nouvelle-requete" className="mt-3 inline-block btn-primary">
                Créer une requête
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtrees.map((r) => (
              <Link
                key={r.id}
                to={`/etudiant/requete/${r.id}`}
                className="card hover:shadow-md transition-shadow flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-3xl flex-shrink-0">{TYPES_REQUETE[r.type]?.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{TYPES_REQUETE[r.type]?.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Déposée le {formatDate(r.dateDepot)}
                      {r.priorite === 'URGENTE' && (
                        <span className="ml-2 text-orange-500 font-medium">⚡ Urgent</span>
                      )}
                    </p>
                    {r.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{r.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                  <span className="text-xs text-gray-400">#{r.id}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Chatbot />
    </Layout>
  );
}
