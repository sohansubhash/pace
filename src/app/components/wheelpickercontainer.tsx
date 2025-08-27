"use client";

import { WheelPickerWrapper } from "@ncdai/react-wheel-picker";
import styles from "./wheelpickercontainer.module.css";
import SingleWheelPicker from "./singlewheelpicker";

interface WheelPickerContainerProps {
  pickers: Array<{
    options: Array<{ label: string; value: string }>;
    value: string;
    onValueChange: (value: string) => void;
    unit: string;
    exactValue?: number;
    isActiveWheel?: boolean;
  }>;
}

export default function WheelPickerContainer({
  pickers,
}: WheelPickerContainerProps) {
  return (
    <>
      <div className={styles.container}>
        <WheelPickerWrapper>
          {pickers.map((picker, index) => (
            <SingleWheelPicker
              key={index}
              options={picker.options}
              value={picker.value}
              onValueChange={picker.onValueChange}
              unit={picker.unit}
              exactValue={picker.exactValue}
              isActiveWheel={picker.isActiveWheel}
            />
          ))}
        </WheelPickerWrapper>
      </div>
      <div className={styles.mobileLabels}>
        <div className={styles.mobileLabelsGrid}>
          {pickers.map((picker, index) => (
            <span key={index}>{picker.unit}</span>
          ))}
        </div>
      </div>
    </>
  );
}
