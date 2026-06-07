// chatbotService.js — version locale sans API externe
const { ConversationChatbot, MessageChatbot } = require('../models');

const reglesChatbot = [
  {
    motsCles: ['attestation', 'certificat', 'diplome', 'diplôme', 'scolarite', 'scolarité'],
    reponse: `Pour une demande d'attestation, vous avez besoin de :\n    ✅ Quitus de l'année en cours\n    ✅ Copie de la CNI\n\n    Étapes : Soumettez votre demande → Le secrétariat vérifie votre éligibilité → Le directeur adjoint examine → Le département ou la scolarité traite votre dossier → Vous recevez une notification du résultat.`,
  },
  {
    motsCles: ['nom', 'correction', 'erreur', 'modifier', 'changer', 'prenom', 'prénom'],
    reponse: `Pour une correction de nom, vous avez besoin de :\n    ✅ Quitus de l'année en cours\n    ✅ Copie de la CNI\n    ✅ Lettre adressée au Directeur\n    ✅ Profil étudiant imprimé\n\n    Étapes : Soumettez votre demande → Le secrétariat vérifie → Le directeur valide → La cellule informatique modifie dans le système → Vous recevez une notification.`,
  },
  {
    motsCles: ['note', 'contester', 'contestation', 'copie', 'resultat', 'résultat', 'copie'],
    reponse: `Pour contester une note, vous avez besoin de :\n    ✅ Fiche de requête complétée et signée\n    ✅ Copie de la note contestée\n\n    Étapes : Soumettez votre contestation → Le département analyse sur la base de la liste du professeur → Si favorable, la cellule informatique met à jour votre note → Vous recevez une notification du résultat.`,
  },
  {
    motsCles: ['delai', 'délai', 'temps', 'combien', 'duree', 'durée', 'quand'],
    reponse: `Les délais de traitement habituels sont :\n    📋 Attestation : 3 à 5 jours ouvrables\n    ✏️ Correction de nom : 5 à 7 jours ouvrables\n    📝 Contestation de note : 7 à 10 jours ouvrables\n\n    Vous recevrez une notification à chaque étape de traitement.`,
  },
  {
    motsCles: ['statut', 'etat', 'état', 'avancement', 'suivi', 'ou en est', 'où en est'],
    reponse: `Pour suivre votre requête, allez dans "Mes requêtes" dans votre tableau de bord. Vous verrez le statut actuel :\n    🕐 EN_ATTENTE : Votre demande a été reçue\n    🔄 EN_COURS : En cours de traitement\n    ⏳ ATTENTE_INFO : Des informations supplémentaires sont requises\n    ✅ VALIDEE : Votre demande a été approuvée\n    ❌ REJETEE : Votre demande a été refusée\n    🔒 CLOTUREE : Dossier fermé`,
  },
  {
    motsCles: ['pieces', 'pièces', 'documents', 'fichiers', 'joindre', 'uploader', 'upload'],
    reponse: `Vous pouvez joindre vos documents directement dans le formulaire de soumission. Chaque type de requête a ses sections dédiées.\n\nFormats acceptés : PDF, JPG, PNG, DOC, DOCX\nTaille maximale : 10 MB par fichier.`,
  },
  {
    motsCles: ['mot de passe', 'password', 'connexion', 'login', 'oublie', 'oublié'],
    reponse: `Les mots de passe sont attribués par l'administration de l'IUT. Si vous avez perdu votre mot de passe, rapprochez-vous du secrétariat ou de la cellule informatique en personne.`,
  },
  {
    motsCles: ['bonjour', 'salut', 'hello', 'bonsoir', 'bonne journee', 'bonne journée', 'hi'],
    reponse: `Bonjour ! Je suis l'assistant Janngo 👋. Je peux vous aider avec :\n    📋 Demande d'attestation\n    ✏️ Correction de nom\n    📝 Contestation de note\n\n    Sur quoi puis-je vous aider ?`,
  },
  {
    motsCles: ['merci', 'thank', 'parfait', 'super', 'ok', 'genial', 'génial'],
    reponse: `De rien ! N'hésitez pas si vous avez d'autres questions. Bonne continuation ! 😊`,
  },
  {
    motsCles: ['aide', 'help', 'comment', 'que faire', 'quoi faire'],
    reponse: `Je peux vous aider sur les sujets suivants :\n    📋 Demande d'attestation\n    ✏️ Correction de nom\n    📝 Contestation de note\n    ⏱ Délais de traitement\n    📊 Suivi de requête\n    📎 Documents requis\n    🔑 Mot de passe\n\n    Posez-moi votre question !`,
  },
];

const REPONSE_DEFAUT = `Je n'ai pas bien compris votre question. Voici ce sur quoi je peux vous aider :\n\n    📋 Demande d'attestation (documents, étapes)\n    ✏️ Correction de nom (documents, étapes)\n    📝 Contestation de note (documents, étapes)\n    ⏱ Délais de traitement\n    📊 Comment suivre ma requête\n    📎 Documents à fournir\n    🔑 Problème de mot de passe\n\nPosez votre question ou cliquez sur une suggestion.`;

function trouverReponse(message) {
  const msgNorm = message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const regle of reglesChatbot) {
    for (const motCle of regle.motsCles) {
      const motNorm = motCle.normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (msgNorm.includes(motNorm)) {
        return regle.reponse;
      }
    }
  }
  return REPONSE_DEFAUT;
}

const chatbotService = {
  async envoyerMessage(etudiant_id, contenu, conversation_id = null) {
    let conversation;

    if (conversation_id) {
      conversation = await ConversationChatbot.findOne({
        where: { id: conversation_id, etudiant_id },
      });
    }

    if (!conversation) {
      conversation = await ConversationChatbot.create({ etudiant_id });
    }

    // Sauvegarder message étudiant
    await MessageChatbot.create({
      contenu,
      expediteur: 'ETUDIANT',
      type: 'QUESTION',
      conversation_id: conversation.id,
    });

    // Calculer réponse locale
    const reponseTexte = trouverReponse(contenu);

    // Sauvegarder réponse bot
    const msgBot = await MessageChatbot.create({
      contenu: reponseTexte,
      expediteur: 'CHATBOT',
      type: 'REPONSE',
      conversation_id: conversation.id,
    });

    return { conversation_id: conversation.id, reponse: msgBot };
  },

  async getHistorique(etudiant_id, conversation_id) {
    return await ConversationChatbot.findOne({
      where: { id: conversation_id, etudiant_id },
      include: [{ model: MessageChatbot, as: 'messages', order: [['dateEnvoi', 'ASC']] }],
    });
  },

  // Exposé pour tests unitaires
  trouverReponse,
};

module.exports = chatbotService;
