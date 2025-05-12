import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Filter, 
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/utils/date-utils";

interface ScheduleHeaderProps {
  currentWeek: {
    startDate: Date;
    endDate: Date;
  };
  scheduleStatus: "draft" | "published";
  onAddShift: () => void;
  onPublish: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

export default function ScheduleHeader({
  currentWeek,
  scheduleStatus,
  onAddShift,
  onPublish,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek
}: ScheduleHeaderProps) {
  const formattedDateRange = formatDateRange(currentWeek.startDate, currentWeek.endDate);
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Work Schedule</h1>
          <p className="text-gray-600">
            Week of {formattedDateRange} • 
            <span className={`${scheduleStatus === 'draft' ? 'text-[#FFA726]' : 'text-[#43A047]'} font-medium flex-inline items-center ml-1`}>
              <span className="inline-block w-2 h-2 rounded-full bg-current mr-1"></span>
              {scheduleStatus === 'draft' ? 'Draft Mode' : 'Published'}
            </span>
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button variant="outline" onClick={onPrevWeek}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button variant="outline" onClick={onNextWeek}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={onCurrentWeek}>
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <Button onClick={onAddShift}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className={`border-2 ${scheduleStatus === 'draft' ? 'border-[#FFA726] text-[#FFA726]' : 'border-gray-200 text-gray-500'} font-medium px-6`}
          >
            DRAFT
          </Button>
          <Button 
            variant="outline" 
            className="border-2 border-[#4CAF50] text-[#4CAF50] font-medium px-6 hover:bg-[#4CAF50]/10"
            onClick={onPublish}
            disabled={scheduleStatus === 'published'}
          >
            PUBLISH
          </Button>
        </div>
      </div>
    </div>
  );
}
