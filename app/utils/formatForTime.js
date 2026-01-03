export const formatForTime = (seconds = 0) => {
  if (isNaN(seconds)) return "0:00.000";

  const totalMs = Math.floor(seconds * 1000);

  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);

  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);

  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  }

  return `${m}:${s.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(3, "0")}`;
};
