import { NavLink } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/calendar', label: 'Calendar', icon: 'Calendar' },
    { path: '/schedule', label: 'Schedule', icon: 'Clock' },
    { path: '/lesson-plans', label: 'Lesson Plans', icon: 'FileText' },
    { path: '/settings', label: 'Settings', icon: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <ApperIcon name="BookOpen" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">Checkgu</h1>
            <p className="text-xs text-gray-600">Lesson Planning</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-l-4 border-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <ApperIcon name={item.icon} size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-800">Quick Tip</p>
          <p className="text-xs text-gray-600 mt-1">
            Upload your lesson plans to automatically replace placeholders with your schedule data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;