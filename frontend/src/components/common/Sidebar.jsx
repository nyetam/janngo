import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { ROLE_LABELS } from '../../utils/constants';
import {
  Home, FilePlus, ClipboardList, CheckCircle, BarChart2,
  GitBranch, Wrench, Settings, Download, LogOut, LayoutDashboard,
} from 'lucide-react';

const ICONS = {
  Home, FilePlus, ClipboardList, CheckCircle, BarChart2,
  GitBranch, Wrench, Settings, Download, LayoutDashboard,
};

const NAV_ITEMS = {
  ETUDIANT: [
    { to: '/etudiant', label: 'Tableau de bord', icon: 'Home' },
    { to: '/etudiant/nouvelle-requete', label: 'Nouvelle requête', icon: 'FilePlus' },
    { to: '/etudiant/mes-requetes', label: 'Mes requêtes', icon: 'ClipboardList' },
  ],
  SECRETAIRE: [
    { to: '/secretariat', label: 'Tableau de bord', icon: 'Home' },
    { to: '/secretariat/requetes', label: 'Gestion requêtes', icon: 'ClipboardList' },
  ],
  DIRECTEUR: [
    { to: '/directeur', label: 'Tableau de bord', icon: 'Home' },
    { to: '/directeur/validation', label: 'Validation', icon: 'CheckCircle' },
    { to: '/directeur/rapports', label: 'Rapports', icon: 'BarChart2' },
  ],
  DIR_ADJOINT: [
    { to: '/directeur-adjoint', label: 'Tableau de bord', icon: 'Home' },
    { to: '/directeur-adjoint/orientation', label: 'Orientation', icon: 'GitBranch' },
  ],
  RESP_DEPT: [
    { to: '/departement', label: 'Tableau de bord', icon: 'Home' },
    { to: '/departement/traitement', label: 'Traitement', icon: 'Wrench' },
  ],
  SCOLARITE: [
    { to: '/scolarite', label: 'Tableau de bord', icon: 'Home' },
    { to: '/scolarite/traitement', label: 'Traitement', icon: 'Wrench' },
  ],
  CELLULE_INFO: [
    { to: '/cellule-info', label: 'Tableau de bord', icon: 'Home' },
    { to: '/cellule-info/modifications', label: 'Modifications', icon: 'Settings' },
    { to: '/cellule-info/import-etudiants', label: 'Import étudiants', icon: 'Download' },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { utilisateur } = useSelector((s) => s.auth);
  const role = utilisateur?.role;
  const items = NAV_ITEMS[role] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-gradient-to-b from-blue-800 to-blue-900
        min-h-screen flex flex-col text-white shadow-xl flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="p-5 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
            <img
              src="/logojanngo.png"
              alt="Janngo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-blue-800 font-black text-xl">J</span>';
              }}
            />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Janngo</h1>
            <p className="text-blue-300 text-xs">Plateforme IUT</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-blue-700 bg-blue-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{utilisateur?.prenom} {utilisateur?.nom}</p>
            <p className="text-blue-300 text-xs">{ROLE_LABELS[role]}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || Home;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-blue-800 font-semibold shadow'
                    : 'text-blue-100 hover:bg-blue-700/60'
                }`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div className="p-3 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-700/60 transition-colors"
        >
          <LogOut size={17} className="flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
