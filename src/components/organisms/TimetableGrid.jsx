import { format, isSameDay } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

function TimetableGrid({ 
  timetable, 
  lessonPlans, 
  highlightToday = true, 
  onCellClick,
  className = '',
  exportMode = false 
}) {
const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isExportReady, setIsExportReady] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const gridRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  const colors = {
    Mathematics: "bg-blue-100 text-blue-800 border-blue-200",
    English: "bg-green-100 text-green-800 border-green-200",
    Science: "bg-purple-100 text-purple-800 border-purple-200",
    History: "bg-orange-100 text-orange-800 border-orange-200",
    Geography: "bg-teal-100 text-teal-800 border-teal-200",
    Art: "bg-pink-100 text-pink-800 border-pink-200",
    'Physical Education': "bg-red-100 text-red-800 border-red-200",
}

  const today = new Date()

  // Effect to handle component mounting and dimension tracking
// Enhanced canvas-safe dimension validation
  const validateDimensions = (rect) => {
    const width = Math.max(rect.width || 0, 100)
    const height = Math.max(rect.height || 0, 200)
    
    // Stricter validation for canvas operations
    return {
      width,
      height,
      isValid: width >= 100 && height >= 200 && rect.width > 0 && rect.height > 0
    }
  }

  const checkVisibility = () => {
    if (!gridRef.current) return false
    
    const rect = gridRef.current.getBoundingClientRect()
    const style = window.getComputedStyle(gridRef.current)
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      style.opacity !== '0'
    )
  }

// Consolidated initialization and dimension management
  useEffect(() => {
    const initializeGrid = async () => {
      if (!gridRef.current) {
        setIsLoading(false)
        setError('Grid element not found')
        return
      }

      try {
        // Wait for element to be properly rendered
        await new Promise(resolve => {
          const checkRendered = () => {
            if (!gridRef.current) return
            const rect = gridRef.current.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
              resolve()
            } else {
              setTimeout(checkRendered, 50)
            }
          }
          checkRendered()
        })

        const rect = gridRef.current.getBoundingClientRect()
        const validation = validateDimensions(rect)
        const visible = checkVisibility()
        
        if (validation.isValid && visible) {
          setDimensions({ width: validation.width, height: validation.height })
          setIsExportReady(true)
          setIsVisible(true)
          setError(null)
        } else {
          setError('Grid is not ready for export')
          setIsExportReady(false)
        }
      } catch (err) {
        console.error('Error initializing grid:', err)
        setError('Failed to initialize grid: ' + err.message)
        setIsExportReady(false)
        setDimensions({ width: 800, height: 600 })
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize after component mount
    const timer = setTimeout(initializeGrid, 100)
    
    // Handle window resize with debouncing
    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (gridRef.current) {
          const rect = gridRef.current.getBoundingClientRect()
          const validation = validateDimensions(rect)
          const visible = checkVisibility()
          
          if (validation.isValid && visible) {
            setDimensions({ width: validation.width, height: validation.height })
            setIsExportReady(true)
            setIsVisible(true)
          } else {
            setIsExportReady(false)
          }
        }
      }, 200)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
// Update dimensions when timetable data changes
  useEffect(() => {
    if (gridRef.current && timetable && timetable.length > 0) {
      const updateAfterDataChange = () => {
        if (!gridRef.current) return
        
        try {
          const rect = gridRef.current.getBoundingClientRect()
          const validation = validateDimensions(rect)
          const visible = checkVisibility()
          
          if (validation.isValid && visible) {
            setDimensions({ width: validation.width, height: validation.height })
            setIsExportReady(true)
            setIsVisible(true)
          }
        } catch (err) {
          console.error('Error updating grid after data change:', err)
          setIsExportReady(false)
        }
      }
      
      // Wait for DOM to update after data change
      requestAnimationFrame(() => {
        setTimeout(updateAfterDataChange, 100)
      })
    }
  }, [timetable])

  // Update dimensions when timetable data changes
// Update dimensions when timetable data changes
// Expose export readiness for parent components
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.dataset.exportReady = isExportReady ? 'true' : 'false'
      gridRef.current.dataset.isVisible = isVisible ? 'true' : 'false'
      gridRef.current.dataset.dimensions = `${dimensions.width}x${dimensions.height}`
    }
  }, [isExportReady, isVisible, dimensions])

  const getClassForSlot = (day, time) => {

    try {
      if (!timetable || !Array.isArray(timetable)) return null
      return timetable.find(item => 
        item?.day?.toLowerCase() === day.toLowerCase() && 
        item?.time === time
      )
    } catch (err) {
      console.error('Error getting class for slot:', err)
      return null
    }
  }

const getLessonPlanForSlot = (day, time) => {
    try {
      const classData = getClassForSlot(day, time)
      if (!classData) return null
      
      if (!lessonPlans || !Array.isArray(lessonPlans)) return null
      
      return lessonPlans.find(plan => 
        plan?.subject === classData.subject && 
        plan?.class === classData.class
      )
    } catch (err) {
      console.error('Error getting lesson plan for slot:', err)
      return null
    }
  }

const getSubjectColor = (subject) => {
    try {
      return colors[subject] || "bg-gray-100 text-gray-800 border-gray-200"
    } catch (err) {
      console.error('Error getting subject color:', err)
      return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Error boundary for rendering
  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-700 mb-2">
          <ApperIcon name="AlertCircle" size={20} className="mr-2" />
          <span className="font-medium">Timetable Error</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center text-gray-600 mb-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
          <span>Loading timetable...</span>
        </div>
        <div className="grid grid-cols-6 gap-2 mt-4">
          {[...Array(48)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

return (
    <div className={`w-full ${className}`} style={{ minHeight: '400px' }}>
      {/* Grid container with proper ID for export functionality */}
      <div 
        ref={gridRef}
        id="timetable-grid"
        className="timetable-grid mb-4"
style={{ 
          minWidth: '800px',
          minHeight: '400px',
          display: 'grid',
          gridTemplateColumns: '100px repeat(5, 1fr)',
          gap: '1px'
        }}
        data-export-ready={isExportReady && dimensions.width >= 50 && dimensions.height >= 50}
        data-is-visible={isVisible}
        data-dimensions={`${dimensions.width}x${dimensions.height}`}
      >
        {/* Header */}
        <div className="timetable-cell flex items-center justify-center font-semibold text-gray-700 bg-gray-50">
          Time
        </div>
        {dayLabels.map(day => (
          <div key={day} className="timetable-cell flex items-center justify-center font-semibold text-gray-700 bg-gray-50">
            {day}
          </div>
        ))}

        {/* Time slots and schedule */}
        {timeSlots.map(time => (
          <React.Fragment key={time}>
            <div className="timetable-cell flex items-center justify-center font-medium text-gray-600 bg-gray-50">
              {time}
            </div>
            {days.map(day => {
              const classData = getClassForSlot(day, time)
              const lessonPlan = getLessonPlanForSlot(day, time)
              const currentDay = format(today, 'EEEE').toLowerCase()
              const isCurrentDay = highlightToday && day === currentDay

              return (
                <div
                  key={`${day}-${time}`}
                  className={`timetable-cell flex items-center justify-center p-2 ${
                    isCurrentDay ? 'current-day' : ''
                  } ${classData ? 'has-class' : ''} ${
                    lessonPlan ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onCellClick && onCellClick({ day, time, class: classData, lessonPlan })}
                  style={{ minHeight: '60px' }}
                >
                  {classData ? (
                    <div className={`w-full h-full rounded-md border-2 p-2 flex flex-col items-center justify-center text-center transition-all ${
                      lessonPlan ? 'hover:shadow-md hover:scale-105' : 'opacity-60'
                    } ${getSubjectColor(classData.subject)}`}>
                      <div className="font-medium text-sm">{classData.subject || 'Unknown Subject'}</div>
                      <div className="text-xs opacity-80">{classData.class || 'Unknown Class'}</div>
                      {classData.room && (
                        <div className="text-xs opacity-60 flex items-center mt-1">
                          <ApperIcon name="MapPin" size={12} className="mr-1" />
                          {classData.room}
                        </div>
                      )}
                      {lessonPlan && (
                        <div className="text-xs mt-1 flex items-center">
                          <ApperIcon name="FileText" size={12} className="mr-1" />
                          Plan Ready
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Free
                    </div>
                  )}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default TimetableGrid