export const Tooltip = ({ children, text, position = 'top' }) => {
  const positions = {
    top: 'bottom-full mb-2 -translate-x-1/2 left-1/2',
    bottom: 'top-full mt-2 -translate-x-1/2 left-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-block group">
      {children}
      <div className={`absolute ${positions[position]} hidden group-hover:block z-10`}>
        <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {text}
          <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};
