import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

function Countdown({ targetDate, onExpire, mode = "end" }) {
  const calculateTime = () => {
    const difference = new Date(targetDate).getTime() - Date.now();

    if (difference <= 0) {
      return {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calculateTime);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextTime = calculateTime();
      setTime(nextTime);

      if (nextTime.total <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  const format = (value) => String(value).padStart(2, "0");

  const heading =
    mode === "start"
      ? time.total > 0
        ? "Starts In"
        : "Giveaway Started"
      : time.total > 0
        ? "Ends In"
        : "Giveaway Ended";

  return (
    <div className="countdown" aria-label="Giveaway countdown">
      <div className="countdown-heading">
        <Clock3 size={18} />
        <span>{heading}</span>
      </div>

      {time.total > 0 && (
        <div className="countdown-grid">
          <div>
            <strong>{format(time.days)}</strong>
            <span>Days</span>
          </div>

          <div>
            <strong>{format(time.hours)}</strong>
            <span>Hours</span>
          </div>

          <div>
            <strong>{format(time.minutes)}</strong>
            <span>Minutes</span>
          </div>

          <div>
            <strong>{format(time.seconds)}</strong>
            <span>Seconds</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Countdown;
