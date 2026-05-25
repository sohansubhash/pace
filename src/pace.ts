export type PaceUnit = "mile" | "kilometer";

const metersByUnit: Record<PaceUnit, number> = {
  mile: 1609.344,
  kilometer: 1000,
};

export type PaceParts = {
  minutes: number;
  seconds: number;
};

export function paceSecondsToSecondsPerMeter(
  totalSeconds: number,
  unit: PaceUnit,
): number {
  return Math.max(0, totalSeconds) / metersByUnit[unit];
}

export function secondsPerMeterToPaceSeconds(
  secondsPerMeter: number,
  unit: PaceUnit,
): number {
  return Math.max(0, secondsPerMeter) * metersByUnit[unit];
}

export function secondsToPace(totalSeconds: number): PaceParts {
  const roundedSeconds = Math.max(0, Math.round(totalSeconds));

  return {
    minutes: Math.floor(roundedSeconds / 60),
    seconds: roundedSeconds % 60,
  };
}
