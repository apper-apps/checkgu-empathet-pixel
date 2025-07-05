import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Header = ({ onMenuToggle, currentPath }) => {
  const getPageTitle = (path) => {
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/calendar':
        return 'Calendar';
      case '/schedule':
        return 'Schedule';
      case '/lesson-plans':
        return 'Lesson Plans';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              {getPageTitle(currentPath)}
            </h1>
            <p className="text-sm text-gray-600">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-surface px-3 py-2 rounded-lg">
            <ApperIcon name="Clock" size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {format(new Date(), 'h:mm a')}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Bell" size={20} />
          </Button>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">T</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;