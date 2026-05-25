const KM_PER_MILE = 1.609344;

export type PaceUnit = "mile" | "kilometer";

export function paceToSeconds(minutes: number, seconds: number): number {
  return minutes * 60 + seconds;
}

export function secondsToPace(totalSeconds: number): {
  minutes: number;
  seconds: number;
} {
  const roundedSeconds = Math.max(0, Math.round(totalSeconds));

  return {
    minutes: Math.floor(roundedSeconds / 60),
    seconds: roundedSeconds % 60,
  };
}

export function convertPaceSeconds(
  totalSeconds: number,
  fromUnit: PaceUnit,
): number {
  return fromUnit === "mile"
    ? totalSeconds / KM_PER_MILE
    : totalSeconds * KM_PER_MILE;
}

export function formatPace(totalSeconds: number): string {
  const pace = secondsToPace(totalSeconds);
  return `${pace.minutes}:${pace.seconds.toString().padStart(2, "0")}`;
}
