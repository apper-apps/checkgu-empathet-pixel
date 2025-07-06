import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import TimetableEditor from "@/components/organisms/TimetableEditor";
import SubjectModal from "@/components/organisms/SubjectModal";
import SubjectTable from "@/components/organisms/SubjectTable";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { timetableService } from "@/services/api/timetableService";
import { subjectService } from "@/services/api/subjectService";

const Schedule = () => {
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('subjects');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [subjectsData, timetableData] = await Promise.all([
        subjectService.getAll(),
        timetableService.getAll()
      ]);
      
      setSubjects(subjectsData);
      setTimetable(timetableData);
    } catch (err) {
      setError('Failed to load schedule data');
      console.error('Schedule error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (subjectData) => {
    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.Id, subjectData);
        setSubjects(prev => prev.map(s => 
          s.Id === editingSubject.Id ? { ...s, ...subjectData } : s
        ));
        toast.success('Subject updated successfully');
      } else {
        const newSubject = await subjectService.create(subjectData);
        setSubjects(prev => [...prev, newSubject]);
        toast.success('Subject added successfully');
      }
      setIsModalOpen(false);
      setEditingSubject(null);
    } catch (err) {
      toast.error('Failed to save subject');
      console.error('Save subject error:', err);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      await subjectService.delete(subjectId);
      setSubjects(prev => prev.filter(s => s.Id !== subjectId));
      toast.success('Subject deleted successfully');
    } catch (err) {
      toast.error('Failed to delete subject');
      console.error('Delete subject error:', err);
    }
  };

  const handleTimetableUpdate = async (updatedTimetable) => {
    try {
      setTimetable(updatedTimetable);
      toast.success('Timetable updated successfully');
    } catch (err) {
      toast.error('Failed to update timetable');
      console.error('Timetable update error:', err);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadScheduleData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Schedule Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your subjects and weekly timetable
          </p>
        </div>
        <Button 
          onClick={handleAddSubject}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Add Subject</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subjects'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subjects & Classes
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timetable'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Weekly Timetable
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'subjects' && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Subjects & Classes
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSubject}
              >
                <ApperIcon name="Plus" size={16} />
                Add Subject
              </Button>
            </div>
          </div>
          <div className="p-6">
            {subjects.length > 0 ? (
              <SubjectTable
                subjects={subjects}
                onEdit={handleEditSubject}
                onDelete={handleDeleteSubject}
              />
            ) : (
              <Empty
                icon="BookOpen"
                title="No subjects added yet"
                description="Add your subjects and classes to start building your timetable"
                action={
                  <Button onClick={handleAddSubject}>
                    <ApperIcon name="Plus" size={16} />
                    Add Subject
                  </Button>
                }
              />
            )}
          </div>
        </Card>
      )}

{activeTab === 'timetable' && (
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-display">
              Browse Lesson Plans
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Navigate through weeks to find and access your lesson plans
            </p>
          </div>
          <div className="p-6">
{timetable.length > 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-600">Timetable data loaded successfully. Use the timetable editor above to manage your schedule.</p>
              </Card>
            ) : (
              <Empty
                icon="Calendar"
                title="No timetable available"
                description="Set up your weekly timetable to browse lesson plans by week"
                action={
                  <Button onClick={() => setActiveTab('subjects')}>
                    <ApperIcon name="BookOpen" size={16} />
                    Add Subjects
                  </Button>
                }
              />
            )}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="BookOpen" size={24} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{subjects.length}</h3>
            <p className="text-sm text-gray-600">Total Subjects</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="Calendar" size={24} className="text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{timetable.length}</h3>
            <p className="text-sm text-gray-600">Weekly Classes</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <ApperIcon name="Clock" size={24} className="text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {timetable.reduce((total, slot) => {
                const subject = subjects.find(s => s.name === slot.subject);
                return total + (subject ? subject.duration : 0);
              }, 0)}
            </h3>
            <p className="text-sm text-gray-600">Minutes per Week</p>
          </div>
        </Card>
      </div>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        subject={editingSubject}
      />
    </div>
  );
};

export default Schedule;