import ApperIcon from '@/components/ApperIcon';

const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
  
  const stateClasses = error 
    ? 'border-error focus:ring-error' 
    : 'border-gray-300 hover:border-gray-400';
  
  const classes = `${baseClasses} ${stateClasses} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${icon ? 'pl-10' : ''} ${className}`;

  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ApperIcon name={icon} size={16} className="text-gray-400" />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={classes}
        {...props}
      />
    </div>
  );
};

export default Input;