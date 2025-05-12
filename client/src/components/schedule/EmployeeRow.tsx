import { useMemo } from "react";
import { Employee, ShiftWithEmployee } from "@shared/schema";
import { DayInfo } from "@/lib/utils/date-utils";
import { isSameDay } from "date-fns";
import { Plus } from "lucide-react";

interface EmployeeRowProps {
  employee: Employee;
  days: DayInfo[];
  shifts: ShiftWithEmployee[];
  hoveredCell: string | null;
  onCellHover: (employeeId: number, dayIndex: number) => void;
  onCellLeave: () => void;
  onCellClick: (employeeId: number, day: Date) => void;
}

export default function EmployeeRow({
  employee,
  days,
  shifts,
  hoveredCell,
  onCellHover,
  onCellLeave,
  onCellClick
}: EmployeeRowProps) {
  // Organize shifts by day
  const shiftsByDay = useMemo(() => {
    const result: Record<number, ShiftWithEmployee[]> = {};
    
    days.forEach((day, index) => {
      result[index] = shifts.filter(shift => 
        isSameDay(new Date(shift.date), day.fullDate)
      );
    });
    
    return result;
  }, [shifts, days]);
  
  return (
    <div className="grid grid-cols-8 hover:bg-gray-50">
      <div className="p-2 font-medium border-r border-gray-200 flex items-center">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-2 text-xs">
            <span>{employee.initials}</span>
          </div>
          <span className="text-sm">{employee.name}</span>
        </div>
      </div>
      
      {days.map((day, index) => {
        const dayShifts = shiftsByDay[index];
        const cellId = `${employee.id}-${index}`;
        const isHovered = hoveredCell === cellId;
        
        return (
          <div 
            key={index}
            className={`border-r border-gray-200 last:border-r-0 p-2 relative ${isHovered ? 'bg-gray-100' : ''}`}
            onMouseEnter={() => onCellHover(employee.id, index)}
            onMouseLeave={onCellLeave}
            onClick={() => onCellClick(employee.id, day.fullDate)}
          >
            {dayShifts.length > 0 ? (
              // Display shift information
              dayShifts.map(shift => (
                <div 
                  key={shift.id} 
                  className={`shift-card ${shift.status === 'draft' ? 'bg-[#FFA726]/10 border border-[#FFA726]' : 'bg-[#43A047]/10 border border-[#43A047]'} rounded p-2 text-xs`}
                >
                  <div className={`font-medium ${shift.status === 'draft' ? 'text-[#FFA726]' : 'text-[#43A047]'}`}>
                    {shift.startTime} - {shift.endTime}
                  </div>
                  <div className="text-gray-600 mt-1">{shift.position}</div>
                </div>
              ))
            ) : (
              // Empty cell with add button on hover
              isHovered && (
                <div className="h-full w-full flex items-center justify-center">
                  <button 
                    className="h-8 w-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-primary hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCellClick(employee.id, day.fullDate);
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
