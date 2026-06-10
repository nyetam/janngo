import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/authSlice';
import { AlertCircle } from 'lucide-react';

const MSG_ERREUR = 'Identifiant ou mot de passe incorrect. Veuillez réessayer.';

const ROLE_ROUTES = {
  ETUDIANT: '/etudiant',
  SECRETAIRE: '/secretariat',
  DIRECTEUR: '/directeur',
  DIR_ADJOINT: '/directeur-adjoint',
  RESP_DEPT: '/departement',
  SCOLARITE: '/scolarite',
  CELLULE_INFO: '/cellule-info',
};

const COMPTES_DEMO = [
  ['Étudiant', 'UIT2024001', 'etudiant123'],
  ['Étudiant 2', 'UIT2024002', 'etudiant123'],
  ['Secrétaire', 'secretaire@uit.sn', 'secret123'],
  ['Directeur', 'directeur@uit.sn', 'direct123'],
  ['Dir. Adjoint', 'dadjoint@uit.sn', 'dadjoint123'],
  ['Resp. Dept', 'dept@uit.sn', 'dept123'],
  ['Scolarité', 'scolarite@uit.sn', 'scol123'],
  ['Cellule Info', 'cellule@uit.sn', 'cellule123'],
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ identifiant: '', motDePasse: '' });
  const [showDemo, setShowDemo] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    dispatch(clearError());
    const result = await dispatch(login({ identifiant: form.identifiant, motDePasse: form.motDePasse }));
    if (login.fulfilled.match(result)) {
      const role = result.payload.utilisateur.role;
      navigate(ROLE_ROUTES[role] || '/');
    } else {
      setError(MSG_ERREUR);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo & Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-xl mb-4 p-2">
            <img
              src="/logojanngo.png"
              alt="Janngo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-blue-700 font-black text-4xl flex items-center justify-center w-full h-full">J</span>';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">JANNGO</h1>
          <p className="text-blue-200 mt-1 text-sm">Plateforme de gestion des requêtes étudiantes</p>
          <p className="text-blue-300 text-xs mt-0.5">Institut Universitaire de Technologie de Douala</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Connexion</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="label">Matricule ou Email</label>
              <input
                type="text"
                className="input-field"
                placeholder="Votre matricule (ex: 23I01061) ou email"
                value={form.identifiant}
                onChange={handleChange('identifiant')}
                required
                autoFocus
                autoComplete="username"
              />
              <p className="text-xs text-gray-400 mt-1">
                Étudiants : entrez votre matricule · Personnel : entrez votre email
              </p>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.motDePasse}
                onChange={handleChange('motDePasse')}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-sm p-3.5 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full text-base py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Comptes démo */}
          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors text-center"
            >
              {showDemo ? '▲ Masquer les comptes de démonstration' : '▼ Afficher les comptes de démonstration'}
            </button>

            {showDemo && (
              <div className="mt-3 space-y-1">
                {COMPTES_DEMO.map(([role, id, pwd]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setForm({ identifiant: id, motDePasse: pwd })}
                    className="w-full text-left hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex justify-between items-center group"
                  >
                    <span className="text-blue-600 font-medium text-xs">{role}</span>
                    <span className="text-gray-400 text-xs group-hover:text-blue-400 font-mono">{id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          Les identifiants sont attribués par l'administration de l'IUT
        </p>
      </div>
    </div>
  );
}
