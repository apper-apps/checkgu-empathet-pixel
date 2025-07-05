import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';

const CalendarGrid = ({ currentDate, holidays, onDateClick, onHolidayClick, getHolidaysForDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add padding days to start from Sunday
  const startPadding = getDay(monthStart);
  const paddingDays = [];
  for (let i = 0; i < startPadding; i++) {
    const paddingDate = new Date(monthStart);
    paddingDate.setDate(paddingDate.getDate() - (startPadding - i));
    paddingDays.push(paddingDate);
  }

  const allDays = [...paddingDays, ...days];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getHolidayType = (date) => {
    const dayHolidays = getHolidaysForDate(date);
    if (dayHolidays.length === 0) return null;
    
    const holiday = dayHolidays[0];
    switch (holiday.type) {
      case 'semester-break':
        return 'bg-primary/20 border-primary/30 text-primary';
      case 'public-holiday':
        return 'bg-success/20 border-success/30 text-success';
      case 'school-holiday':
        return 'bg-warning/20 border-warning/30 text-warning';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {dayLabels.map(day => (
          <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {allDays.map((date, index) => {
          const dayHolidays = getHolidaysForDate(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const holidayType = getHolidayType(date);
          
          return (
            <div
              key={index}
              className={`calendar-day bg-white p-2 cursor-pointer relative ${
                isToday(date) ? 'today' : ''
              } ${holidayType ? 'has-holiday' : ''} ${
                !isCurrentMonth ? 'opacity-30' : ''
              }`}
              onClick={() => onDateClick(date)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isToday(date) ? 'text-primary font-bold' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                </span>
                {dayHolidays.length > 0 && (
                  <ApperIcon name="Calendar" size={12} className="text-gray-400" />
                )}
              </div>
              
              {dayHolidays.length > 0 && (
                <div className="space-y-1">
                  {dayHolidays.slice(0, 2).map((holiday, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-2 py-1 rounded border ${getHolidayType(date)} cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onHolidayClick(holiday);
                      }}
                    >
                      {holiday.name}
                    </div>
                  ))}
                  {dayHolidays.length > 2 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayHolidays.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;