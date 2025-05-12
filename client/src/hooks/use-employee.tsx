import { useQuery, useMutation } from "@tanstack/react-query";
import { Employee, InsertEmployee } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useEmployee() {
  // Fetch all employees
  const { 
    data: employees = [],
    isLoading,
    error
  } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    refetchOnWindowFocus: false,
  });
  
  // Add employee mutation
  const { 
    mutateAsync: addEmployeeMutation,
    isPending: isAdding
  } = useMutation({
    mutationFn: async (employee: InsertEmployee) => {
      const response = await apiRequest('POST', '/api/employees', employee);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/employees'] 
      });
    }
  });
  
  // Update employee mutation
  const {
    mutateAsync: updateEmployeeMutation,
    isPending: isUpdating
  } = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertEmployee> }) => {
      const response = await apiRequest('PUT', `/api/employees/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/employees'] 
      });
    }
  });
  
  // Delete employee mutation
  const {
    mutateAsync: deleteEmployeeMutation,
    isPending: isDeleting
  } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/employees/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/employees'] 
      });
    }
  });
  
  // Utility functions to perform operations
  const addEmployee = async (employee: InsertEmployee) => {
    return await addEmployeeMutation(employee);
  };
  
  const updateEmployee = async (id: number, data: Partial<InsertEmployee>) => {
    return await updateEmployeeMutation({ id, data });
  };
  
  const deleteEmployee = async (id: number) => {
    return await deleteEmployeeMutation(id);
  };
  
  return {
    employees,
    isLoading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
}
