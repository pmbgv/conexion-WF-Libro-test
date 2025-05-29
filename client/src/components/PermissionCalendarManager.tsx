import { useState } from "react";
import { usePermission } from "@/hooks/use-permission";
import { useEmployee } from "@/hooks/use-employee";
import MonthlyCalendar from "./MonthlyCalendar";
import EmployeeSidebar from "./EmployeeSidebar";
import PermissionModal from "./modals/PermissionModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PermissionCalendarManager() {
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPermissionTypes, setSelectedPermissionTypes] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { 
    currentMonth, 
    permissions, 
    isLoading,
    setCurrentMonth,
    addPermission
  } = usePermission();
  
  const { employees, isLoading: isLoadingEmployees } = useEmployee();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsPermissionModalOpen(true);
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  const handleAddPermission = () => {
    setSelectedDate(new Date());
    setIsPermissionModalOpen(true);
  };

  const handlePermissionTypeToggle = (type: string) => {
    setSelectedPermissionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Filter permissions based on selected types
  const filteredPermissions = selectedPermissionTypes.length > 0 
    ? permissions.filter(permission => selectedPermissionTypes.includes(permission.type))
    : permissions;

  if (isLoading || isLoadingEmployees) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando calendario de permisos...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <EmployeeSidebar 
        employees={employees}
        selectedPermissionTypes={selectedPermissionTypes}
        onPermissionTypeToggle={handlePermissionTypeToggle}
      />
      
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleAddPermission}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Asignar Ausencia
            </Button>
            <Button
              variant="outline"
              className="border-gray-300"
            >
              Carga masiva
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Jue. 20 de Mar
          </div>
        </div>

        <MonthlyCalendar 
          currentDate={currentMonth}
          permissions={filteredPermissions}
          onDateClick={handleDateClick}
          onMonthChange={handleMonthChange}
        />
      </div>

      <PermissionModal 
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        selectedDate={selectedDate}
        employees={employees}
        onAddPermission={addPermission}
      />
    </div>
  );
}