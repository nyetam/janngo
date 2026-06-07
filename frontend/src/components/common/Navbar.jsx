import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchNotifications, marquerLu } from '../../store/notificationSlice';
import { formatDateTime } from '../../utils/helpers';

export default function Navbar({ title }) {
  const dispatch = useDispatch();
  const { utilisateur } = useSelector((s) => s.auth);
  const { liste } = useSelector((s) => s.notifications);
  const [showNotifs, setShowNotifs] = useState(false);
  const nonLues = liste.filter((n) => !n.lu).length;

  useEffect(() => {
    if (utilisateur?.role === 'ETUDIANT') {
      dispatch(fetchNotifications());
      const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
      return () => clearInterval(interval);
    }
  }, [utilisateur]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-4">
        {utilisateur?.role === 'ETUDIANT' && (
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              🔔
              {nonLues > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {nonLues > 9 ? '9+' : nonLues}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {liste.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">Aucune notification</p>
                  ) : (
                    liste.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.lu && dispatch(marquerLu(n.id))}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${!n.lu ? 'bg-blue-50' : ''}`}
                      >
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.dateEnvoi)}</p>
                        {!n.lu && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-700 leading-tight">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
