import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';

const EditLessonPlanModal = ({ isOpen, onClose, lessonPlan, onSave }) => {
  const [formData, setFormData] = useState({
    filename: '',
    subject: '',
    class: '',
    duration: '',
    objectives: '',
    materials: '',
    activities: '',
    assessment: '',
    homework: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonPlan) {
      setFormData({
        filename: lessonPlan.filename || '',
        subject: lessonPlan.subject || '',
        class: lessonPlan.class || '',
        duration: lessonPlan.duration || '',
        objectives: lessonPlan.objectives || '',
        materials: lessonPlan.materials || '',
        activities: lessonPlan.activities || '',
        assessment: lessonPlan.assessment || '',
        homework: lessonPlan.homework || '',
        notes: lessonPlan.notes || ''
      });
    }
  }, [lessonPlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.filename.trim()) {
      toast.error('Filename is required');
      return;
    }

    setLoading(true);
    try {
      await onSave(lessonPlan.Id, formData);
      toast.success('Lesson plan updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update lesson plan');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Lesson Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filename *
                </label>
                <Input
                  type="text"
                  value={formData.filename}
                  onChange={(e) => handleChange('filename', e.target.value)}
                  placeholder="Enter filename"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <Input
                  type="text"
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  placeholder="Enter class"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="Enter duration"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) => handleChange('objectives', e.target.value)}
                placeholder="Enter learning objectives"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials Needed
              </label>
              <textarea
                value={formData.materials}
                onChange={(e) => handleChange('materials', e.target.value)}
                placeholder="Enter materials needed"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activities & Procedures
              </label>
              <textarea
                value={formData.activities}
                onChange={(e) => handleChange('activities', e.target.value)}
                placeholder="Enter activities and procedures"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Methods
              </label>
              <textarea
                value={formData.assessment}
                onChange={(e) => handleChange('assessment', e.target.value)}
                placeholder="Enter assessment methods"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Homework Assignment
              </label>
              <textarea
                value={formData.homework}
                onChange={(e) => handleChange('homework', e.target.value)}
                placeholder="Enter homework assignment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Enter additional notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <ApperIcon name="Save" size={16} />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditLessonPlanModal;