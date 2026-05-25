import { type FocusEvent, useEffect, useState } from "react";
import {
  type PaceUnit,
  paceSecondsToSecondsPerMeter,
  secondsToPace,
  secondsPerMeterToPaceSeconds,
} from "./pace";

type PaceEditorProps = {
  unit: PaceUnit;
  heading: string;
  label: string;
  secondsPerMeter: number;
  activeUnit: PaceUnit | null;
  onFocus: (unit: PaceUnit) => void;
  onBlur: () => void;
  onChange: (unit: PaceUnit, paceSeconds: number) => void;
};

type FinishTimeEditorProps = {
  activeRace: string | null;
  label: string;
  meters: number;
  secondsPerMeter: number;
  onChange: (meters: number, finishSeconds: number) => void;
  onFocus: (race: string) => void;
  onBlur: () => void;
};

type ThemeMode = "system" | "light" | "dark";
type SelectedRace = {
  category: RaceTab;
  name: string;
  meters: number;
};
type PredictionSnapshot = {
  race: SelectedRace;
  sourceSeconds: number;
};
type RaceDetailTab = "Predictions" | "Performance" | "Records";
type RaceDetailSnapshot = {
  id: string;
  activeTab: RaceDetailTab;
  predictionSnapshot: PredictionSnapshot;
};

const themeChromeColors = {
  light: "#c3ccd7",
  dark: "#0d131c",
};

const initialSecondsPerMeter = paceSecondsToSecondsPerMeter(8 * 60, "mile");

function cleanTwoDigitValue(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

function formatTwoDigits(value: number): string {
  return value.toString().padStart(2, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeTwoDigitDraft(value: string, maxValue?: number): string {
  const parsedValue = Number.parseInt(value || "0", 10);
  const normalizedValue =
    maxValue === undefined ? parsedValue : Math.min(parsedValue, maxValue);

  return formatTwoDigits(normalizedValue);
}

function PaceEditor({
  unit,
  heading,
  label,
  secondsPerMeter,
  activeUnit,
  onFocus,
  onBlur,
  onChange,
}: PaceEditorProps) {
  const paceSeconds = secondsPerMeterToPaceSeconds(secondsPerMeter, unit);
  const pace = secondsToPace(paceSeconds);
  const formattedMinutes = formatTwoDigits(pace.minutes);
  const formattedSeconds = formatTwoDigits(pace.seconds);
  const [draftMinutes, setDraftMinutes] = useState(formattedMinutes);
  const [draftSeconds, setDraftSeconds] = useState(formattedSeconds);
  const isEditing = activeUnit === unit;

  useEffect(() => {
    if (!isEditing) {
      setDraftMinutes(formattedMinutes);
      setDraftSeconds(formattedSeconds);
    }
  }, [formattedMinutes, formattedSeconds, isEditing]);

  function updatePacePart(nextMinutes: string, nextSeconds: string) {
    onFocus(unit);
    const minutes = Number.parseInt(nextMinutes || "0", 10);
    const rawSeconds = Number.parseInt(nextSeconds || "0", 10);
    onChange(unit, minutes * 60 + Math.min(rawSeconds, 59));
  }

  function updateMinutes(value: string) {
    const nextMinutes = cleanTwoDigitValue(value);
    setDraftMinutes(nextMinutes);
    updatePacePart(nextMinutes, draftSeconds);
  }

  function updateSeconds(value: string) {
    const nextSeconds = cleanTwoDigitValue(value);

    setDraftSeconds(nextSeconds);
    updatePacePart(draftMinutes, nextSeconds);
  }

  function commitParts(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setDraftMinutes(formattedMinutes);
    setDraftSeconds(formattedSeconds);
    onBlur();
  }

  return (
    <section className="pace-card" aria-label={`${label} pace`}>
      <p className="pace-heading">{heading}</p>
      <div className="pace-input" aria-label={`${label} pace`} onBlur={commitParts}>
        <div className="digit-stack">
          <input
            aria-label={`${label} pace minutes`}
            inputMode="numeric"
            maxLength={2}
            placeholder="08"
            type="text"
            value={isEditing ? draftMinutes : formattedMinutes}
            onBlur={() => setDraftMinutes(normalizeTwoDigitDraft(draftMinutes))}
            onChange={(event) => updateMinutes(event.target.value)}
            onFocus={(event) => {
              onFocus(unit);
              event.currentTarget.select();
            }}
          />
          <input
            aria-label={`${label} pace seconds`}
            inputMode="numeric"
            maxLength={2}
            placeholder="00"
            type="text"
            value={isEditing ? draftSeconds : formattedSeconds}
            onBlur={() => setDraftSeconds(normalizeTwoDigitDraft(draftSeconds, 59))}
            onChange={(event) => updateSeconds(event.target.value)}
            onFocus={(event) => {
              onFocus(unit);
              event.currentTarget.select();
            }}
          />
        </div>

        <div className="label-stack" aria-hidden="true">
          <span>min</span>
          <span>sec</span>
        </div>
      </div>
    </section>
  );
}

const sliderRange = {
  min: paceSecondsToSecondsPerMeter(3 * 60, "mile"),
  max: paceSecondsToSecondsPerMeter(20 * 60, "mile"),
};
const paceStepSecondsPerMeter = 0.005;

const raceCategories = {
  Track: [
    { name: "100m", meters: 100 },
    { name: "200m", meters: 200 },
    { name: "400m", meters: 400 },
    { name: "800m", meters: 800 },
    { name: "1500m", meters: 1500 },
    { name: "Mile", meters: 1609.344 },
  ],
  Road: [
    { name: "5K", meters: 5000 },
    { name: "10K", meters: 10000 },
    { name: "10 Mile", meters: 16093.44 },
    { name: "Half Marathon", meters: 21097.5 },
    { name: "30K", meters: 30000 },
    { name: "Marathon", meters: 42195 },
  ],
  Ultra: [
    { name: "50K", meters: 50000 },
    { name: "50 Mile", meters: 80467.2 },
    { name: "100K", meters: 100000 },
    { name: "100 Mile", meters: 160934.4 },
    { name: "150 Mile", meters: 241401.6 },
    { name: "200 Mile", meters: 321868.8 },
  ],
};

type RaceCategory = keyof typeof raceCategories;
const raceCategoryNames = Object.keys(raceCategories) as RaceCategory[];
type RaceTab = RaceCategory | "Custom";
const raceTabNames = [...raceCategoryNames, "Custom"] as RaceTab[];

function cleanDecimalValue(value: string): string {
  const cleanedValue = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = cleanedValue.split(".");

  return decimalParts.length === 0
    ? whole
    : `${whole}.${decimalParts.join("")}`;
}

function formatDecimal(value: number, maxFractionDigits: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
    useGrouping: false,
  });
}

function secondsToFinishParts(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const roundedSeconds = Math.max(0, Math.round(totalSeconds));

  return {
    hours: Math.floor(roundedSeconds / 3600),
    minutes: Math.floor((roundedSeconds % 3600) / 60),
    seconds: roundedSeconds % 60,
  };
}

function formatFinishTime(totalSeconds: number): string {
  const { hours, minutes, seconds } = secondsToFinishParts(totalSeconds);

  return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(
    seconds,
  )}`;
}

function formatDistance(name: string, meters: number): string {
  const kilometers = meters / 1000;
  const miles = meters / 1609.344;
  const normalizedName = name.toLowerCase();

  if (normalizedName.endsWith("k")) {
    return `${miles.toFixed(2)} mi`;
  }

  if (normalizedName.includes("mile")) {
    return `${kilometers.toFixed(2)} km`;
  }

  if (normalizedName.endsWith("m")) {
    return `${kilometers.toFixed(2)} km · ${miles.toFixed(2)} mi`;
  }

  if (meters === 1609.344) {
    return `1 mi · ${kilometers.toFixed(2)} km`;
  }

  if (Number.isInteger(miles)) {
    return `${miles} mi · ${kilometers.toFixed(2)} km`;
  }

  if (meters % 1000 === 0) {
    return `${kilometers} km · ${miles.toFixed(2)} mi`;
  }

  return `${kilometers.toFixed(2)} km · ${miles.toFixed(2)} mi`;
}

function predictRaceTime({
  sourceMeters,
  sourceSeconds,
  targetMeters,
}: {
  sourceMeters: number;
  sourceSeconds: number;
  targetMeters: number;
}): number {
  return sourceSeconds * (targetMeters / sourceMeters) ** 1.06;
}

function RacePredictions({
  snapshot,
}: {
  snapshot: PredictionSnapshot;
}) {
  const { race, sourceSeconds } = snapshot;

  return (
    <section className="race-predictions" aria-label={`${race.name} predictions`}>
      <p className="prediction-note">
        Predicted with Riegel&apos;s formula.
      </p>

      <div className="prediction-grid">
        {raceCategoryNames.map((category) => (
          <section className="prediction-group" key={category}>
            <h4>{category}</h4>
            <div className="prediction-list">
              {raceCategories[category].map((target) => {
                const isSourceRace =
                  target.name === race.name && target.meters === race.meters;

                return (
                  <div
                    className={`prediction-row${isSourceRace ? " source" : ""}`}
                    key={target.name}
                  >
                    <span>{target.name}</span>
                    <span aria-label={isSourceRace ? "Selected race" : undefined}>
                      {isSourceRace
                        ? formatFinishTime(sourceSeconds)
                        : formatFinishTime(
                            predictRaceTime({
                              sourceMeters: race.meters,
                              sourceSeconds,
                              targetMeters: target.meters,
                            }),
                          )}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function RaceDetailPlaceholder({ children }: { children: string }) {
  return (
    <div className="race-detail-placeholder">
      <span>{children}</span>
    </div>
  );
}

function RaceInspector({
  activeTab,
  predictionSnapshot,
  onClose,
  onTabChange,
}: {
  activeTab: RaceDetailTab;
  predictionSnapshot: PredictionSnapshot;
  onClose: () => void;
  onTabChange: (tab: RaceDetailTab) => void;
}) {
  const { race, sourceSeconds } = predictionSnapshot;

  return (
    <section className="race-inspector" aria-label={`${race.name} details`}>
      <div className="race-inspector-header">
        <div>
          <h3>{race.name}</h3>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <dl className="race-inspector-list">
        <div>
          <dt>Distance</dt>
          <dd>{formatDistance(race.name, race.meters)}</dd>
        </div>
        <div>
          <dt>Finish Time</dt>
          <dd>{formatFinishTime(sourceSeconds)}</dd>
        </div>
      </dl>

      <div className="race-detail-tabs" role="tablist" aria-label="Race detail tabs">
        {(["Predictions", "Performance", "Records"] as RaceDetailTab[]).map(
          (tab) => (
            <button
              aria-selected={activeTab === tab}
              className={activeTab === tab ? "active" : ""}
              key={tab}
              role="tab"
              type="button"
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {activeTab === "Predictions" && (
        <RacePredictions snapshot={predictionSnapshot} />
      )}
      {activeTab === "Performance" && (
        <RaceDetailPlaceholder>
          Performance scoring requires age grading data.
        </RaceDetailPlaceholder>
      )}
      {activeTab === "Records" && (
        <RaceDetailPlaceholder>
          World records require curated source data.
        </RaceDetailPlaceholder>
      )}
    </section>
  );
}

function FinishTimeEditor({
  activeRace,
  label,
  meters,
  secondsPerMeter,
  onChange,
  onFocus,
  onBlur,
}: FinishTimeEditorProps) {
  const finishParts = secondsToFinishParts(secondsPerMeter * meters);
  const formattedHours = formatTwoDigits(finishParts.hours);
  const formattedMinutes = formatTwoDigits(finishParts.minutes);
  const formattedSeconds = formatTwoDigits(finishParts.seconds);
  const isEditing = activeRace === label;
  const [draftHours, setDraftHours] = useState(formattedHours);
  const [draftMinutes, setDraftMinutes] = useState(formattedMinutes);
  const [draftSeconds, setDraftSeconds] = useState(formattedSeconds);

  useEffect(() => {
    if (!isEditing) {
      setDraftHours(formattedHours);
      setDraftMinutes(formattedMinutes);
      setDraftSeconds(formattedSeconds);
    }
  }, [formattedHours, formattedMinutes, formattedSeconds, isEditing]);

  function updateFinishTime(
    nextHours: string,
    nextMinutes: string,
    nextSeconds: string,
  ) {
    onFocus(label);

    const hours = Number.parseInt(nextHours || "0", 10);
    const minutes = Number.parseInt(nextMinutes || "0", 10);
    const seconds = Number.parseInt(nextSeconds || "0", 10);

    onChange(
      meters,
      hours * 3600 + Math.min(minutes, 59) * 60 + Math.min(seconds, 59),
    );
  }

  function updateHours(value: string) {
    const nextHours = cleanTwoDigitValue(value);

    setDraftHours(nextHours);
    updateFinishTime(nextHours, draftMinutes, draftSeconds);
  }

  function updateMinutes(value: string) {
    const nextMinutes = cleanTwoDigitValue(value);

    setDraftMinutes(nextMinutes);
    updateFinishTime(draftHours, nextMinutes, draftSeconds);
  }

  function updateSeconds(value: string) {
    const nextSeconds = cleanTwoDigitValue(value);

    setDraftSeconds(nextSeconds);
    updateFinishTime(draftHours, draftMinutes, nextSeconds);
  }

  function commitParts(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setDraftHours(formattedHours);
    setDraftMinutes(formattedMinutes);
    setDraftSeconds(formattedSeconds);
    onBlur();
  }

  return (
    <div className="finish-time" aria-label={`${label} finish time`} onBlur={commitParts}>
      <input
        aria-label={`${label} finish hours`}
        inputMode="numeric"
        maxLength={2}
        type="text"
        value={isEditing ? draftHours : formattedHours}
        onBlur={() => setDraftHours(normalizeTwoDigitDraft(draftHours))}
        onChange={(event) => updateHours(event.target.value)}
        onFocus={(event) => {
          onFocus(label);
          event.currentTarget.select();
        }}
      />
      <span aria-hidden="true">:</span>
      <input
        aria-label={`${label} finish minutes`}
        inputMode="numeric"
        maxLength={2}
        type="text"
        value={isEditing ? draftMinutes : formattedMinutes}
        onBlur={() => setDraftMinutes(normalizeTwoDigitDraft(draftMinutes, 59))}
        onChange={(event) => updateMinutes(event.target.value)}
        onFocus={(event) => {
          onFocus(label);
          event.currentTarget.select();
        }}
      />
      <span aria-hidden="true">:</span>
      <input
        aria-label={`${label} finish seconds`}
        inputMode="numeric"
        maxLength={2}
        type="text"
        value={isEditing ? draftSeconds : formattedSeconds}
        onBlur={() => setDraftSeconds(normalizeTwoDigitDraft(draftSeconds, 59))}
        onChange={(event) => updateSeconds(event.target.value)}
        onFocus={(event) => {
          onFocus(label);
          event.currentTarget.select();
        }}
      />
    </div>
  );
}

function CustomDistanceEditor({
  meters,
  onChange,
}: {
  meters: number;
  onChange: (meters: number) => void;
}) {
  const formattedKilometers = formatDecimal(meters / 1000, 3);
  const formattedMiles = formatDecimal(meters / 1609.344, 3);
  const [activeUnit, setActiveUnit] = useState<"kilometer" | "mile" | null>(null);
  const [draftKilometers, setDraftKilometers] = useState(formattedKilometers);
  const [draftMiles, setDraftMiles] = useState(formattedMiles);

  useEffect(() => {
    if (activeUnit !== "kilometer") {
      setDraftKilometers(formattedKilometers);
    }

    if (activeUnit !== "mile") {
      setDraftMiles(formattedMiles);
    }
  }, [activeUnit, formattedKilometers, formattedMiles]);

  function updateKilometers(value: string) {
    const nextValue = cleanDecimalValue(value);
    const parsedValue = Number.parseFloat(nextValue);

    setDraftKilometers(nextValue);
    setActiveUnit("kilometer");

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      onChange(parsedValue * 1000);
    }
  }

  function updateMiles(value: string) {
    const nextValue = cleanDecimalValue(value);
    const parsedValue = Number.parseFloat(nextValue);

    setDraftMiles(nextValue);
    setActiveUnit("mile");

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      onChange(parsedValue * 1609.344);
    }
  }

  return (
    <div className="custom-distance-list" aria-label="Custom distance">
      <label>
        <span>Kilometers</span>
        <input
          inputMode="decimal"
          type="text"
          value={activeUnit === "kilometer" ? draftKilometers : formattedKilometers}
          onBlur={() => {
            setDraftKilometers(formattedKilometers);
            setActiveUnit(null);
          }}
          onChange={(event) => updateKilometers(event.target.value)}
          onFocus={(event) => {
            setActiveUnit("kilometer");
            event.currentTarget.select();
          }}
        />
      </label>
      <label>
        <span>Miles</span>
        <input
          inputMode="decimal"
          type="text"
          value={activeUnit === "mile" ? draftMiles : formattedMiles}
          onBlur={() => {
            setDraftMiles(formattedMiles);
            setActiveUnit(null);
          }}
          onChange={(event) => updateMiles(event.target.value)}
          onFocus={(event) => {
            setActiveUnit("mile");
            event.currentTarget.select();
          }}
        />
      </label>
    </div>
  );
}

export function App() {
  const [secondsPerMeter, setSecondsPerMeter] = useState(initialSecondsPerMeter);
  const [activeUnit, setActiveUnit] = useState<PaceUnit | null>(null);
  const [activeRace, setActiveRace] = useState<string | null>(null);
  const [raceDetails, setRaceDetails] = useState<RaceDetailSnapshot[]>([]);
  const [raceCategory, setRaceCategory] = useState<RaceTab>("Road");
  const [customMeters, setCustomMeters] = useState(10000);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const themeColorMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

    function updateThemeChrome() {
      const isDark =
        themeMode === "dark" || (themeMode === "system" && systemDarkQuery.matches);

      themeColorMeta?.setAttribute(
        "content",
        isDark ? themeChromeColors.dark : themeChromeColors.light,
      );
    }

    document.documentElement.dataset.theme = themeMode;
    updateThemeChrome();
    systemDarkQuery.addEventListener("change", updateThemeChrome);

    return () => systemDarkQuery.removeEventListener("change", updateThemeChrome);
  }, [themeMode]);

  function updatePace(unit: PaceUnit, paceSeconds: number) {
    setActiveRace(null);
    setSecondsPerMeter(paceSecondsToSecondsPerMeter(paceSeconds, unit));
  }

  function updatePaceFromFinishTime(meters: number, finishSeconds: number) {
    setActiveUnit(null);
    setSecondsPerMeter(finishSeconds / meters);
  }

  function updateSharedSlider(value: string) {
    setActiveUnit(null);
    setActiveRace(null);
    setSecondsPerMeter(sliderRange.max + sliderRange.min - Number(value));
  }

  function adjustSecondsPerMeter(secondsDelta: number) {
    setActiveUnit(null);
    setActiveRace(null);
    setSecondsPerMeter((currentSecondsPerMeter) => {
      return Math.min(
        sliderRange.max,
        Math.max(sliderRange.min, currentSecondsPerMeter + secondsDelta),
      );
    });
  }

  const sliderValue = clamp(
    sliderRange.max + sliderRange.min - secondsPerMeter,
    sliderRange.min,
    sliderRange.max,
  );
  const customRace: SelectedRace = {
    category: "Custom",
    name: "Custom Race",
    meters: customMeters,
  };

  function updateCustomMeters(nextMeters: number) {
    setCustomMeters(nextMeters);
  }

  function selectRace(race: SelectedRace) {
    setRaceDetails((currentRaceDetails) => [
      {
        id: `${race.name}-${race.meters}-${Date.now()}`,
        activeTab: "Predictions",
        predictionSnapshot: {
          race,
          sourceSeconds: secondsPerMeter * race.meters,
        },
      },
      ...currentRaceDetails,
    ]);
  }

  function closeRaceDetail(id: string) {
    setRaceDetails((currentRaceDetails) =>
      currentRaceDetails.filter((raceDetail) => raceDetail.id !== id),
    );
  }

  function updateRaceDetailTab(id: string, activeTab: RaceDetailTab) {
    setRaceDetails((currentRaceDetails) =>
      currentRaceDetails.map((raceDetail) =>
        raceDetail.id === id ? { ...raceDetail, activeTab } : raceDetail,
      ),
    );
  }

  return (
    <main className="page-shell">
      <div className="custom-theme-color" aria-hidden="true" />
      <div className="page-toolbar">
        <div className="theme-toggle" aria-label="Theme mode">
          {(["system", "light", "dark"] as ThemeMode[]).map((mode) => (
            <button
              aria-pressed={themeMode === mode}
              className={themeMode === mode ? "active" : ""}
              key={mode}
              type="button"
              onClick={() => setThemeMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <section className="app-block converter" aria-labelledby="page-title">
        <h1 id="page-title" className="sr-only">
          Pace converter
        </h1>
        <div className="pace-grid">
          <PaceEditor
            activeUnit={activeUnit}
            heading="Per mile"
            label="mi"
            secondsPerMeter={secondsPerMeter}
            unit="mile"
            onChange={updatePace}
            onBlur={() => setActiveUnit(null)}
            onFocus={setActiveUnit}
          />

          <PaceEditor
            activeUnit={activeUnit}
            heading="Per kilometer"
            label="km"
            secondsPerMeter={secondsPerMeter}
            unit="kilometer"
            onChange={updatePace}
            onBlur={() => setActiveUnit(null)}
            onFocus={setActiveUnit}
          />
        </div>

        <div className="slider-field" aria-label="Pace adjustment">
          <button
            type="button"
            onClick={() => adjustSecondsPerMeter(paceStepSecondsPerMeter)}
          >
            Slower
          </button>
          <input
            aria-label="Adjust pace"
            max={sliderRange.max}
            min={sliderRange.min}
            step="0.00001"
            type="range"
            value={sliderValue}
            onChange={(event) => updateSharedSlider(event.target.value)}
          />
          <button
            type="button"
            onClick={() => adjustSecondsPerMeter(-paceStepSecondsPerMeter)}
          >
            Faster
          </button>
        </div>
      </section>

      {raceDetails.map((raceDetail) => (
        <section className="app-block" aria-label="Race detail" key={raceDetail.id}>
          <RaceInspector
            activeTab={raceDetail.activeTab}
            predictionSnapshot={raceDetail.predictionSnapshot}
            onClose={() => closeRaceDetail(raceDetail.id)}
            onTabChange={(activeTab) =>
              updateRaceDetailTab(raceDetail.id, activeTab)
            }
          />
        </section>
      ))}

      <section className="app-block race-table" aria-labelledby="race-table-title">
        <h2 id="race-table-title" className="sr-only">
          Finish times
        </h2>
        <div className="race-tabs" role="tablist" aria-label="Race categories">
          {raceTabNames.map((category) => (
            <button
              aria-selected={raceCategory === category}
              className={raceCategory === category ? "active" : ""}
              key={category}
              role="tab"
              type="button"
              onClick={() => setRaceCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {raceCategory === "Custom" ? (
          <>
            <CustomDistanceEditor
              meters={customMeters}
              onChange={updateCustomMeters}
            />
            <div className="race-list">
              <div className="race-row">
                <button
                  aria-label="Inspect custom distance"
                  className="race-info-button"
                  type="button"
                  onClick={() => selectRace(customRace)}
                >
                  i
                </button>
                <span>Custom Race</span>
                <FinishTimeEditor
                  activeRace={activeRace}
                  label="Custom Race"
                  meters={customMeters}
                  secondsPerMeter={secondsPerMeter}
                  onChange={updatePaceFromFinishTime}
                  onBlur={() => setActiveRace(null)}
                  onFocus={setActiveRace}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="race-list">
            {raceCategories[raceCategory].map((race) => (
            <div className="race-row" key={race.name}>
              <button
                aria-label={`Inspect ${race.name}`}
                className="race-info-button"
                type="button"
                onClick={() =>
                  selectRace({
                    category: raceCategory,
                    name: race.name,
                    meters: race.meters,
                  })
                }
              >
                i
              </button>
              <span>{race.name}</span>
              <FinishTimeEditor
                activeRace={activeRace}
                label={race.name}
                meters={race.meters}
                secondsPerMeter={secondsPerMeter}
                onChange={updatePaceFromFinishTime}
                onBlur={() => setActiveRace(null)}
                onFocus={setActiveRace}
              />
            </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
