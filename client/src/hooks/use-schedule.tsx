import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ShiftWithEmployee, Schedule } from "@shared/schema";
import { addDays, startOfWeek, endOfWeek, format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface ShiftFormData {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
  notes: string;
  repeatShift: boolean;
  repeatPattern: string;
}

export function useSchedule() {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    return {
      startDate: weekStart,
      endDate: weekEnd
    };
  });
  
  // Fetch schedule by week
  const { 
    data: schedule,
    isLoading: isScheduleLoading,
    error: scheduleError
  } = useQuery<Schedule | null>({
    queryKey: ['/api/schedules', { startDate: format(currentWeek.startDate, 'yyyy-MM-dd') }],
    refetchOnWindowFocus: false,
  });
  
  // Fetch shifts by week
  const { 
    data: shifts = [],
    isLoading: isShiftsLoading,
    error: shiftsError
  } = useQuery<ShiftWithEmployee[]>({
    queryKey: [
      '/api/shifts', 
      { 
        startDate: format(currentWeek.startDate, 'yyyy-MM-dd'),
        endDate: format(currentWeek.endDate, 'yyyy-MM-dd')
      }
    ],
    refetchOnWindowFocus: false,
  });
  
  // Add shift mutation
  const { 
    mutateAsync: addShiftMutation,
    isPending: isAdding
  } = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      try {
        const shiftData = {
          employeeId: parseInt(data.employeeId),
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          position: data.position,
          notes: data.notes || "",
          status: "draft"
        };
        
        console.log("Sending shift data:", shiftData);
        const response = await apiRequest('POST', '/api/shifts', shiftData);
        return await response.json();
      } catch (error) {
        console.error("Error creating shift:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate shifts query to refetch updated data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/shifts'] 
      });
    }
  });

  // Publish schedule mutation
  const {
    mutateAsync: publishScheduleMutation,
    isPending: isPublishing
  } = useMutation({
    mutationFn: async (scheduleId: number) => {
      const response = await apiRequest('POST', `/api/schedules/${scheduleId}/publish`, {});
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate both schedules and shifts queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/schedules'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/shifts'] 
      });
    }
  });
  
  // Navigation functions
  const navigateWeek = (direction: 'prev' | 'next' | 'current') => {
    setCurrentWeek((prevWeek) => {
      if (direction === 'prev') {
        const newStartDate = addDays(prevWeek.startDate, -7);
        const newEndDate = addDays(prevWeek.endDate, -7);
        return {
          startDate: newStartDate,
          endDate: newEndDate
        };
      } else if (direction === 'next') {
        const newStartDate = addDays(prevWeek.startDate, 7);
        const newEndDate = addDays(prevWeek.endDate, 7);
        return {
          startDate: newStartDate,
          endDate: newEndDate
        };
      } else {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        return {
          startDate: weekStart,
          endDate: weekEnd
        };
      }
    });
  };
  
  // Add shift function
  const addShift = async (data: ShiftFormData) => {
    await addShiftMutation(data);
  };
  
  // Publish schedule function
  const publishSchedule = async (scheduleId: number) => {
    await publishScheduleMutation(scheduleId);
  };
  
  return {
    currentWeek,
    schedule,
    shifts,
    isLoading: isScheduleLoading || isShiftsLoading,
    error: scheduleError || shiftsError,
    isAdding,
    isPublishing,
    navigateWeek,
    addShift,
    publishSchedule
  };
}
