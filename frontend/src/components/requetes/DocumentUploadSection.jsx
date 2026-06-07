/**
 * Section d'upload d'un document dans un formulaire de soumission.
 * Gestion locale du fichier avant soumission (URL.createObjectURL pour aperçu).
 */
export default function DocumentUploadSection({ label, typeDoc, required = true, optional = false, file, onChange, onRemove }) {
  const hasFile = !!file;
  const isOptional = optional || !required;

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onChange(f, typeDoc);
    e.target.value = '';
  };

  const handleVoir = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Couleur du cadre selon état
  const borderClass = hasFile
    ? 'border-green-300 bg-green-50'
    : isOptional
      ? 'border-dashed border-gray-300 bg-gray-50'
      : 'border-dashed border-orange-300 bg-orange-50/50';

  return (
    <div className={`rounded-xl border-2 p-3.5 transition-colors ${borderClass}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Indicateur + infos */}
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-lg mt-0.5 flex-shrink-0">
            {hasFile ? '✅' : isOptional ? '📎' : '❌'}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5 flex-wrap">
              {label}
              {isOptional && (
                <span className="text-xs text-gray-400 font-normal italic">(optionnel)</span>
              )}
              {!isOptional && !hasFile && (
                <span className="text-xs text-orange-500 font-normal">— obligatoire</span>
              )}
            </p>
            {hasFile ? (
              <div className="mt-0.5">
                <p className="text-xs text-green-700 font-medium truncate max-w-[220px]" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-green-500">{formatSize(file.size)}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">
                PDF, JPG, PNG, DOC · max 10 MB
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasFile && (
            <>
              <button
                type="button"
                onClick={handleVoir}
                className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                👁 Voir
              </button>
              <button
                type="button"
                onClick={() => onRemove(typeDoc)}
                className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                title="Supprimer"
              >
                🗑
              </button>
            </>
          )}

          <label className="text-xs bg-white text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            {hasFile ? '🔄 Changer' : '📂 Choisir'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
