import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import CalendarGrid from '@/components/organisms/CalendarGrid';
import HolidayModal from '@/components/organisms/HolidayModal';
import { holidayService } from '@/services/api/holidayService';

const Calendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await holidayService.getAll();
      setHolidays(data);
    } catch (err) {
      setError('Failed to load holidays');
      console.error('Calendar error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = (date) => {
    setSelectedDate(date);
    setEditingHoliday(null);
    setIsModalOpen(true);
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setIsModalOpen(true);
  };

  const handleSaveHoliday = async (holidayData) => {
    try {
      if (editingHoliday) {
        await holidayService.update(editingHoliday.Id, holidayData);
        setHolidays(prev => prev.map(h => 
          h.Id === editingHoliday.Id ? { ...h, ...holidayData } : h
        ));
        toast.success('Holiday updated successfully');
      } else {
        const newHoliday = await holidayService.create(holidayData);
        setHolidays(prev => [...prev, newHoliday]);
        toast.success('Holiday added successfully');
      }
      setIsModalOpen(false);
      setEditingHoliday(null);
      setSelectedDate(null);
    } catch (err) {
      toast.error('Failed to save holiday');
      console.error('Save holiday error:', err);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    try {
      await holidayService.delete(holidayId);
      setHolidays(prev => prev.filter(h => h.Id !== holidayId));
      toast.success('Holiday deleted successfully');
    } catch (err) {
      toast.error('Failed to delete holiday');
      console.error('Delete holiday error:', err);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getHolidaysForDate = (date) => {
    return holidays.filter(holiday => 
      isSameDay(new Date(holiday.startDate), date) ||
      (new Date(holiday.startDate) <= date && date <= new Date(holiday.endDate))
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadHolidays} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Academic Calendar
          </h1>
          <p className="text-gray-600 mt-1">
            Manage school holidays and academic year schedule
          </p>
        </div>
        <Button 
          onClick={() => handleAddHoliday(new Date())}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Add Holiday</span>
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="p-6">
          <CalendarGrid
            currentDate={currentDate}
            holidays={holidays}
            onDateClick={handleAddHoliday}
            onHolidayClick={handleEditHoliday}
            getHolidaysForDate={getHolidaysForDate}
          />
        </div>
      </Card>

      {/* Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Upcoming Holidays
              </h3>
            </div>
            <div className="p-6">
              {holidays.length > 0 ? (
                <div className="space-y-4">
                  {holidays
                    .filter(holiday => new Date(holiday.startDate) >= new Date())
                    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                    .slice(0, 5)
                    .map(holiday => (
                      <div
                        key={holiday.Id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            holiday.type === 'semester-break' ? 'bg-primary' :
                            holiday.type === 'public-holiday' ? 'bg-success' :
                            'bg-warning'
                          }`} />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {holiday.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {format(new Date(holiday.startDate), 'MMM dd')} - 
                              {format(new Date(holiday.endDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditHoliday(holiday)}
                          >
                            <ApperIcon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHoliday(holiday.Id)}
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <Empty
                  icon="Calendar"
                  title="No holidays scheduled"
                  description="Add school holidays and breaks to your calendar"
                  action={
                    <Button onClick={() => handleAddHoliday(new Date())}>
                      <ApperIcon name="Plus" size={16} />
                      Add Holiday
                    </Button>
                  }
                />
              )}
            </div>
          </Card>
        </div>

        {/* Academic Year Info */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-display">
              Academic Year
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Calendar" size={24} className="text-primary" />
                <div>
                  <h4 className="font-medium text-gray-900">2024/2025</h4>
                  <p className="text-sm text-gray-600">Current Academic Year</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Start Date</span>
                <span className="text-sm font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">End Date</span>
                <span className="text-sm font-medium">Dec 20, 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Holidays</span>
                <span className="text-sm font-medium">{holidays.length}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <ApperIcon name="Settings" size={16} />
              Configure Academic Year
            </Button>
          </div>
        </Card>
      </div>

      {/* Holiday Modal */}
      <HolidayModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHoliday(null);
          setSelectedDate(null);
        }}
        onSave={handleSaveHoliday}
        holiday={editingHoliday}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;