import { Loader } from 'lucide-react';

const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <Loader className="w-full h-full text-blue-600" />
      </div>
      {text && <p className="mt-4 text-gray-600 text-center">{text}</p>}
    </div>
  );
};

export default Loading;