import ThemeToggle from "./themetoggle";
import styles from "./appheader.module.css";

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <ThemeToggle />
    </header>
  );
}
