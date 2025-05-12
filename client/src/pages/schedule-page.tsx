import ScheduleManager from "@/components/schedule/ScheduleManager";
import { Helmet } from "react-helmet";

export default function SchedulePage() {
  return (
    <>
      <Helmet>
        <title>Work Schedule | ShiftPlanner</title>
        <meta name="description" content="Manage your team's weekly work schedule with our interactive calendar view." />
      </Helmet>
      <ScheduleManager />
    </>
  );
}
