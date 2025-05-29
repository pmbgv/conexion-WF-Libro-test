import PermissionCalendarManager from "@/components/PermissionCalendarManager";
import { Helmet } from "react-helmet";

export default function SchedulePage() {
  return (
    <>
      <Helmet>
        <title>Calendario de Permisos | GeoVictoria</title>
        <meta name="description" content="Visualiza y gestiona los permisos del equipo con nuestro calendario mensual interactivo." />
      </Helmet>
      <PermissionCalendarManager />
    </>
  );
}
