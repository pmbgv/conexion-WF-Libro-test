import { useState } from "react";
import { Employee } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface EmployeeSidebarProps {
  employees: Employee[];
  selectedPermissionTypes: string[];
  onPermissionTypeToggle: (type: string) => void;
}

const PERMISSION_TYPES = [
  { id: "sin-permiso", label: "Sin permiso", color: "bg-red-500" },
  { id: "vacaciones", label: "Vacaciones", color: "bg-blue-500" },
  { id: "administrativo", label: "Administrativo", color: "bg-green-500" },
  { id: "fallecimiento", label: "Fallecimiento", color: "bg-gray-800" },
  { id: "capacitacion", label: "Capacitación", color: "bg-purple-500" },
  { id: "sindical", label: "Sindical", color: "bg-yellow-500" },
  { id: "reunion", label: "Reunión", color: "bg-orange-500" },
  { id: "accidentes", label: "Accidentes", color: "bg-pink-500" },
  { id: "compensacion", label: "Compensación", color: "bg-teal-500" },
  { id: "amamantamiento", label: "Amamantamiento", color: "bg-indigo-500" },
  { id: "permiso-goce", label: "Permiso con Goce", color: "bg-lime-500" },
  { id: "permiso-sin-goce", label: "Permiso sin Goce", color: "bg-gray-500" },
  { id: "ley-20823", label: "Ley 20823", color: "bg-cyan-500" },
  { id: "insistencia-justificada", label: "Insistencia Justificada", color: "bg-violet-400" },
  { id: "pre-natal", label: "Pre natal", color: "bg-rose-400" },
  { id: "permiso-navidad", label: "Permiso Navidad", color: "bg-emerald-600" },
  { id: "estudio-mda", label: "Estudio MDA", color: "bg-violet-500" }
];

export default function EmployeeSidebar({ 
  employees, 
  selectedPermissionTypes, 
  onPermissionTypeToggle 
}: EmployeeSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar empleado..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Permission Type Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros de Permisos</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {PERMISSION_TYPES.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedPermissionTypes.includes(type.label)}
                onCheckedChange={() => onPermissionTypeToggle(type.label)}
              />
              <label 
                htmlFor={type.id}
                className="flex items-center space-x-2 text-sm cursor-pointer"
              >
                <div className={`w-3 h-3 rounded ${type.color}`}></div>
                <span>{type.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Personalizados</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="insistencia" />
            <label htmlFor="insistencia" className="text-sm">Insistencia Justificada</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="pre-natal" />
            <label htmlFor="pre-natal" className="text-sm">Pre natal</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="permiso-navidad" />
            <label htmlFor="permiso-navidad" className="text-sm">Permiso Navidad</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="estudio-mda" />
            <label htmlFor="estudio-mda" className="text-sm">Estudio MDA</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="control-parental" />
            <label htmlFor="control-parental" className="text-sm">Control Parental MDA</label>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Empleados</h3>
        <div className="space-y-2">
          {employees.map((employee) => (
            <div 
              key={employee.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                  {employee.initials}
                </div>
                <span>{employee.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                88:88 a 88:88
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}