"use client";

import styles from "./wheelpickercontainer.module.css";
import SingleWheelPicker from "./singlewheelpicker";

interface WheelPickerContainerProps {
  pickers: Array<{
    options: Array<{ label: string; value: string }>;
    value: string;
    onValueChange: (value: string) => void;
    unit: string;
  }>;
}

export default function WheelPickerContainer({
  pickers,
}: WheelPickerContainerProps) {
  return (
    <>
      <div className={styles.container}>
        {pickers.map((picker, index) => (
          <SingleWheelPicker
            key={index}
            options={picker.options}
            value={picker.value}
            onValueChange={picker.onValueChange}
            unit={picker.unit}
          />
        ))}
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
