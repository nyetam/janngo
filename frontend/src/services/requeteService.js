import api from './api';

const requeteService = {
  async lister() {
    const { data } = await api.get('/requetes');
    return data;
  },

  async detail(id) {
    const { data } = await api.get(`/requetes/${id}`);
    return data;
  },

  async creerAttestation(formData) {
    const { data } = await api.post('/requetes/attestation', formData);
    return data;
  },

  async creerCorrectionNom(formData) {
    const { data } = await api.post('/requetes/correction-nom', formData);
    return data;
  },

  async creerContestationNote(formData) {
    const { data } = await api.post('/requetes/contestation-note', formData);
    return data;
  },

  async changerStatut(id, statut, motif) {
    const { data } = await api.patch(`/requetes/${id}/statut`, { statut, motif });
    return data;
  },

  async historique(id) {
    const { data } = await api.get(`/requetes/${id}/historique`);
    return data;
  },

  async transmettreAttestation(id, motif) {
    const { data } = await api.patch(`/requetes/attestation/${id}/transmettre`, { motif });
    return data;
  },

  async orienterAttestation(id, serviceTraitant, motif) {
    const { data } = await api.patch(`/requetes/attestation/${id}/orienter`, { serviceTraitant, motif });
    return data;
  },

  async resultatAttestation(id, decision, motif) {
    const { data } = await api.patch(`/requetes/attestation/${id}/resultat`, { decision, motif });
    return data;
  },

  async transmettreCorrectionNom(id, motif) {
    const { data } = await api.patch(`/requetes/correction-nom/${id}/transmettre`, { motif });
    return data;
  },

  async validerCorrectionNom(id, decision, motif) {
    const { data } = await api.patch(`/requetes/correction-nom/${id}/valider`, { decision, motif });
    return data;
  },

  async modifierCorrectionNom(id, commentaire) {
    const { data } = await api.patch(`/requetes/correction-nom/${id}/modifier`, { commentaire });
    return data;
  },

  async analyserContestation(id, motif) {
    const { data } = await api.patch(`/requetes/contestation-note/${id}/analyser`, { motif });
    return data;
  },

  async resultatContestation(id, decision, decisionDepartement, noteCorrigee) {
    const { data } = await api.patch(`/requetes/contestation-note/${id}/resultat`, { decision, decisionDepartement, noteCorrigee });
    return data;
  },

  async modifierNote(id, noteCorrigee, commentaire) {
    const { data } = await api.patch(`/requetes/contestation-note/${id}/modifier-note`, { noteCorrigee, commentaire });
    return data;
  },
};

export default requeteService;
