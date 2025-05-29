import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { PermissionWithEmployee } from "@shared/schema";

interface MonthlyCalendarProps {
  currentDate: Date;
  permissions: PermissionWithEmployee[];
  onDateClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

const PERMISSION_COLORS = {
  "Sin permiso": "bg-red-500 text-white",
  "Vacaciones": "bg-blue-500 text-white",
  "Administrativo": "bg-green-500 text-white", 
  "Fallecimiento": "bg-gray-800 text-white",
  "Capacitación": "bg-purple-500 text-white",
  "Sindical": "bg-yellow-500 text-black",
  "Reunión": "bg-orange-500 text-white",
  "Accidentes": "bg-pink-500 text-white",
  "Compensación": "bg-teal-500 text-white",
  "Amamantamiento": "bg-indigo-500 text-white",
  "Permiso con Goce": "bg-lime-500 text-black",
  "Permiso sin Goce": "bg-gray-500 text-white",
  "Ley 20823": "bg-cyan-500 text-white",
  "Estudio MDA": "bg-violet-500 text-white"
};

export default function MonthlyCalendar({ 
  currentDate, 
  permissions, 
  onDateClick, 
  onMonthChange 
}: MonthlyCalendarProps) {
  const { getNotificationsForDate } = useNotifications();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getPermissionsForDate = (date: Date) => {
    return permissions.filter(permission => 
      isSameDay(new Date(permission.date), date)
    );
  };

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onMonthChange(newDate);
  };

  return (
    <div className="bg-white rounded-lg border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Weekday Headers */}
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 border-b bg-gray-50">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day) => {
          const dayPermissions = getPermissionsForDate(day);
          const dayNotifications = getNotificationsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] p-2 border-b border-r cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''
              }`}
              onClick={() => onDateClick(day)}
            >
              <div className="font-medium text-sm mb-1">
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className={`text-xs px-1 py-0.5 rounded text-center ${
                      PERMISSION_COLORS[permission.type as keyof typeof PERMISSION_COLORS] || 'bg-gray-300 text-black'
                    }`}
                    title={`${permission.employee.name} - ${permission.type}`}
                  >
                    {permission.type}
                  </div>
                ))}
                
                {dayNotifications.map((notification) => (
                  <div
                    key={`notification-${notification.id}`}
                    className="text-xs px-1 py-0.5 rounded text-center bg-blue-500 text-white"
                    title={`Notificación: ${notification.texto}`}
                  >
                    {notification.texto}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}