import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/authSlice';
import { fetchNotifications } from './store/notificationSlice';

// Auth
import Login from './pages/auth/Login';

// Étudiant
import EtudiantDashboard from './pages/etudiant/Dashboard';
import NouvelleRequete from './pages/etudiant/NouvelleRequete';
import MesRequetes from './pages/etudiant/MesRequetes';
import SuiviRequete from './pages/etudiant/SuiviRequete';

// Secrétariat
import SecretariatDashboard from './pages/secretariat/Dashboard';
import GestionRequetes from './pages/secretariat/GestionRequetes';

// Directeur
import DirecteurDashboard from './pages/directeur/Dashboard';
import ValidationRequetes from './pages/directeur/ValidationRequetes';
import Rapports from './pages/directeur/Rapports';

// Directeur Adjoint
import DirecteurAdjointDashboard from './pages/directeur_adjoint/Dashboard';
import OrientationRequetes from './pages/directeur_adjoint/OrientationRequetes';

// Département
import DepartementDashboard from './pages/departement/Dashboard';
import TraitementRequetesDept from './pages/departement/TraitementRequetes';

// Scolarité
import ScolariteDashboard from './pages/scolarite/Dashboard';
import TraitementRequetesScol from './pages/scolarite/TraitementRequetes';

// Cellule Info
import CelluleInfoDashboard from './pages/cellule_info/Dashboard';
import ModificationSysteme from './pages/cellule_info/ModificationSysteme';
import ImportEtudiants from './pages/cellule_info/ImportEtudiants';

// Détail requête partagé (personnel)
import RequeteDetail from './pages/personnel/RequeteDetail';

// ─────────────────────────────────────────────────────────
const ROLE_HOME = {
  ETUDIANT: '/etudiant',
  SECRETAIRE: '/secretariat',
  DIRECTEUR: '/directeur',
  DIR_ADJOINT: '/directeur-adjoint',
  RESP_DEPT: '/departement',
  SCOLARITE: '/scolarite',
  CELLULE_INFO: '/cellule-info',
};

function ProtectedRoute({ children, allowedRoles }) {
  const { utilisateur, token, initialized } = useSelector((s) => s.auth);

  // Attendre l'initialisation avant de juger
  if (token && !initialized) return <Loader />;
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && utilisateur && !allowedRoles.includes(utilisateur.role)) {
    return <Navigate to={ROLE_HOME[utilisateur.role] || '/login'} replace />;
  }
  return children;
}

// Route publique : redirige vers le dashboard si déjà connecté,
// ne fait RIEN (ne redirige pas vers /login) si non connecté.
function PublicRoute({ children }) {
  const { token, initialized, utilisateur } = useSelector((s) => s.auth);
  if (token && !initialized) return <Loader />;
  if (token && initialized && utilisateur) {
    return <Navigate to={ROLE_HOME[utilisateur.role] || '/'} replace />;
  }
  return children;
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <img src="/logojanngo.png" alt="Janngo" className="w-16 h-16 object-contain mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token, initialized, utilisateur } = useSelector((s) => s.auth);

  // Vérifier le token stocké UNE SEULE FOIS au démarrage de l'app.
  // Après un login réussi, login.fulfilled peuple déjà utilisateur + initialized,
  // donc un 2ᵉ appel fetchMe serait redondant et peut causer un flash de Loader.
  useEffect(() => {
    if (token && !initialized) dispatch(fetchMe());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (utilisateur?.role === 'ETUDIANT') dispatch(fetchNotifications());
  }, [utilisateur]);

  if (token && !initialized) return <Loader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* ── Étudiant ── */}
        <Route path="/etudiant" element={<ProtectedRoute allowedRoles={['ETUDIANT']}><EtudiantDashboard /></ProtectedRoute>} />
        <Route path="/etudiant/nouvelle-requete" element={<ProtectedRoute allowedRoles={['ETUDIANT']}><NouvelleRequete /></ProtectedRoute>} />
        <Route path="/etudiant/mes-requetes" element={<ProtectedRoute allowedRoles={['ETUDIANT']}><MesRequetes /></ProtectedRoute>} />
        <Route path="/etudiant/requete/:id" element={<ProtectedRoute allowedRoles={['ETUDIANT']}><SuiviRequete /></ProtectedRoute>} />

        {/* ── Secrétariat ── */}
        <Route path="/secretariat" element={<ProtectedRoute allowedRoles={['SECRETAIRE']}><SecretariatDashboard /></ProtectedRoute>} />
        <Route path="/secretariat/requetes" element={<ProtectedRoute allowedRoles={['SECRETAIRE']}><GestionRequetes /></ProtectedRoute>} />
        <Route path="/secretariat/requete/:id" element={<ProtectedRoute allowedRoles={['SECRETAIRE']}><RequeteDetail /></ProtectedRoute>} />

        {/* ── Directeur ── */}
        <Route path="/directeur" element={<ProtectedRoute allowedRoles={['DIRECTEUR']}><DirecteurDashboard /></ProtectedRoute>} />
        <Route path="/directeur/validation" element={<ProtectedRoute allowedRoles={['DIRECTEUR']}><ValidationRequetes /></ProtectedRoute>} />
        <Route path="/directeur/rapports" element={<ProtectedRoute allowedRoles={['DIRECTEUR']}><Rapports /></ProtectedRoute>} />
        <Route path="/directeur/requete/:id" element={<ProtectedRoute allowedRoles={['DIRECTEUR']}><RequeteDetail /></ProtectedRoute>} />

        {/* ── Directeur Adjoint ── */}
        <Route path="/directeur-adjoint" element={<ProtectedRoute allowedRoles={['DIR_ADJOINT']}><DirecteurAdjointDashboard /></ProtectedRoute>} />
        <Route path="/directeur-adjoint/orientation" element={<ProtectedRoute allowedRoles={['DIR_ADJOINT']}><OrientationRequetes /></ProtectedRoute>} />
        <Route path="/directeur-adjoint/requete/:id" element={<ProtectedRoute allowedRoles={['DIR_ADJOINT']}><RequeteDetail /></ProtectedRoute>} />

        {/* ── Département ── */}
        <Route path="/departement" element={<ProtectedRoute allowedRoles={['RESP_DEPT']}><DepartementDashboard /></ProtectedRoute>} />
        <Route path="/departement/traitement" element={<ProtectedRoute allowedRoles={['RESP_DEPT']}><TraitementRequetesDept /></ProtectedRoute>} />
        <Route path="/departement/requete/:id" element={<ProtectedRoute allowedRoles={['RESP_DEPT']}><RequeteDetail /></ProtectedRoute>} />

        {/* ── Scolarité ── */}
        <Route path="/scolarite" element={<ProtectedRoute allowedRoles={['SCOLARITE']}><ScolariteDashboard /></ProtectedRoute>} />
        <Route path="/scolarite/traitement" element={<ProtectedRoute allowedRoles={['SCOLARITE']}><TraitementRequetesScol /></ProtectedRoute>} />
        <Route path="/scolarite/requete/:id" element={<ProtectedRoute allowedRoles={['SCOLARITE']}><RequeteDetail /></ProtectedRoute>} />

        {/* ── Cellule Info ── */}
        <Route path="/cellule-info" element={<ProtectedRoute allowedRoles={['CELLULE_INFO']}><CelluleInfoDashboard /></ProtectedRoute>} />
        <Route path="/cellule-info/modifications" element={<ProtectedRoute allowedRoles={['CELLULE_INFO']}><ModificationSysteme /></ProtectedRoute>} />
        <Route path="/cellule-info/import-etudiants" element={<ProtectedRoute allowedRoles={['CELLULE_INFO']}><ImportEtudiants /></ProtectedRoute>} />
        <Route path="/cellule-info/requete/:id" element={<ProtectedRoute allowedRoles={['CELLULE_INFO']}><RequeteDetail /></ProtectedRoute>} />

        {/* ── Redirections ── */}
        <Route path="/" element={
          utilisateur
            ? <Navigate to={ROLE_HOME[utilisateur.role] || '/login'} replace />
            : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
