import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function PublishModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isPending 
}: PublishModalProps) {
  const [notifyEmployees, setNotifyEmployees] = useState(true);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Publish Schedule</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            Are you sure you want to publish this schedule? Once published, all employees will be able to see their assigned shifts.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-primary p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-primary">
                  Publishing will send notifications to all affected employees.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyEmployees"
              checked={notifyEmployees}
              onCheckedChange={(checked) => setNotifyEmployees(checked as boolean)}
            />
            <Label htmlFor="notifyEmployees">Send email notifications to employees</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isPending}
            className="bg-[#43A047] hover:bg-[#43A047]/90"
          >
            {isPending ? "Publishing..." : "Publish Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
