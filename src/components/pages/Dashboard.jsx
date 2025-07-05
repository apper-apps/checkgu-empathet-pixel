import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import TimetableGrid from '@/components/organisms/TimetableGrid';
import StatsCard from '@/components/molecules/StatsCard';
import RecentLessonPlans from '@/components/organisms/RecentLessonPlans';
import { timetableService } from '@/services/api/timetableService';
import { lessonPlanService } from '@/services/api/lessonPlanService';

const Dashboard = () => {
  const [timetable, setTimetable] = useState([]);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingClass, setUpcomingClass] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Check for upcoming classes every minute
    const interval = setInterval(checkUpcomingClasses, 60000);
    return () => clearInterval(interval);
  }, [timetable]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [timetableData, lessonPlansData] = await Promise.all([
        timetableService.getAll(),
        lessonPlanService.getAll()
      ]);
      
      setTimetable(timetableData);
      setLessonPlans(lessonPlansData);
      checkUpcomingClasses(timetableData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingClasses = (timetableData = timetable) => {
    const now = new Date();
    const currentDay = format(now, 'EEEE').toLowerCase();
    const currentTime = format(now, 'HH:mm');

    const todayClasses = timetableData.filter(slot => 
      slot.day.toLowerCase() === currentDay
    );

    for (const classSlot of todayClasses) {
      const [hour, minute] = classSlot.time.split(':');
      const classTime = new Date();
      classTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      
      const timeDiff = classTime - now;
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      if (minutesDiff === 5) {
        setUpcomingClass(classSlot);
        toast.info(`Class starting in 5 minutes: ${classSlot.subject} in ${classSlot.room}`, {
          autoClose: 10000,
        });
        break;
      }
    }
  };

  const getStats = () => {
    const today = new Date();
    const todayPlans = lessonPlans.filter(plan => 
      isSameDay(new Date(plan.date), today)
    );
    
    const pendingPlans = lessonPlans.filter(plan => 
      plan.status === 'pending'
    );

    const completedPlans = lessonPlans.filter(plan => 
      plan.status === 'completed'
    );

    return {
      todayPlans: todayPlans.length,
      pendingPlans: pendingPlans.length,
      completedPlans: completedPlans.length,
      totalPlans: lessonPlans.length,
    };
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display">Welcome back!</h2>
            <p className="text-blue-100 mt-1">
              Ready to make today's lessons amazing?
            </p>
          </div>
          <div className="hidden md:block">
            <ApperIcon name="BookOpen" size={48} className="text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Lessons"
          value={stats.todayPlans}
          icon="Calendar"
          color="primary"
        />
        <StatsCard
          title="Pending Plans"
          value={stats.pendingPlans}
          icon="Clock"
          color="warning"
        />
        <StatsCard
          title="Completed"
          value={stats.completedPlans}
          icon="CheckCircle"
          color="success"
        />
        <StatsCard
          title="Total Plans"
          value={stats.totalPlans}
          icon="FileText"
          color="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Weekly Timetable
              </h3>
              <Button variant="outline" size="sm">
                <ApperIcon name="Plus" size={16} />
                Add Class
              </Button>
            </div>
            <div className="p-6">
              {timetable.length > 0 ? (
                <TimetableGrid 
                  timetable={timetable} 
                  highlightToday={true}
                  onCellClick={(slot) => {
                    toast.info(`Selected: ${slot.subject} at ${slot.time}`);
                  }}
                />
              ) : (
                <Empty
                  icon="Calendar"
                  title="No timetable set up"
                  description="Add your class schedule to see your weekly timetable"
                  action={
                    <Button>
                      <ApperIcon name="Plus" size={16} />
                      Set up timetable
                    </Button>
                  }
                />
              )}
            </div>
          </Card>
        </div>

        {/* Recent Lesson Plans */}
        <div>
          <Card>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Recent Lesson Plans
              </h3>
              <Button variant="outline" size="sm">
                <ApperIcon name="Plus" size={16} />
                Upload
              </Button>
            </div>
            <div className="p-6">
              <RecentLessonPlans 
                lessonPlans={lessonPlans.slice(0, 5)} 
                onView={(plan) => {
                  toast.info(`Viewing: ${plan.filename}`);
                }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="primary"
              className="flex items-center justify-center space-x-2 p-4"
            >
              <ApperIcon name="Upload" size={20} />
              <span>Upload Lesson Plan</span>
            </Button>
            <Button 
              variant="outline"
              className="flex items-center justify-center space-x-2 p-4"
            >
              <ApperIcon name="Calendar" size={20} />
              <span>View Calendar</span>
            </Button>
            <Button 
              variant="outline"
              className="flex items-center justify-center space-x-2 p-4"
            >
              <ApperIcon name="Settings" size={20} />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;