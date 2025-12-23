import { Timer } from "@phosphor-icons/react";
import {
  generatePaceOptions,
  generateSpeedOptions,
  findClosestValue,
  findBoundingPosition,
} from "../util";
import sharedStyles from "./shared.module.css";
import WheelPickerContainer from "./wheelpickercontainer";

interface PaceConverterProps {
  minPerMile: string;
  minPerKm: string;
  mph: string;
  kmh: string;
  preciseMinPerMile: number;
  preciseMinPerKm: number;
  preciseMph: number;
  preciseKmh: number;
  lastChangedUnit: string;
  onValueChange: (newValue: string, changedUnit: string) => void;
}

export default function PaceConverter({
  minPerMile,
  minPerKm,
  mph,
  kmh,
  preciseMinPerMile,
  preciseMinPerKm,
  preciseMph,
  preciseKmh,
  lastChangedUnit,
  onValueChange,
}: PaceConverterProps) {
  console.log("🏃‍♂️ PaceConverter render with state:", {
    minPerMile,
    minPerKm,
    mph,
    kmh,
    preciseMinPerMile,
    preciseMinPerKm,
    preciseMph,
    preciseKmh,
    lastChangedUnit,
  });

  const minMileOptions = generatePaceOptions(4, 15);
  const minKmOptions = generatePaceOptions(2.5, 9);
  const mphOptions = generateSpeedOptions(3, 20, 0.1);
  const kmhOptions = generateSpeedOptions(5, 32, 0.1);

  console.log("📊 Generated options counts:", {
    minMileOptions: minMileOptions.length,
    minKmOptions: minKmOptions.length,
    mphOptions: mphOptions.length,
    kmhOptions: kmhOptions.length,
  });

  // Active wheel uses exact value, non-active wheels use bounding position
  const minMileValue = lastChangedUnit === "min/mi" 
    ? findClosestValue(parseFloat(minPerMile), minMileOptions)
    : findBoundingPosition(parseFloat(minPerMile), minMileOptions);
  
  const minKmValue = lastChangedUnit === "min/km"
    ? findClosestValue(parseFloat(minPerKm), minKmOptions)
    : findBoundingPosition(parseFloat(minPerKm), minKmOptions);
  
  const mphValue = lastChangedUnit === "mph"
    ? findClosestValue(parseFloat(mph), mphOptions)
    : findBoundingPosition(parseFloat(mph), mphOptions);
  
  const kmhValue = lastChangedUnit === "kmh"
    ? findClosestValue(parseFloat(kmh), kmhOptions)
    : findBoundingPosition(parseFloat(kmh), kmhOptions);

  console.log("🎯 Closest values found:", {
    minMileValue,
    minKmValue,
    mphValue,
    kmhValue,
  });

  const pickers = [
    {
      options: minMileOptions,
      value: minMileValue,
      exactValue: preciseMinPerMile,
      isActiveWheel: lastChangedUnit === "min/mi",
      onValueChange: (value: string) => {
        console.log("MIN/MI picker changed to:", value);
        onValueChange(value, "min/mi");
      },
      unit: "MIN/MI",
    },
    {
      options: minKmOptions,
      value: minKmValue,
      exactValue: preciseMinPerKm,
      isActiveWheel: lastChangedUnit === "min/km",
      onValueChange: (value: string) => {
        console.log("MIN/KM picker changed to:", value);
        onValueChange(value, "min/km");
      },
      unit: "MIN/KM",
    },
    {
      options: mphOptions,
      value: mphValue,
      exactValue: preciseMph,
      isActiveWheel: lastChangedUnit === "mph",
      onValueChange: (value: string) => {
        console.log("MPH picker changed to:", value);
        onValueChange(value, "mph");
      },
      unit: "MPH",
    },
    {
      options: kmhOptions,
      value: kmhValue,
      exactValue: preciseKmh,
      isActiveWheel: lastChangedUnit === "kmh",
      onValueChange: (value: string) => {
        console.log("KM/H picker changed to:", value);
        onValueChange(value, "kmh");
      },
      unit: "KM/H",
    },
  ];

  console.log(
    "📋 Final picker props:",
    pickers.map((p) => ({
      unit: p.unit,
      value: p.value,
      exactValue: p.exactValue,
      isActiveWheel: p.isActiveWheel,
      optionsCount: p.options.length,
      firstOption: p.options[0],
      lastOption: p.options[p.options.length - 1],
      matchingOptions: p.options.filter((opt) => opt.value === p.value).length,
    })),
  );

  return (
    <div className={sharedStyles.headerContainer}>
      <div className={sharedStyles.sectionHeader}>
        <span>Pace Converter</span>
        <Timer
          size={16}
          weight="regular"
          color="currentColor"
          className={sharedStyles.headerIcon}
        />
      </div>
      <WheelPickerContainer pickers={pickers} />
    </div>
  );
}
