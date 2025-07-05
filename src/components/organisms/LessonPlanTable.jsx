import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { exportToPDF, exportToDOCX } from '@/utils/documentExport';

const LessonPlanTable = ({ lessonPlans, onDelete, onStatusUpdate, onEdit }) => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(null);
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lessonPlans.map((plan) => (
            <tr key={plan.Id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mr-3">
                    <ApperIcon name="FileText" size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{plan.filename}</div>
                    <div className="text-sm text-gray-500">{plan.duration} mins</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {plan.subject}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {plan.class}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(plan.date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                  <ApperIcon 
                    name={getStatusIcon(plan.status)} 
                    size={12} 
                    className={`mr-1 ${plan.status === 'processing' ? 'animate-spin' : ''}`} 
                  />
                  {plan.status}
                </span>
              </td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusUpdate(plan.Id, 'completed')}
                    disabled={plan.status === 'completed'}
                    title="Mark as completed"
                  >
                    <ApperIcon name="CheckCircle" size={16} />
                  </Button>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDownloadMenu(showDownloadMenu === plan.Id ? null : plan.Id)}
                      disabled={downloadingId === plan.Id}
                      title="Download lesson plan"
                    >
                      {downloadingId === plan.Id ? (
                        <ApperIcon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <ApperIcon name="Download" size={16} />
                      )}
                    </Button>
                    
                    {showDownloadMenu === plan.Id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleDownload(plan, 'pdf')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <ApperIcon name="FileText" size={16} />
                            <span>Download as PDF</span>
                          </button>
                          <button
                            onClick={() => handleDownload(plan, 'docx')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <ApperIcon name="FileText" size={16} />
                            <span>Download as DOCX</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(plan)}
                    title="Edit lesson plan"
                  >
                    <ApperIcon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(plan.Id)}
                    title="Delete lesson plan"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleDownload = async (plan, format) => {
    try {
      setDownloadingId(plan.Id);
      setShowDownloadMenu(null);
      
      if (format === 'pdf') {
        exportToPDF(plan);
        toast.success('PDF downloaded successfully');
      } else if (format === 'docx') {
        await exportToDOCX(plan);
        toast.success('DOCX downloaded successfully');
      }
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()}`);
      console.error('Download error:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  // Close download menu when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.relative')) {
      setShowDownloadMenu(null);
    }
  };

  // Add click outside listener
  if (showDownloadMenu) {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }
};

export default LessonPlanTable;