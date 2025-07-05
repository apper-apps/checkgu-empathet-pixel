import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const TimetableEditor = ({ subjects, timetable, onUpdate }) => {
  const [localTimetable, setLocalTimetable] = useState(timetable);
  
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Handle drag from subjects to timetable
    if (source.droppableId === 'subjects' && destination.droppableId.startsWith('slot-')) {
      const [, day, time] = destination.droppableId.split('-');
      const subject = subjects[source.index];
      
      const newSlot = {
        Id: Date.now(), // Temporary ID
        day: day,
        time: time,
        subject: subject.name,
        class: subject.level,
        room: 'TBD'
      };

      const updatedTimetable = [
        ...localTimetable.filter(slot => !(slot.day === day && slot.time === time)),
        newSlot
      ];

      setLocalTimetable(updatedTimetable);
      onUpdate(updatedTimetable);
    }
  };

  const removeSlot = (day, time) => {
    const updatedTimetable = localTimetable.filter(slot => !(slot.day === day && slot.time === time));
    setLocalTimetable(updatedTimetable);
    onUpdate(updatedTimetable);
  };

  const getSlotData = (day, time) => {
    return localTimetable.find(slot => slot.day === day && slot.time === time);
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Available Subjects */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Available Subjects</h4>
          <Droppable droppableId="subjects" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-wrap gap-2"
              >
                {subjects.map((subject, index) => (
                  <Draggable key={subject.Id} draggableId={`subject-${subject.Id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`px-3 py-2 rounded-md border-2 cursor-move transition-all ${
                          snapshot.isDragging
                            ? 'shadow-lg transform rotate-2'
                            : 'hover:shadow-md'
                        } ${getSubjectColor(subject.name)}`}
                      >
                        <div className="text-sm font-medium">{subject.name}</div>
                        <div className="text-xs opacity-75">{subject.level}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-3 bg-gray-50 text-left font-medium text-gray-700">
                    Time
                  </th>
                  {dayLabels.map(day => (
                    <th key={day} className="border border-gray-200 p-3 bg-gray-50 text-center font-medium text-gray-700">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="border border-gray-200 p-3 bg-gray-50 font-medium text-gray-700">
                      {time}
                    </td>
                    {days.map(day => {
                      const slotData = getSlotData(day, time);
                      return (
                        <td key={`${day}-${time}`} className="border border-gray-200 p-2">
                          <Droppable droppableId={`slot-${day}-${time}`}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`min-h-16 rounded-md border-2 border-dashed flex items-center justify-center transition-all ${
                                  snapshot.isDraggingOver
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {slotData ? (
                                  <div className={`w-full h-full rounded-md border-2 p-2 relative ${getSubjectColor(slotData.subject)}`}>
                                    <div className="text-sm font-medium">{slotData.subject}</div>
                                    <div className="text-xs opacity-75">{slotData.class}</div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-1 right-1 p-1 h-auto min-h-0"
                                      onClick={() => removeSlot(day, time)}
                                    >
                                      <ApperIcon name="X" size={12} />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">
                                    Drop subject here
                                  </div>
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default TimetableEditor;