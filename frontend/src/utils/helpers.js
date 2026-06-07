import { STATUTS } from './constants';

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getStatutBadge = (statut) => {
  const s = STATUTS[statut];
  if (!s) return <span className="badge-attente">{statut}</span>;
  const classes = {
    attente: 'badge-attente',
    cours: 'badge-cours',
    validee: 'badge-validee',
    rejetee: 'badge-rejetee',
    cloturee: 'badge-cloturee',
  };
  return classes[s.color] || 'badge-attente';
};

export const getStatutLabel = (statut) => STATUTS[statut]?.label || statut;

export const getStatutClass = (statut) => {
  const map = {
    EN_ATTENTE: 'badge-attente',
    ATTENTE_INFO: 'badge-attente',
    EN_COURS: 'badge-cours',
    VALIDEE: 'badge-validee',
    REJETEE: 'badge-rejetee',
    CLOTUREE: 'badge-cloturee',
  };
  return map[statut] || 'badge-attente';
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
