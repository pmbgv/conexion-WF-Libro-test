import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

import { useSchedule } from "@/hooks/use-schedule";
import { useToast } from "@/hooks/use-toast";
import { ShiftFormData } from "@/hooks/use-schedule";
import { useQuery } from "@tanstack/react-query";
import { Schedule } from "@shared/schema";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

export default function ShiftModal({ 
  isOpen, 
  onClose,
  selectedDate
}: ShiftModalProps) {

  const { addShift, isAdding } = useSchedule();
  const { toast } = useToast();
  
  // Fetch available schedules for the selector
  const { data: schedules = [] } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
    refetchOnWindowFocus: false,
  });

  const [formData, setFormData] = useState<ShiftFormData>({
    employeeId: "0", // Placeholder ID, will be assigned in the grid
    scheduleId: "none",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    position: "General",
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
    }
  }, [selectedDate, isOpen]);

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
    
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.position) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create a shift without associating it with a specific employee
      const shiftData = {
        ...formData,
        employeeId: "0" // Temporary placeholder, will be assigned in the grid
      };
      
      await addShift(shiftData);
      onClose();
      toast({
        title: "Shift template added successfully",
        description: "The shift has been created and can now be assigned to employees on the schedule.",
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
              <Label htmlFor="scheduleId">Schedule</Label>
              <Select
                value={formData.scheduleId}
                onValueChange={(value) => handleSelectChange("scheduleId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {schedules.map((schedule: Schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id.toString()}>
                      {format(new Date(schedule.weekStartDate), "MMM d")} - {format(new Date(schedule.weekEndDate), "MMM d, yyyy")} ({schedule.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
