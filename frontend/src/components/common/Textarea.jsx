export const Textarea = ({
  value,
  onChange,
  placeholder = '',
  rows = 4,
  disabled = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`input-base ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-error mt-1">{error}</p>}
    </div>
  );
};