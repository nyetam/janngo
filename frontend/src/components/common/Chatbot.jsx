import { useState, useRef, useEffect } from 'react';
import { formatDateTime } from '../../utils/helpers';

// ─── Moteur de réponse local ───────────────────────────────────────────────
const REGLES = [
  {
    motsCles: ['attestation', 'certificat', 'diplome', 'diplôme', 'scolarite', 'scolarité'],
    reponse: `Pour une demande d'attestation, vous avez besoin de :\n✅ Quitus de l'année en cours\n✅ Copie de la CNI\n\nÉtapes :\nSoumettez votre demande → Le secrétariat vérifie votre éligibilité → Le directeur adjoint examine → Le département ou la scolarité traite votre dossier → Vous recevez une notification du résultat.`,
  },
  {
    motsCles: ['nom', 'correction', 'erreur', 'modifier', 'changer', 'prenom', 'prénom'],
    reponse: `Pour une correction de nom, vous avez besoin de :\n✅ Quitus de l'année en cours\n✅ Copie de la CNI\n✅ Lettre adressée au Directeur\n✅ Profil étudiant imprimé\n\nÉtapes :\nSoumettez votre demande → Le secrétariat vérifie → Le directeur valide → La cellule informatique modifie dans le système → Vous recevez une notification.`,
  },
  {
    motsCles: ['note', 'contester', 'contestation', 'resultat', 'résultat'],
    reponse: `Pour contester une note, vous avez besoin de :\n✅ Fiche de requête complétée et signée\n✅ Copie de la note contestée\n\nÉtapes :\nSoumettez votre contestation → Le département analyse sur la base de la liste du professeur → Si favorable, la cellule informatique met à jour votre note → Vous recevez une notification du résultat.`,
  },
  {
    motsCles: ['delai', 'délai', 'temps', 'combien', 'duree', 'durée', 'quand'],
    reponse: `Les délais de traitement habituels sont :\n📋 Attestation : 3 à 5 jours ouvrables\n✏️ Correction de nom : 5 à 7 jours ouvrables\n📝 Contestation de note : 7 à 10 jours ouvrables\n\nVous recevrez une notification à chaque étape de traitement.`,
  },
  {
    motsCles: ['statut', 'etat', 'état', 'avancement', 'suivi', 'suivre'],
    reponse: `Pour suivre votre requête, allez dans "Mes requêtes" dans votre tableau de bord.\n\nLes statuts possibles :\n🕐 EN_ATTENTE : Votre demande a été reçue\n🔄 EN_COURS : En cours de traitement\n⏳ ATTENTE_INFO : Informations supplémentaires requises\n✅ VALIDEE : Demande approuvée\n❌ REJETEE : Demande refusée\n🔒 CLOTUREE : Dossier fermé`,
  },
  {
    motsCles: ['pieces', 'pièces', 'documents', 'fichiers', 'joindre', 'uploader', 'upload'],
    reponse: `Vous pouvez joindre vos documents directement dans le formulaire de soumission.\n\nChaque type de requête a ses sections dédiées avec des boutons d'upload individuels.\n\nFormats acceptés : PDF, JPG, PNG, DOC, DOCX\nTaille maximale : 10 MB par fichier.`,
  },
  {
    motsCles: ['mot de passe', 'password', 'connexion', 'login', 'oublie', 'oublié'],
    reponse: `Les mots de passe sont attribués par l'administration de l'UIT.\n\nSi vous avez perdu votre mot de passe, rapprochez-vous du secrétariat ou de la cellule informatique en personne.`,
  },
  {
    motsCles: ['bonjour', 'salut', 'hello', 'bonsoir', 'bonne journee', 'hi', 'coucou'],
    reponse: `Bonjour ! Je suis l'assistant Janngo 👋\n\nJe peux vous aider avec :\n📋 Demande d'attestation\n✏️ Correction de nom\n📝 Contestation de note\n\nSur quoi puis-je vous aider ?`,
  },
  {
    motsCles: ['merci', 'thank', 'parfait', 'super', 'genial', 'génial', 'excellent'],
    reponse: `De rien ! N'hésitez pas si vous avez d'autres questions. Bonne continuation ! 😊`,
  },
  {
    motsCles: ['aide', 'help', 'quoi', 'que faire', 'comment'],
    reponse: `Je peux vous aider sur ces sujets :\n📋 Demande d'attestation\n✏️ Correction de nom\n📝 Contestation de note\n⏱ Délais de traitement\n📊 Suivre ma requête\n📎 Documents à fournir\n🔑 Mot de passe\n\nPosez-moi votre question !`,
  },
];

const REPONSE_DEFAUT = `Je n'ai pas bien compris votre question.\n\nVoici ce sur quoi je peux vous aider :\n📋 Demande d'attestation\n✏️ Correction de nom\n📝 Contestation de note\n⏱ Délais de traitement\n📊 Suivre ma requête\n📎 Documents à fournir\n🔑 Mot de passe\n\nCliquez sur une suggestion ci-dessous ou posez votre question.`;

function normaliser(texte) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function trouverReponse(message) {
  const msgNorm = normaliser(message);
  for (const regle of REGLES) {
    for (const motCle of regle.motsCles) {
      if (msgNorm.includes(normaliser(motCle))) {
        return regle.reponse;
      }
    }
  }
  return REPONSE_DEFAUT;
}

// ─── Suggestions de démarrage ──────────────────────────────────────────────
const SUGGESTIONS = [
  'Comment faire une demande d\'attestation ?',
  'Quels documents pour corriger mon nom ?',
  'Comment contester une note ?',
  'Quels sont les délais de traitement ?',
  'Comment suivre ma requête ?',
];

// ─── Composant ─────────────────────────────────────────────────────────────
const idCounter = { n: 100 };
function uid() { return ++idCounter.n; }

const MSG_BIENVENUE = {
  id: 1,
  contenu: 'Bonjour ! Je suis l\'assistant Janngo 👋\nJe peux vous aider avec vos démarches administratives.\n\nSur quoi puis-je vous aider ?',
  expediteur: 'CHATBOT',
  dateEnvoi: new Date(),
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([MSG_BIENVENUE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      inputRef.current?.focus();
    }
  }, [messages, open]);

  const envoyerMessage = (texte) => {
    const msg = texte.trim();
    if (!msg || isTyping) return;

    const msgUser = { id: uid(), contenu: msg, expediteur: 'ETUDIANT', dateEnvoi: new Date() };
    setMessages((prev) => [...prev, msgUser]);
    setInput('');
    setShowSuggestions(false);
    setIsTyping(true);

    // Simuler un délai de "frappe" pour un effet naturel
    const delai = 400 + Math.random() * 400;
    setTimeout(() => {
      const reponse = trouverReponse(msg);
      setMessages((prev) => [...prev, {
        id: uid(), contenu: reponse, expediteur: 'CHATBOT', dateEnvoi: new Date(),
      }]);
      setIsTyping(false);
    }, delai);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    envoyerMessage(input);
  };

  const handleSuggestion = (suggestion) => {
    envoyerMessage(suggestion);
  };

  const handleReset = () => {
    setMessages([MSG_BIENVENUE]);
    setInput('');
    setShowSuggestions(true);
    setIsTyping(false);
  };

  return (
    <>
      {/* ── Bouton flottant ── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-40 hover:scale-110 active:scale-95"
        title="Assistant Janngo"
        aria-label="Ouvrir le chatbot"
      >
        {open
          ? <span className="text-xl font-bold">✕</span>
          : <img src="/logojanngo.png" alt="" className="w-9 h-9 object-contain rounded-full"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span class="text-2xl">💬</span>'; }} />
        }
      </button>

      {/* ── Fenêtre chat ── */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 p-1">
              <img src="/logojanngo.png" alt="" className="w-full h-full object-contain"
                onError={(e) => { e.target.parentElement.innerHTML = '<span class="text-blue-600 font-black text-lg">J</span>'; }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Assistant Janngo</h3>
              <p className="text-blue-200 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                En ligne · Réponse instantanée
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-blue-200 hover:text-white transition-colors text-xs px-2 py-1 rounded hover:bg-blue-500"
              title="Nouvelle conversation"
            >
              🔄
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.expediteur === 'ETUDIANT' ? 'justify-end' : 'justify-start'}`}>
                {msg.expediteur === 'CHATBOT' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-auto mb-1">
                    <span className="text-xs">🤖</span>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.expediteur === 'ETUDIANT'
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.contenu}</p>
                  <p className={`text-xs mt-1.5 ${msg.expediteur === 'ETUDIANT' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.dateEnvoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs bg-white text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex gap-2 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-colors flex-shrink-0"
              aria-label="Envoyer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
