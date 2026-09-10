import { useEffect, useState } from "react";
import { Gift, Users, Trophy, Clock } from "lucide-react";

function GiveawayStats({
  currentGiveaway,
  allGiveaways = [],
  previousWinners = [],
}) {
  const targetDate =
    currentGiveaway?.status === "UPCOMING"
      ? currentGiveaway?.startAt
      : currentGiveaway?.endAt;

  const target = targetDate ? new Date(targetDate) : null;

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeLeft = target
    ? Math.max(0, target.getTime() - now)
    : 0;

  const totalHours = Math.floor(timeLeft / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  const totalGiveaways = allGiveaways.length;

  const totalParticipants = allGiveaways.reduce(
    (total, giveaway) =>
      total + Number(giveaway.participantCount || 0),
    0
  );

  const prizesWon = previousWinners.length;

  const stats = [
    {
      label: "Total Giveaways",
      value: totalGiveaways.toLocaleString(),
      icon: Gift,
    },
    {
      label: "Total Participants",
      value: totalParticipants.toLocaleString(),
      icon: Users,
    },
    {
      label: "Prizes Won",
      value: prizesWon.toLocaleString(),
      icon: Trophy,
    },
    {
      label:
        currentGiveaway?.status === "UPCOMING"
          ? "Starts In"
          : "Giveaway Ends In",
      value: currentGiveaway
        ? `${days}d : ${hours}h`
        : "—",
      icon: Clock,
    },
  ];

  return (
    <section
      className="giveaway-stats"
      aria-label="Giveaway statistics"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon">
              <Icon size={20} />
            </div>

            <div className="stat-content">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default GiveawayStats;
