import { useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  convertPace,
  findClosestValue,
  findBoundingPosition,
  generatePaceOptions,
  generateSpeedOptions,
} from "./util";
import AppHeader from "./components/appheader";
import PaceCommand from "./components/pacecommand";
import PaceConverter from "./components/converter";
import RaceFinishTimes from "./components/racetimes";

export default function App() {
  const [minPerMile, setMinPerMile] = useState("8.00");
  const [minPerKm, setMinPerKm] = useState("4.97");
  const [mph, setMph] = useState("7.5");
  const [kmh, setKmh] = useState("12.1");
  const [lastChangedUnit, setLastChangedUnit] = useState<string>("min/mi");

  // Store the exact precise values for highlights
  const [preciseMinPerMile, setPreciseMinPerMile] = useState(8.0);
  const [preciseMinPerKm, setPreciseMinPerKm] = useState(4.97);
  const [preciseMph, setPreciseMph] = useState(7.5);
  const [preciseKmh, setPreciseKmh] = useState(12.1);

  const minMileOptions = generatePaceOptions(4, 15);
  const minKmOptions = generatePaceOptions(2.5, 9);
  const mphOptions = generateSpeedOptions(3, 20, 0.1);
  const kmhOptions = generateSpeedOptions(5, 32, 0.1);

  const handleValueChange = (newValue: string, changedUnit: string) => {
    const numValue = parseFloat(newValue);
    setLastChangedUnit(changedUnit);

    if (changedUnit === "min/mi") {
      setMinPerMile(newValue);
      setPreciseMinPerMile(numValue);

      // Calculate precise conversions
      const preciseMinKmValue = convertPace(numValue, "min/mi", "min/km");
      const preciseMphValue = convertPace(numValue, "min/mi", "mph");
      const preciseKmhValue = convertPace(numValue, "min/mi", "kmh");

      setPreciseMinPerKm(preciseMinKmValue);
      setPreciseMph(preciseMphValue);
      setPreciseKmh(preciseKmhValue);

      // Set wheel positions to bounding discrete values for precise display
      setMinPerKm(findBoundingPosition(preciseMinKmValue, minKmOptions));
      setMph(findBoundingPosition(preciseMphValue, mphOptions));
      setKmh(findBoundingPosition(preciseKmhValue, kmhOptions));
    } else if (changedUnit === "min/km") {
      setMinPerKm(newValue);
      setPreciseMinPerKm(numValue);

      // Calculate precise conversions
      const preciseMinMileValue = convertPace(numValue, "min/km", "min/mi");
      const preciseMphValue = convertPace(numValue, "min/km", "mph");
      const preciseKmhValue = convertPace(numValue, "min/km", "kmh");

      setPreciseMinPerMile(preciseMinMileValue);
      setPreciseMph(preciseMphValue);
      setPreciseKmh(preciseKmhValue);

      // Set wheel positions to bounding discrete values for precise display
      setMinPerMile(findBoundingPosition(preciseMinMileValue, minMileOptions));
      setMph(findBoundingPosition(preciseMphValue, mphOptions));
      setKmh(findBoundingPosition(preciseKmhValue, kmhOptions));
    } else if (changedUnit === "mph") {
      setMph(newValue);
      setPreciseMph(numValue);

      // Calculate precise conversions
      const preciseMinMileValue = convertPace(numValue, "mph", "min/mi");
      const preciseMinKmValue = convertPace(numValue, "mph", "min/km");
      const preciseKmhValue = convertPace(numValue, "mph", "kmh");

      setPreciseMinPerMile(preciseMinMileValue);
      setPreciseMinPerKm(preciseMinKmValue);
      setPreciseKmh(preciseKmhValue);

      // Set wheel positions to bounding discrete values for precise display
      setMinPerMile(findBoundingPosition(preciseMinMileValue, minMileOptions));
      setMinPerKm(findBoundingPosition(preciseMinKmValue, minKmOptions));
      setKmh(findBoundingPosition(preciseKmhValue, kmhOptions));
    } else if (changedUnit === "kmh") {
      setKmh(newValue);
      setPreciseKmh(numValue);

      // Calculate precise conversions
      const preciseMinMileValue = convertPace(numValue, "kmh", "min/mi");
      const preciseMinKmValue = convertPace(numValue, "kmh", "min/km");
      const preciseMphValue = convertPace(numValue, "kmh", "mph");

      setPreciseMinPerMile(preciseMinMileValue);
      setPreciseMinPerKm(preciseMinKmValue);
      setPreciseMph(preciseMphValue);

      // Set wheel positions to bounding discrete values for precise display
      setMinPerMile(findBoundingPosition(preciseMinMileValue, minMileOptions));
      setMinPerKm(findBoundingPosition(preciseMinKmValue, minKmOptions));
      setMph(findBoundingPosition(preciseMphValue, mphOptions));
    }
  };

  const handlePreciseUpdate = (preciseMinPerMileValue: number) => {
    setLastChangedUnit("min/mi");
    setPreciseMinPerMile(preciseMinPerMileValue);

    // Calculate all precise conversions
    const preciseMinKmValue = convertPace(
      preciseMinPerMileValue,
      "min/mi",
      "min/km",
    );
    const preciseMphValue = convertPace(
      preciseMinPerMileValue,
      "min/mi",
      "mph",
    );
    const preciseKmhValue = convertPace(
      preciseMinPerMileValue,
      "min/mi",
      "kmh",
    );

    setPreciseMinPerKm(preciseMinKmValue);
    setPreciseMph(preciseMphValue);
    setPreciseKmh(preciseKmhValue);

    // Update display values with bounding positions (active wheel gets exact value)
    setMinPerMile(findClosestValue(preciseMinPerMileValue, minMileOptions));
    setMinPerKm(findBoundingPosition(preciseMinKmValue, minKmOptions));
    setMph(findBoundingPosition(preciseMphValue, mphOptions));
    setKmh(findBoundingPosition(preciseKmhValue, kmhOptions));
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Pace Converter</title>
        <meta name="description" content="Running pace converter tool" />
      </Helmet>

      <AppHeader />
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <PaceCommand onCommandUpdate={handlePreciseUpdate} />

        <PaceConverter
          minPerMile={minPerMile}
          minPerKm={minPerKm}
          mph={mph}
          kmh={kmh}
          preciseMinPerMile={preciseMinPerMile}
          preciseMinPerKm={preciseMinPerKm}
          preciseMph={preciseMph}
          preciseKmh={preciseKmh}
          lastChangedUnit={lastChangedUnit}
          onValueChange={handleValueChange}
        />

        <RaceFinishTimes
          minPerMile={preciseMinPerMile.toFixed(3)}
          onPreciseUpdate={handlePreciseUpdate}
        />
      </div>
    </HelmetProvider>
  );
}
