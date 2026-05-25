export const MILES_TO_KM = 1.609344;

// Define our own picker option type that matches what components expect
export type PickerOption = {
  label: string;
  value: string;
};

export const convertPace = (
  value: number,
  fromUnit: string,
  toUnit: string,
): number => {
  let minPerMile: number;

  switch (fromUnit) {
    case "min/mi":
      minPerMile = value;
      break;
    case "min/km":
      minPerMile = value * MILES_TO_KM;
      break;
    case "mph":
      minPerMile = 60 / value;
      break;
    case "kmh":
      minPerMile = 60 / (value / MILES_TO_KM);
      break;
    default:
      return 0;
  }

  switch (toUnit) {
    case "min/mi":
      return minPerMile;
    case "min/km":
      return minPerMile / MILES_TO_KM;
    case "mph":
      return 60 / minPerMile;
    case "kmh":
      return (60 / minPerMile) * MILES_TO_KM;
    default:
      return 0;
  }
};

export const generatePaceOptions = (
  startMin: number,
  endMin: number,
  stepSec: number = 5,
): PickerOption[] => {
  console.log(
    `🏗️ Generating pace options: ${startMin}-${endMin}min, step: ${stepSec}s`,
  );

  const options: PickerOption[] = [];

  for (
    let totalSeconds = startMin * 60;
    totalSeconds <= endMin * 60;
    totalSeconds += stepSec
  ) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    const value = (totalSeconds / 60).toFixed(2);

    options.push({ label: timeStr, value });
  }

  const values = options.map((o) => o.value);
  const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
  if (duplicates.length > 0) {
    console.log("🚨 DUPLICATE VALUES in pace options:", duplicates);
  }

  console.log(
    `✅ Generated ${options.length} pace options (${startMin}-${endMin}min)`,
  );
  console.log("First 3 options:", options.slice(0, 3));
  console.log("Last 3 options:", options.slice(-3));

  return options;
};

export const generateSpeedOptions = (
  start: number,
  end: number,
  step: number = 0.1,
): PickerOption[] => {
  console.log(`🏗️ Generating speed options: ${start}-${end}, step: ${step}`);

  const options: PickerOption[] = [];

  for (let i = start; i <= end; i += step) {
    const rounded = Math.round(i * 10) / 10;
    const label = rounded.toFixed(1);

    options.push({
      label,
      value: rounded.toString(),
    });
  }

  const values = options.map((o) => o.value);
  const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
  if (duplicates.length > 0) {
    console.log("🚨 DUPLICATE VALUES in speed options:", duplicates);
  }

  console.log(`✅ Generated ${options.length} speed options (${start}-${end})`);
  console.log("First 3 options:", options.slice(0, 3));
  console.log("Last 3 options:", options.slice(-3));

  return options;
};

export const findClosestValue = (
  target: number,
  options: PickerOption[],
): string => {
  console.log(`🔍 Finding closest value for target: ${target}`);
  console.log(`Searching through ${options.length} options`);

  let closest = options[0];
  let minDiff = Math.abs(parseFloat(options[0].value) - target);

  console.log(`Starting with: ${closest.value} (diff: ${minDiff})`);

  options.forEach((option, index) => {
    const diff = Math.abs(parseFloat(option.value) - target);
    if (diff < minDiff) {
      minDiff = diff;
      closest = option;
      console.log(
        `🎯 New closest at index ${index}: ${option.value} (diff: ${diff})`,
      );
    }

    if (diff === 0) {
      console.log(`💯 EXACT MATCH at index ${index}: ${option.value}`);
    }
  });

  console.log(`✅ Final closest: "${closest.value}" for target: ${target}`);

  const sameValues = options.filter((o) => o.value === closest.value);
  if (sameValues.length > 1) {
    console.log(
      `🚨 MULTIPLE OPTIONS with same value "${closest.value}":`,
      sameValues.length,
      "options",
    );
    console.log("Duplicate options:", sameValues);
  }

  const exactMatch = options.find((o) => o.value === closest.value);
  if (!exactMatch) {
    console.log("❌ ERROR: Returned value not found in options!");
  }

  return closest.value;
};

// FIXED: Proper time formatting that handles seconds correctly
export const formatRaceTime = (totalMinutes: number): string => {
  const totalSeconds = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};

// Format exact decimal minutes to MM:SS format for highlights
export const formatExactPace = (decimalMinutes: number): string => {
  const totalSeconds = Math.round(decimalMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Format exact speed to proper decimal places for highlights
export const formatExactSpeed = (speed: number): string => {
  return speed.toFixed(1);
};

// Get exact formatted value for display in highlights
export const getExactDisplayValue = (value: number, unit: string): string => {
  switch (unit) {
    case "MIN/MI":
    case "MIN/KM":
      return formatExactPace(value);
    case "MPH":
    case "KM/H":
      return formatExactSpeed(value);
    default:
      return value.toString();
  }
};

export const calculateRaceTime = (
  paceMinPerMile: number,
  raceMiles: number,
): string => {
  const totalMinutes = paceMinPerMile * raceMiles;
  return formatRaceTime(totalMinutes);
};

export const parseTimeInput = (timeStr: string): number => {
  const cleanStr = timeStr.trim();

  if (cleanStr.includes(":")) {
    const parts = cleanStr.split(":").map((p) => parseInt(p));
    if (parts.length === 2) {
      return parts[0] + parts[1] / 60;
    } else if (parts.length === 3) {
      return parts[0] * 60 + parts[1] + parts[2] / 60;
    }
  } else {
    if (cleanStr.length === 3) {
      // 444 -> 4:44
      const minutes = parseInt(cleanStr.substring(0, 1));
      const seconds = parseInt(cleanStr.substring(1, 3));
      return minutes + seconds / 60;
    } else if (cleanStr.length === 4) {
      // 1044 -> 10:44
      const minutes = parseInt(cleanStr.substring(0, 2));
      const seconds = parseInt(cleanStr.substring(2, 4));
      return minutes + seconds / 60;
    } else if (cleanStr.length === 5) {
      // 10344 -> 1:03:44
      const hours = parseInt(cleanStr.substring(0, 1));
      const minutes = parseInt(cleanStr.substring(1, 3));
      const seconds = parseInt(cleanStr.substring(3, 5));
      return hours * 60 + minutes + seconds / 60;
    } else if (cleanStr.length === 6) {
      // 100344 -> 10:03:44
      const hours = parseInt(cleanStr.substring(0, 2));
      const minutes = parseInt(cleanStr.substring(2, 4));
      const seconds = parseInt(cleanStr.substring(4, 6));
      return hours * 60 + minutes + seconds / 60;
    }
  }

  return 0;
};

export const calculatePaceFromRaceTime = (
  raceTimeMinutes: number,
  raceMiles: number,
): number => {
  return raceTimeMinutes / raceMiles;
};

export const RACE_DISTANCES = {
  "5K": 3.1,
  "10K": 6.2,
  "HALF MARATHON": 13.1,
  MARATHON: 26.2,
} as const;

export const getRaceTooltip = (_raceType: string, miles: number): string => {
  const km = (miles * MILES_TO_KM).toFixed(1);
  return `${miles} miles / ${km} km`;
};

// Find the wheel position that bounds a target value between two wheel options
export const findBoundingPosition = (
  target: number,
  options: PickerOption[],
): string => {
  // Find the two options that bound the target value
  let lower = options[0];

  for (let i = 0; i < options.length - 1; i++) {
    const current = parseFloat(options[i].value);
    const next = parseFloat(options[i + 1].value);

    if (target >= current && target <= next) {
      lower = options[i];
      break;
    }
  }
  
  // Return the position that represents where the target sits between bounds
  // For wheel positioning, we'll use the lower bound as the wheel position
  return lower.value;
};

// Format precise values for display with appropriate decimal places
export const formatPreciseValue = (value: number, unit: string): string => {
  switch (unit) {
    case "MIN/MI":
    case "MIN/KM":
      // Format as time (e.g., "7:06")
      const minutes = Math.floor(value);
      const seconds = Math.round((value - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    
    case "MPH":
    case "KM/H":
      // Format as decimal with 1 decimal place
      return value.toFixed(1);
    
    default:
      return value.toFixed(2);
  }
};

// Check if a value is an exact match in the wheel options
export const isExactMatch = (value: number, options: PickerOption[]): boolean => {
  return options.some(option => Math.abs(parseFloat(option.value) - value) < 0.001);
};

// Command parsing for pace command input
export interface ParsedCommand {
  value: number;
  unit: "min/mi" | "min/km" | "mph" | "kmh";
}

export const parseCommandInput = (input: string): ParsedCommand | null => {
  const cleanInput = input.trim().toLowerCase();
  
  // Parse pace format (7:30 min/mi, 4:40 min/km)
  const paceMatch = cleanInput.match(/(\d+):(\d+)\s*(min\/mi|min\/km|\/mi|\/km)?/);
  if (paceMatch) {
    const minutes = parseInt(paceMatch[1]);
    const seconds = parseInt(paceMatch[2]);
    const paceValue = minutes + seconds / 60;
    
    if (cleanInput.includes("km") || cleanInput.includes("/km")) {
      return { value: paceValue, unit: "min/km" };
    } else {
      return { value: paceValue, unit: "min/mi" };
    }
  }
  
  // Parse speed format (8.5 mph, 13.7 kmh)
  const speedMatch = cleanInput.match(/(\d+\.?\d*)\s*(mph|kmh|km\/h|kph)?/);
  if (speedMatch && (cleanInput.includes("mph") || cleanInput.includes("kmh") || cleanInput.includes("km/h") || cleanInput.includes("kph"))) {
    const speedValue = parseFloat(speedMatch[1]);
    
    if (cleanInput.includes("mph")) {
      return { value: speedValue, unit: "mph" };
    } else if (cleanInput.includes("kmh") || cleanInput.includes("km/h") || cleanInput.includes("kph")) {
      return { value: speedValue, unit: "kmh" };
    }
  }
  
  // Parse race time format (22:15 5k, 1:45:30 half, etc.)
  const raceTimeMatch = cleanInput.match(/(\d+):(\d+)(?::(\d+))?\s*(5k|10k|half\s*marathon|marathon)/);
  if (raceTimeMatch) {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (raceTimeMatch[3]) {
      // HH:MM:SS format
      hours = parseInt(raceTimeMatch[1]);
      minutes = parseInt(raceTimeMatch[2]);
      seconds = parseInt(raceTimeMatch[3]);
    } else {
      // MM:SS format
      minutes = parseInt(raceTimeMatch[1]);
      seconds = parseInt(raceTimeMatch[2]);
    }
    
    // Convert to total minutes
    const totalMinutes = (hours * 60) + minutes + (seconds / 60);
    
    // Determine race distance
    const raceType = raceTimeMatch[4].replace(/\s+/g, " ").toUpperCase();
    let raceMiles = 0;
    
    if (raceType === "5K") raceMiles = RACE_DISTANCES["5K"];
    else if (raceType === "10K") raceMiles = RACE_DISTANCES["10K"];  
    else if (raceType === "HALF MARATHON") raceMiles = RACE_DISTANCES["HALF MARATHON"];
    else if (raceType === "MARATHON") raceMiles = RACE_DISTANCES.MARATHON;
    
    if (raceMiles > 0) {
      const paceMinPerMile = totalMinutes / raceMiles;
      return { value: paceMinPerMile, unit: "min/mi" };
    }
  }
  
  // Parse custom distance format (25:00 for 4 miles, 30:00 for 8k, etc.)
  const customMatch = cleanInput.match(/(\d+):(\d+)(?::(\d+))?\s*for\s*(\d+\.?\d*)\s*(mile|miles|mi|k|km|kilometer|kilometers)/);
  if (customMatch) {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    if (customMatch[3]) {
      // HH:MM:SS format
      hours = parseInt(customMatch[1]);
      minutes = parseInt(customMatch[2]);
      seconds = parseInt(customMatch[3]);
    } else {
      // MM:SS format
      minutes = parseInt(customMatch[1]);
      seconds = parseInt(customMatch[2]);
    }
    
    const totalMinutes = (hours * 60) + minutes + (seconds / 60);
    const distance = parseFloat(customMatch[4]);
    const distanceUnit = customMatch[5];
    
    // Convert distance to miles
    let distanceInMiles = distance;
    if (distanceUnit.includes("k") && !distanceUnit.includes("mi")) {
      distanceInMiles = distance / MILES_TO_KM; // Convert km to miles
    }
    
    if (distanceInMiles > 0) {
      const paceMinPerMile = totalMinutes / distanceInMiles;
      return { value: paceMinPerMile, unit: "min/mi" };
    }
  }
  
  return null;
};
