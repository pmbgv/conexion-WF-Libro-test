import { BarChart3, Users, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleStatsPanelProps {
  statistics?: any;
  isLoading: boolean;
}

export default function ScheduleStatsPanel({ 
  statistics, 
  isLoading 
}: ScheduleStatsPanelProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-36" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // If no statistics available, render nothing
  if (!statistics) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="text-primary mr-2 h-5 w-5" />
            Scheduled Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-sm">Total Hours</div>
              <div className="text-2xl font-bold mt-1">{statistics.totalHours}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Avg. Per Employee</div>
              <div className="text-2xl font-bold mt-1">{statistics.avgPerEmployee}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Weekday</div>
              <div className="text-2xl font-bold mt-1">{statistics.weekdayHours}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Weekend</div>
              <div className="text-2xl font-bold mt-1">{statistics.weekendHours}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Users className="text-primary mr-2 h-5 w-5" />
            Team Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">Morning (6-12)</span>
                <span className="text-sm font-medium">{statistics.coverage.morning}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${statistics.coverage.morning}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">Afternoon (12-5)</span>
                <span className="text-sm font-medium">{statistics.coverage.afternoon}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${statistics.coverage.afternoon}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">Evening (5-10)</span>
                <span className="text-sm font-medium">{statistics.coverage.evening}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${statistics.coverage.evening}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ClipboardCheck className="text-primary mr-2 h-5 w-5" />
            Schedule Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Draft Shifts</div>
                <div className="text-gray-500 text-sm">Pending publication</div>
              </div>
              <div className="bg-[#FFA726]/10 text-[#FFA726] px-3 py-1 rounded-full text-sm font-medium">
                {statistics.shifts.draft} Shifts
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Published Shifts</div>
                <div className="text-gray-500 text-sm">Visible to employees</div>
              </div>
              <div className="bg-[#43A047]/10 text-[#43A047] px-3 py-1 rounded-full text-sm font-medium">
                {statistics.shifts.published} Shifts
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Open Positions</div>
                <div className="text-gray-500 text-sm">Needs scheduling</div>
              </div>
              <div className="bg-[#F44336]/10 text-[#F44336] px-3 py-1 rounded-full text-sm font-medium">
                {statistics.openPositions} Positions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
