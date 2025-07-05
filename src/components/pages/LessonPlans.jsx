import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import LessonPlanTable from '@/components/organisms/LessonPlanTable';
import UploadModal from '@/components/organisms/UploadModal';
import EditLessonPlanModal from '@/components/organisms/EditLessonPlanModal';
import { lessonPlanService } from '@/services/api/lessonPlanService';

const LessonPlans = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadLessonPlans();
  }, []);

  useEffect(() => {
    filterAndSortPlans();
  }, [lessonPlans, searchTerm, filterSubject, filterStatus, sortBy, sortOrder]);

  const loadLessonPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await lessonPlanService.getAll();
      setLessonPlans(data);
    } catch (err) {
      setError('Failed to load lesson plans');
      console.error('Lesson plans error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPlans = () => {
    let filtered = lessonPlans;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (filterSubject !== 'all') {
      filtered = filtered.filter(plan => plan.subject === filterSubject);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'filename':
          aVal = a.filename.toLowerCase();
          bVal = b.filename.toLowerCase();
          break;
        case 'subject':
          aVal = a.subject.toLowerCase();
          bVal = b.subject.toLowerCase();
          break;
        case 'class':
          aVal = a.class.toLowerCase();
          bVal = b.class.toLowerCase();
          break;
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.createdAt;
          bVal = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredPlans(filtered);
  };

  const handleUpload = async (uploadData) => {
    try {
      const newPlan = await lessonPlanService.create(uploadData);
      setLessonPlans(prev => [...prev, newPlan]);
      toast.success('Lesson plan uploaded successfully');
      setIsUploadModalOpen(false);
    } catch (err) {
      toast.error('Failed to upload lesson plan');
      console.error('Upload error:', err);
    }
  };

  const handleDelete = async (planId) => {
    try {
      await lessonPlanService.delete(planId);
      setLessonPlans(prev => prev.filter(p => p.Id !== planId));
      toast.success('Lesson plan deleted successfully');
    } catch (err) {
      toast.error('Failed to delete lesson plan');
      console.error('Delete error:', err);
    }
  };

  const handleStatusUpdate = async (planId, newStatus) => {
    try {
      await lessonPlanService.update(planId, { status: newStatus });
      setLessonPlans(prev => prev.map(p => 
        p.Id === planId ? { ...p, status: newStatus } : p
      ));
      toast.success(`Lesson plan marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error('Status update error:', err);
    }
}
  };

  const handleEdit = (lessonPlan) => {
    setSelectedLessonPlan(lessonPlan);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (planId, formData) => {
    try {
      const updatedPlan = await lessonPlanService.updateContent(planId, formData);
      setLessonPlans(prev => prev.map(p => 
        p.Id === planId ? updatedPlan : p
      ));
      setIsEditModalOpen(false);
      setSelectedLessonPlan(null);
    } catch (error) {
      throw error;
    }
  };

  const getUniqueSubjects = () => {
    const subjects = [...new Set(lessonPlans.map(plan => plan.subject))];
    return subjects.sort();

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLessonPlans} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Lesson Plans
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track your lesson plan documents
          </p>
        </div>
        <Button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Upload" size={16} />
          <span>Upload Plan</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="FileText" size={24} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{lessonPlans.length}</h3>
            <p className="text-sm text-gray-600">Total Plans</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="Clock" size={24} className="text-warning" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {lessonPlans.filter(p => p.status === 'pending').length}
            </h3>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-info/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="Play" size={24} className="text-info" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {lessonPlans.filter(p => p.status === 'processing').length}
            </h3>
            <p className="text-sm text-gray-600">Processing</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="CheckCircle" size={24} className="text-success" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {lessonPlans.filter(p => p.status === 'completed').length}
            </h3>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="filename">Filename</option>
                <option value="subject">Subject</option>
                <option value="class">Class</option>
                <option value="status">Status</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Lesson Plans Table */}
      <Card>
        <div className="p-6">
          {filteredPlans.length > 0 ? (
<LessonPlanTable
              lessonPlans={filteredPlans}
              onDelete={handleDelete}
              onStatusUpdate={handleStatusUpdate}
              onEdit={handleEdit}
            />
          ) : lessonPlans.length === 0 ? (
            <Empty
              icon="FileText"
              title="No lesson plans uploaded"
              description="Start by uploading your first lesson plan document"
              action={
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  <ApperIcon name="Upload" size={16} />
                  Upload Lesson Plan
                </Button>
              }
            />
          ) : (
            <Empty
              icon="Search"
              title="No plans match your filters"
              description="Try adjusting your search or filter criteria"
              action={
                <Button onClick={() => {
                  setSearchTerm('');
                  setFilterSubject('all');
                  setFilterStatus('all');
                }}>
                  Clear Filters
                </Button>
              }
            />
          )}
        </div>
      </Card>

{/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* Edit Modal */}
      <EditLessonPlanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLessonPlan(null);
        }}
        lessonPlan={selectedLessonPlan}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default LessonPlans;