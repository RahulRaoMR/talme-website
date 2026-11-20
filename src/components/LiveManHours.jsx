import { useEffect, useState } from "react";
import { getManHoursDisplayAt } from "../data/manHours.js";

function LiveManHours() {
  const [display, setDisplay] = useState(() => getManHoursDisplayAt());

  useEffect(() => {
    const refresh = () => {
      const next = getManHoursDisplayAt();
      setDisplay((current) =>
        current.hours === next.hours && current.seconds === next.seconds
          ? current
          : next
      );
    };
    const intervalId = window.setInterval(refresh, 1000);

    // Recompute from elapsed working time after a background tab resumes.
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);

  return (
    <span className="manhours-value">
      {display.hours.replace(".", ":")}:
      <span className="manhours-seconds">{display.seconds}</span>
    </span>
  );
}

export default LiveManHours;
