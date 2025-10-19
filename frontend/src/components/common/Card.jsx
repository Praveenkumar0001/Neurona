const Card = ({ children, className = '', shadow = true, ...props }) => {
  const shadowClass = shadow ? 'shadow-md hover:shadow-lg' : '';
  
  return (
    <div
      className={`bg-white rounded-lg p-6 transition-shadow duration-200 ${shadowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;