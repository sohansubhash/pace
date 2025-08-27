"use client";

import Image from "next/image";
import sharedStyles from "./shared.module.css";
import styles from "./stateoverview.module.css";

interface StateOverviewProps {
  minPerMile: string;
  minPerKm: string;
  mph: string;
  kmh: string;
}

export default function StateOverview({
  minPerMile,
  minPerKm,
  mph,
  kmh,
}: StateOverviewProps) {
  return (
    <div className={sharedStyles.headerContainer}>
      <div className={sharedStyles.sectionHeader}>
        <span>Current State</span>
        <Image
          src="/info.svg"
          alt="Info"
          className={sharedStyles.headerIcon}
          width="16"
          height="16"
        />
      </div>
      <div className={styles.stateGrid}>
        <div className={styles.stateItem}>
          <div className={styles.stateLabel}>MIN/MI</div>
          <div className={styles.stateValue}>{minPerMile}</div>
        </div>
        <div className={styles.stateItem}>
          <div className={styles.stateLabel}>MIN/KM</div>
          <div className={styles.stateValue}>{minPerKm}</div>
        </div>
        <div className={styles.stateItem}>
          <div className={styles.stateLabel}>MPH</div>
          <div className={styles.stateValue}>{mph}</div>
        </div>
        <div className={styles.stateItem}>
          <div className={styles.stateLabel}>KM/H</div>
          <div className={styles.stateValue}>{kmh}</div>
        </div>
      </div>
    </div>
  );
}
