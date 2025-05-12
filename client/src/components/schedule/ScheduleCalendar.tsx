import { useState, useMemo } from "react";
import { ShiftWithEmployee } from "@shared/schema";
import EmployeeRow from "./EmployeeRow";
import { getDaysOfWeek } from "@/lib/utils/date-utils";
import { useEmployee } from "@/hooks/use-employee";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleCalendarProps {
  currentWeek: {
    startDate: Date;
    endDate: Date;
  };
  shifts: ShiftWithEmployee[];
  isLoading: boolean;
  onAddShift: (date: Date, employeeId?: number) => void;
}

export default function ScheduleCalendar({ 
  currentWeek, 
  shifts, 
  isLoading,
  onAddShift 
}: ScheduleCalendarProps) {
  const { employees, isLoading: isLoadingEmployees } = useEmployee();
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  
  const daysOfWeek = useMemo(() => {
    return getDaysOfWeek(currentWeek.startDate);
  }, [currentWeek.startDate]);
  
  // Group shifts by employee
  const shiftsByEmployee = useMemo(() => {
    const groupedShifts: Record<number, ShiftWithEmployee[]> = {};
    
    if (shifts.length > 0) {
      shifts.forEach(shift => {
        if (!groupedShifts[shift.employeeId]) {
          groupedShifts[shift.employeeId] = [];
        }
        groupedShifts[shift.employeeId].push(shift);
      });
    }
    
    return groupedShifts;
  }, [shifts]);
  
  const handleCellHover = (employeeId: number, dayIndex: number) => {
    setHoveredCell(`${employeeId}-${dayIndex}`);
  };
  
  const handleCellLeave = () => {
    setHoveredCell(null);
  };
  
  const handleCellClick = (employeeId: number, day: Date, dayIndex: number) => {
    const cellId = `${employeeId}-${dayIndex}`;
    setSelectedCell(cellId === selectedCell ? null : cellId);
    
    // If we already have a selection, don't open the modal again
    if (cellId !== selectedCell) {
      onAddShift(day, employeeId);
    }
  };
  
  if (isLoading || isLoadingEmployees) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 font-medium text-gray-700 border-r border-gray-200 bg-gray-50">
            Employees
          </div>
          {[...Array(7)].map((_, i) => (
            <div key={i} className="p-4 font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0">
              <Skeleton className="h-4 w-12 mx-auto mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
        
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-8">
              <div className="p-4 font-medium border-r border-gray-200 flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <Skeleton className="h-4 w-24" />
              </div>
              {[...Array(7)].map((_, j) => (
                <div key={j} className="border-r border-gray-200 last:border-r-0 p-2" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
      {/* Calendar Header */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-2 font-medium text-gray-700 border-r border-gray-200 bg-gray-50">
          Employees
        </div>
        {daysOfWeek.map((day, i) => (
          <div key={i} className="p-2 font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0">
            <div className="text-xs text-gray-500">{day.name}</div>
            <div className="text-sm">{day.date}</div>
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="divide-y divide-gray-200">
        {employees.map(employee => (
          <EmployeeRow 
            key={employee.id}
            employee={employee}
            days={daysOfWeek}
            shifts={shiftsByEmployee[employee.id] || []}
            hoveredCell={hoveredCell}
            selectedCell={selectedCell}
            onCellHover={handleCellHover}
            onCellLeave={handleCellLeave}
            onCellClick={handleCellClick}
          />
        ))}
      </div>
    </div>
  );
}
