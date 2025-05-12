import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useEmployee } from "@/hooks/use-employee";
import { useSchedule } from "@/hooks/use-schedule";
import { useToast } from "@/hooks/use-toast";
import { ShiftFormData } from "@/hooks/use-schedule";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedEmployeeId: number | null;
}

export default function ShiftModal({ 
  isOpen, 
  onClose,
  selectedDate,
  selectedEmployeeId
}: ShiftModalProps) {
  const { employees } = useEmployee();
  const { addShift, isAdding } = useSchedule();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ShiftFormData>({
    employeeId: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    position: "",
    notes: "",
    repeatShift: false,
    repeatPattern: "weekly"
  });

  const [repeatOptions, setRepeatOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Update date
      if (selectedDate) {
        setFormData(prevData => ({
          ...prevData,
          date: format(selectedDate, "yyyy-MM-dd")
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          date: format(new Date(), "yyyy-MM-dd")
        }));
      }
      
      // Update employee if selected
      if (selectedEmployeeId) {
        setFormData(prevData => ({
          ...prevData,
          employeeId: selectedEmployeeId.toString()
        }));
      }
    }
  }, [selectedDate, selectedEmployeeId, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prevData => ({
      ...prevData,
      repeatShift: checked
    }));
    setRepeatOptions(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.date || !formData.startTime || !formData.endTime || !formData.position) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addShift(formData);
      onClose();
      toast({
        title: "Shift added successfully",
        description: "The shift has been added to the schedule.",
      });
    } catch (error) {
      toast({
        title: "Error adding shift",
        description: "There was an error adding the shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Shift</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              {selectedEmployeeId ? (
                // If employee is pre-selected from grid, show a disabled field with the name
                <div className="p-2 border rounded-md bg-gray-50">
                  {employees.find(e => e.id === selectedEmployeeId)?.name || "Selected Employee"}
                </div>
              ) : (
                // Otherwise show the dropdown
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => handleSelectChange("employeeId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Enter position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any notes about this shift"
                value={formData.notes}
                onChange={handleInputChange}
                className="h-24"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="repeatShift" 
                checked={formData.repeatShift}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="repeatShift" className="text-sm">Repeat this shift</Label>
            </div>
            
            {repeatOptions && (
              <div className="grid gap-2">
                <Label htmlFor="repeatPattern">Repeat Pattern</Label>
                <Select
                  value={formData.repeatPattern}
                  onValueChange={(value) => handleSelectChange("repeatPattern", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Saving..." : "Save Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
