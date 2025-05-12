import { useState } from "react";
import ScheduleHeader from "./ScheduleHeader";
import ScheduleCalendar from "./ScheduleCalendar";
import ScheduleStatsPanel from "./ScheduleStatsPanel";
import ShiftModal from "../modals/ShiftModal";
import PublishModal from "../modals/PublishModal";
import { useSchedule } from "@/hooks/use-schedule";
import { useToast } from "@/hooks/use-toast";

export default function ScheduleManager() {
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const { 
    currentWeek, 
    isLoading, 
    schedule, 
    shifts, 
    isPublishing,
    publishSchedule,
    navigateWeek
  } = useSchedule();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  
  const handleAddShift = (date?: Date, employeeId?: number) => {
    setSelectedDate(date || null);
    if (employeeId) {
      setSelectedEmployeeId(employeeId);
    } else {
      setSelectedEmployeeId(null);
    }
    setIsShiftModalOpen(true);
  };

  const handlePublish = async () => {
    if (!schedule) return;
    
    try {
      await publishSchedule(schedule.id);
      setIsPublishModalOpen(false);
      toast({
        title: "Schedule published successfully!",
        description: "All employees will now be able to see their shifts.",
      });
    } catch (error) {
      toast({
        title: "Error publishing schedule",
        description: "There was an error publishing the schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <ScheduleHeader 
        currentWeek={currentWeek}
        onAddShift={() => handleAddShift()}
        onPublish={() => setIsPublishModalOpen(true)}
        onPrevWeek={() => navigateWeek('prev')}
        onNextWeek={() => navigateWeek('next')}
        onCurrentWeek={() => navigateWeek('current')}
        scheduleStatus={schedule?.status === "published" ? "published" : "draft"}
      />
      
      <ScheduleCalendar 
        isLoading={isLoading}
        currentWeek={currentWeek} 
        shifts={shifts}
        onAddShift={handleAddShift}
      />
      
      <ScheduleStatsPanel 
        statistics={schedule?.statistics}
        isLoading={isLoading}
      />
      
      <ShiftModal 
        isOpen={isShiftModalOpen} 
        onClose={() => setIsShiftModalOpen(false)}
        selectedDate={selectedDate}
        selectedEmployeeId={selectedEmployeeId}
      />
      
      <PublishModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublish}
        isPending={isPublishing}
      />
    </div>
  );
}
