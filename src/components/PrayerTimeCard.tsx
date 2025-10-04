interface PrayerTimeCardProps {
  name: string;
  time: string;
  isNext?: boolean;
  isCurrent?: boolean;
}

export const PrayerTimeCard = ({
  name,
  time,
  isNext,
  isCurrent,
}: PrayerTimeCardProps) => {
  return (
    <div
      className={`prayer-card ${isNext ? 'next' : ''} ${isCurrent ? 'current' : ''}`}
    >
      <div className="prayer-name">{name}</div>
      <div className="prayer-time">{time}</div>
      {isNext && <div className="badge">Berikutnya</div>}
      {isCurrent && <div className="badge current-badge">Sekarang</div>}
    </div>
  );
};
