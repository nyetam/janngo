import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRequetes } from '../../store/requeteSlice';
import { getStatutClass, getStatutLabel, formatDate } from '../../utils/helpers';
import { TYPES_REQUETE } from '../../utils/constants';
import Layout from '../../components/common/Layout';
import Chatbot from '../../components/common/Chatbot';

export default function EtudiantDashboard() {
  const dispatch = useDispatch();
  const { liste, loading } = useSelector((s) => s.requetes);
  const { utilisateur } = useSelector((s) => s.auth);
  const notifications = useSelector((s) => s.notifications.liste);

  useEffect(() => { dispatch(fetchRequetes()); }, []);

  const stats = {
    total: liste.length,
    enAttente: liste.filter((r) => r.statut === 'EN_ATTENTE').length,
    enCours: liste.filter((r) => r.statut === 'EN_COURS').length,
    validees: liste.filter((r) => r.statut === 'VALIDEE').length,
  };

  const recentes = liste.slice(0, 3);

  return (
    <Layout title="Mon espace étudiant">
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Accueil personnalisé */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold">Bonjour, {utilisateur?.prenom} !</h2>
          <p className="text-blue-200 mt-1 text-sm">
            Matricule : {utilisateur?.etudiant?.matricule} · {utilisateur?.etudiant?.filiere} · {utilisateur?.etudiant?.niveau}
          </p>
          <Link to="/etudiant/nouvelle-requete" className="inline-block mt-4 bg-white text-blue-700 font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
            + Nouvelle requête
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total requêtes', value: stats.total, color: 'bg-blue-50 text-blue-700', icon: '📋' },
            { label: 'En attente', value: stats.enAttente, color: 'bg-yellow-50 text-yellow-700', icon: '⏳' },
            { label: 'En cours', value: stats.enCours, color: 'bg-indigo-50 text-indigo-700', icon: '🔄' },
            { label: 'Validées', value: stats.validees, color: 'bg-green-50 text-green-700', icon: '✅' },
          ].map((s) => (
            <div key={s.label} className={`card ${s.color} border-0`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-sm mt-1 opacity-80">{s.label}</p>
                </div>
                <span className="text-3xl opacity-60">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requêtes récentes */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Requêtes récentes</h3>
              <Link to="/etudiant/mes-requetes" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : recentes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>Aucune requête soumise</p>
                <Link to="/etudiant/nouvelle-requete" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                  Créer votre première requête
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentes.map((r) => (
                  <Link key={r.id} to={`/etudiant/requete/${r.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{TYPES_REQUETE[r.type]?.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.dateDepot)}</p>
                    </div>
                    <span className={getStatutClass(r.statut)}>{getStatutLabel(r.statut)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Notifications récentes</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Aucune notification</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg text-sm ${!n.lu ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                    <p className="text-gray-800 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.dateEnvoi)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Chatbot />
    </Layout>
  );
}
