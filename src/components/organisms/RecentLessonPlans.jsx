import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Empty from '@/components/ui/Empty';

const RecentLessonPlans = ({ lessonPlans, onView }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'processing':
        return 'bg-info text-white';
      case 'pending':
        return 'bg-warning text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'processing':
        return 'Loader2';
      case 'pending':
        return 'Clock';
      default:
        return 'FileText';
    }
  };

  if (lessonPlans.length === 0) {
    return (
      <Empty
        icon="FileText"
        title="No lesson plans yet"
        description="Upload your first lesson plan to get started"
        compact
      />
    );
  }

  return (
    <div className="space-y-4">
      {lessonPlans.map((plan) => (
        <div
          key={plan.Id}
          className="lesson-plan-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer"
          onClick={() => onView(plan)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {plan.filename}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {plan.subject} • {plan.class}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(plan.date), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                <ApperIcon 
                  name={getStatusIcon(plan.status)} 
                  size={12} 
                  className={`mr-1 ${plan.status === 'processing' ? 'animate-spin' : ''}`} 
                />
                {plan.status}
              </span>
              <Button variant="ghost" size="sm">
                <ApperIcon name="ExternalLink" size={14} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentLessonPlans;