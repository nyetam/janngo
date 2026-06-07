import { useState, useMemo } from 'react';

/**
 * Hook réutilisable : filtre une liste de requêtes par période
 * et expose un sélecteur de période + bouton actualiser.
 */
export function usePeriodFilter(liste) {
  const [periode, setPeriode] = useState('all');

  const filtree = useMemo(() => {
    if (!liste?.length) return [];
    if (periode === 'all') return liste;

    const maintenant = new Date();
    const debut = new Date();

    if (periode === 'today') {
      debut.setHours(0, 0, 0, 0);
    } else if (periode === 'week') {
      const jourSemaine = maintenant.getDay() || 7;
      debut.setDate(maintenant.getDate() - jourSemaine + 1);
      debut.setHours(0, 0, 0, 0);
    } else if (periode === 'month') {
      debut.setDate(1);
      debut.setHours(0, 0, 0, 0);
    }

    return liste.filter((r) => new Date(r.dateDepot) >= debut);
  }, [liste, periode]);

  return { filtree, periode, setPeriode };
}

export const PERIODES = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'all', label: 'Tout' },
];

/**
 * Composant PeriodSelector réutilisable
 */
export function PeriodSelector({ periode, onChange, onRefresh, loading }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
        {PERIODES.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-gray-200 last:border-0 ${
              periode === p.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        title="Actualiser"
      >
        <span className={loading ? 'animate-spin inline-block' : ''}>🔄</span>
        Actualiser
      </button>
    </div>
  );
}
