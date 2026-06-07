import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Chatbot from '../../components/common/Chatbot';
import FormulaireAttestation from '../../components/requetes/FormulaireAttestation';
import FormulaireCorrectionNom from '../../components/requetes/FormulaireCorrectionNom';
import FormulaireContestationNote from '../../components/requetes/FormulaireContestationNote';

const TYPES = [
  { key: 'ATTESTATION', label: 'Demande d\'attestation', desc: 'Certificat de scolarité, diplôme, relevé de notes...', icon: '📄', color: 'blue' },
  { key: 'CORRECTION_NOM', label: 'Correction de nom', desc: 'Erreur sur votre nom ou prénom dans le système', icon: '✏️', color: 'amber' },
  { key: 'CONTESTATION_NOTE', label: 'Contestation de note', desc: 'Vous pensez que votre note est incorrecte', icon: '📝', color: 'purple' },
];

const COLORS = {
  blue: 'border-blue-200 bg-blue-50 hover:border-blue-400',
  amber: 'border-amber-200 bg-amber-50 hover:border-amber-400',
  purple: 'border-purple-200 bg-purple-50 hover:border-purple-400',
};

export default function NouvelleRequete() {
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSuccess = (requete) => {
    setSuccess(true);
    setTimeout(() => navigate(`/etudiant/requete/${requete.id}`), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Nouvelle requête" />
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
          {success ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600">Requête soumise !</h2>
              <p className="text-gray-500 mt-2">Redirection vers le suivi de votre requête...</p>
            </div>
          ) : !type ? (
            <div className="space-y-4">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Quel type de requête souhaitez-vous soumettre ?</h2>
                <p className="text-sm text-gray-500">Sélectionnez le type correspondant à votre besoin.</p>
              </div>
              <div className="space-y-3">
                {TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${COLORS[t.color]}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{t.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{t.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{t.desc}</p>
                      </div>
                      <span className="ml-auto text-gray-400 text-xl">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <button onClick={() => setType(null)} className="text-gray-400 hover:text-gray-600 text-sm">← Retour</button>
                <h2 className="font-semibold text-gray-800">
                  {TYPES.find((t) => t.key === type)?.label}
                </h2>
              </div>
              {type === 'ATTESTATION' && <FormulaireAttestation onSuccess={handleSuccess} />}
              {type === 'CORRECTION_NOM' && <FormulaireCorrectionNom onSuccess={handleSuccess} />}
              {type === 'CONTESTATION_NOTE' && <FormulaireContestationNote onSuccess={handleSuccess} />}
            </div>
          )}
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
