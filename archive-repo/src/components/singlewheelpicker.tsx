import { WheelPicker } from "@ncdai/react-wheel-picker";
import { formatPreciseValue } from "../util";
import styles from "./singlewheelpicker.module.css";

interface SingleWheelPickerProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onValueChange: (value: string) => void;
  unit: string;
  exactValue?: number;
  isActiveWheel?: boolean;
}

export default function SingleWheelPicker({
  options,
  value,
  onValueChange,
  unit,
  exactValue,
  isActiveWheel = false,
}: SingleWheelPickerProps) {
  // Determine if we should show precise value instead of wheel value
  const shouldShowPreciseValue = !isActiveWheel && exactValue !== undefined;
  
  // Format the precise value for display
  const preciseDisplayValue = shouldShowPreciseValue 
    ? formatPreciseValue(exactValue!, unit)
    : undefined;
  
  console.log(`🎯 ${unit}: shouldShowPrecise=${shouldShowPreciseValue}, exactValue=${exactValue}, preciseDisplay=${preciseDisplayValue}`);

  return (
    <div 
      className={styles.pickerWrapper} 
      data-unit={unit}
    >
      <WheelPicker
        options={options}
        value={value}
        onValueChange={onValueChange}
        infinite
      />
      {shouldShowPreciseValue && preciseDisplayValue && (
        <div className={styles.preciseOverlay}>
          {preciseDisplayValue}
        </div>
      )}
    </div>
  );
}
