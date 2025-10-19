export const Alert = ({ type = 'info', title, message, onClose = () => {} }) => {
  const types = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
  };

  return (
    <div className={`border rounded-lg p-4 ${types[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          {message && <p className="text-sm">{message}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-xl opacity-50 hover:opacity-100 flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default {
  Alert,
};