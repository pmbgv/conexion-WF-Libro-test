import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Employee } from "@shared/schema";
import { PermissionFormData } from "@/hooks/use-permission";
import { useToast } from "@/hooks/use-toast";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  employees: Employee[];
  onAddPermission: (data: PermissionFormData) => Promise<void>;
}

const PERMISSION_TYPES = [
  "Sin permiso",
  "Vacaciones", 
  "Administrativo",
  "Fallecimiento",
  "Capacitación",
  "Sindical",
  "Reunión",
  "Accidentes",
  "Compensación",
  "Amamantamiento",
  "Permiso con Goce",
  "Permiso sin Goce",
  "Ley 20823",
  "Estudio MDA"
];

const permissionSchema = z.object({
  employeeId: z.string().min(1, "Debe seleccionar un empleado"),
  type: z.string().min(1, "Debe seleccionar un tipo de permiso"),
  reason: z.string().optional(),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

export default function PermissionModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  employees,
  onAddPermission
}: PermissionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      employeeId: "",
      type: "",
      reason: "",
    },
  });

  const handleSubmit = async (values: PermissionFormValues) => {
    if (!selectedDate) return;

    setIsSubmitting(true);
    try {
      await onAddPermission({
        employeeId: values.employeeId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        type: values.type,
        reason: values.reason || "",
      });
      
      toast({
        title: "Permiso agregado",
        description: "El permiso se ha agregado correctamente",
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el permiso",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Ausencia</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="text-sm text-gray-600">
              Fecha: {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : ""}
            </div>

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empleado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empleado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Permiso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de permiso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PERMISSION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ingrese el motivo del permiso..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Permiso"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}