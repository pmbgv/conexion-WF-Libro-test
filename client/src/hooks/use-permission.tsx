import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PermissionWithEmployee, CalendarPeriod } from "@shared/schema";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface PermissionFormData {
  employeeId: string;
  date: string;
  type: string;
  reason: string;
}

export function usePermission() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  // Fetch calendar period by month
  const { 
    data: calendarPeriod,
    isLoading: isCalendarPeriodLoading,
    error: calendarPeriodError
  } = useQuery<CalendarPeriod | null>({
    queryKey: ['/api/calendar-periods', { startDate: format(currentMonth, 'yyyy-MM-dd') }],
    refetchOnWindowFocus: false,
  });
  
  // Fetch permissions by month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const { 
    data: permissions = [],
    isLoading: isPermissionsLoading,
    error: permissionsError
  } = useQuery<PermissionWithEmployee[]>({
    queryKey: [
      '/api/permissions', 
      { 
        startDate: format(monthStart, 'yyyy-MM-dd'),
        endDate: format(monthEnd, 'yyyy-MM-dd')
      }
    ],
    refetchOnWindowFocus: false,
  });
  
  // Add permission mutation
  const { 
    mutateAsync: addPermissionMutation,
    isPending: isAdding
  } = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      try {
        const permissionData = {
          employeeId: parseInt(data.employeeId),
          date: new Date(data.date),
          type: data.type,
          reason: data.reason || null,
          status: "draft"
        };
        
        const response = await fetch("/api/permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(permissionData),
        });
        
        if (!response.ok) {
          throw new Error("Failed to add permission");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error adding permission:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/permissions']
      });
    },
  });
  
  // Publish calendar period mutation
  const { 
    mutateAsync: publishCalendarPeriodMutation,
    isPending: isPublishing
  } = useMutation({
    mutationFn: async (periodId: number) => {
      const response = await fetch(`/api/calendar-periods/${periodId}/publish`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to publish calendar period");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/calendar-periods']
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/permissions']
      });
    },
  });
  
  const navigateMonth = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'prev') {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (direction === 'next') {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    }
  };
  
  const addPermission = async (data: PermissionFormData) => {
    await addPermissionMutation(data);
  };
  
  // Publish calendar period function
  const publishCalendarPeriod = async (periodId: number) => {
    await publishCalendarPeriodMutation(periodId);
  };
  
  return {
    currentMonth,
    calendarPeriod,
    permissions,
    isLoading: isCalendarPeriodLoading || isPermissionsLoading,
    error: calendarPeriodError || permissionsError,
    isAdding,
    isPublishing,
    navigateMonth,
    setCurrentMonth,
    addPermission,
    publishCalendarPeriod
  };
}