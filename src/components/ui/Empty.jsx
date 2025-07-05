import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Empty = ({ 
  icon = 'FileText', 
  title = 'No data available', 
  description = 'There is no data to display at the moment.',
  action,
  compact = false 
}) => {
  return (
    <div className={`flex items-center justify-center ${compact ? 'py-8' : 'min-h-[400px]'}`}>
      <div className="text-center max-w-md">
        <div className={`w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center ${compact ? 'w-12 h-12' : ''}`}>
          <ApperIcon name={icon} size={compact ? 24 : 32} className="text-gray-400" />
        </div>
        <h3 className={`font-semibold text-gray-900 mb-2 ${compact ? 'text-base' : 'text-lg'}`}>
          {title}
        </h3>
        <p className={`text-gray-600 mb-6 ${compact ? 'text-sm' : ''}`}>
          {description}
        </p>
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default Empty;