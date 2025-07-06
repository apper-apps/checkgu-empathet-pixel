import { format, isSameDay } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';

const TimetableGrid = ({ timetable, highlightToday = false, onCellClick, lessonPlans = [] }) => {
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const today = new Date();
  const currentDay = format(today, 'EEEE').toLowerCase();

  const getClassForSlot = (day, time) => {
    return timetable.find(slot => 
      slot.day.toLowerCase() === day && slot.time === time
    );
  };

  const getLessonPlanForSlot = (day, time) => {
    const classData = getClassForSlot(day, time);
    if (!classData) return null;
    
    return lessonPlans.find(plan => 
      plan.subject === classData.subject && 
      plan.class === classData.class
    );
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
      'English': 'bg-green-100 text-green-800 border-green-200',
      'Science': 'bg-purple-100 text-purple-800 border-purple-200',
      'History': 'bg-orange-100 text-orange-800 border-orange-200',
      'Geography': 'bg-teal-100 text-teal-800 border-teal-200',
      'Art': 'bg-pink-100 text-pink-800 border-pink-200',
      'Physical Education': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="timetable-grid">
          {/* Header */}
          <div className="timetable-cell bg-gray-50 font-medium text-gray-700 flex items-center justify-center">
            Time
          </div>
          {dayLabels.map((day, index) => (
            <div
              key={day}
              className={`timetable-cell font-medium text-center flex items-center justify-center ${
                highlightToday && currentDay === days[index]
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-2 border-primary/30'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map(time => (
            <div key={time} className="timetable-row">
              <div className="timetable-cell bg-gray-50 font-medium text-gray-700 flex items-center justify-center">
                {time}
              </div>
              {days.map(day => {
                const classData = getClassForSlot(day, time);
                const lessonPlan = getLessonPlanForSlot(day, time);
                const isCurrentDay = highlightToday && currentDay === day;
                
                return (
                  <div
                    key={`${day}-${time}`}
                    className={`timetable-cell flex items-center justify-center p-2 ${
                      isCurrentDay ? 'current-day' : ''
                    } ${classData ? 'has-class' : ''} ${
                      lessonPlan ? 'cursor-pointer hover:bg-gray-50' : ''
                    }`}
                    onClick={() => onCellClick && onCellClick({ day, time, class: classData, lessonPlan })}
                  >
                    {classData ? (
                      <div className={`w-full h-full rounded-md border-2 p-2 flex flex-col items-center justify-center text-center transition-all ${
                        lessonPlan ? 'hover:shadow-md hover:scale-105' : 'opacity-60'
                      } ${getSubjectColor(classData.subject)}`}>
                        <div className="font-medium text-sm">{classData.subject}</div>
                        <div className="text-xs opacity-80">{classData.class}</div>
                        {classData.room && (
                          <div className="text-xs opacity-60 flex items-center mt-1">
                            <ApperIcon name="MapPin" size={12} className="mr-1" />
                            {classData.room}
                          </div>
                        )}
                        {lessonPlan && (
                          <div className="text-xs opacity-60 flex items-center mt-1">
                            <ApperIcon name="FileText" size={12} className="mr-1" />
                            <span>Lesson Plan</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;