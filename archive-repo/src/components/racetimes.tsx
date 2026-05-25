import { FlagCheckered } from "@phosphor-icons/react";
import {
  RACE_DISTANCES,
  calculateRaceTime,
  getRaceTooltip,
} from "../util";
import sharedStyles from "./shared.module.css";
import styles from "./racetimes.module.css";

interface RaceFinishTimesProps {
  minPerMile: string;
  onPreciseUpdate: (preciseMinPerMile: number) => void;
}

export default function RaceFinishTimes({
  minPerMile,
}: RaceFinishTimesProps) {

  return (
    <div className={sharedStyles.headerContainer}>
      <div className={sharedStyles.sectionHeader}>
        <span>Race Finish Times</span>
        <FlagCheckered
          size={16}
          weight="regular"
          color="currentColor"
          className={sharedStyles.headerIcon}
        />
      </div>
      <div className={styles.raceGrid}>
        {Object.entries(RACE_DISTANCES).map(([raceType, miles]) => {
          const raceTime = calculateRaceTime(parseFloat(minPerMile), miles);

          return (
            <div
              key={raceType}
              title={getRaceTooltip(raceType, miles)}
              className={styles.raceItem}
            >
              <div className={styles.raceLabel}>{raceType}</div>
              <div className={styles.raceTime}>{raceTime}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
