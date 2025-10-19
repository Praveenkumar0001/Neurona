export const Avatar = ({ src, alt = 'Avatar', size = 'md', name = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold flex-shrink-0`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
};

export default {Avatar };