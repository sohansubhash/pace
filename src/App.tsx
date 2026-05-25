import { useMemo, useState } from "react";
import {
  type PaceUnit,
  convertPaceSeconds,
  formatPace,
  paceToSeconds,
} from "./pace";

const unitLabels: Record<PaceUnit, string> = {
  mile: "min / mile",
  kilometer: "min / km",
};

export function App() {
  const [unit, setUnit] = useState<PaceUnit>("mile");
  const [minutes, setMinutes] = useState(8);
  const [seconds, setSeconds] = useState(0);

  const totalSeconds = paceToSeconds(minutes, seconds);
  const convertedUnit: PaceUnit = unit === "mile" ? "kilometer" : "mile";
  const convertedSeconds = useMemo(
    () => convertPaceSeconds(totalSeconds, unit),
    [totalSeconds, unit],
  );

  function updateMinutes(value: string) {
    setMinutes(Math.max(0, Number.parseInt(value || "0", 10)));
  }

  function updateSeconds(value: string) {
    const nextSeconds = Math.max(0, Number.parseInt(value || "0", 10));
    setSeconds(Math.min(59, nextSeconds));
  }

  return (
    <main className="page-shell">
      <section className="converter" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">Running pace converter</p>
          <h1 id="page-title">Convert mile and kilometer pace.</h1>
        </div>

        <div className="control-grid">
          <label className="field">
            <span>Minutes</span>
            <input
              min="0"
              inputMode="numeric"
              type="number"
              value={minutes}
              onChange={(event) => updateMinutes(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Seconds</span>
            <input
              min="0"
              max="59"
              inputMode="numeric"
              type="number"
              value={seconds}
              onChange={(event) => updateSeconds(event.target.value)}
            />
          </label>
        </div>

        <div className="unit-toggle" aria-label="Input pace unit">
          <button
            className={unit === "mile" ? "active" : ""}
            type="button"
            onClick={() => setUnit("mile")}
          >
            min / mile
          </button>
          <button
            className={unit === "kilometer" ? "active" : ""}
            type="button"
            onClick={() => setUnit("kilometer")}
          >
            min / km
          </button>
        </div>

        <div className="result" aria-live="polite">
          <span>
            {formatPace(totalSeconds)} {unitLabels[unit]}
          </span>
          <strong>
            {formatPace(convertedSeconds)} {unitLabels[convertedUnit]}
          </strong>
        </div>
      </section>
    </main>
  );
}
