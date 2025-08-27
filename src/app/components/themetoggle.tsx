"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import styles from "./themetoggle.module.css";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.placeholder} />;
  }

  const toggleTheme = () => {
    if (theme === "system") {
      // If currently system, switch to the opposite of resolved theme
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      // If currently light or dark, switch to the opposite
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label="Toggle theme"
      title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
    >
      <Image
        src={resolvedTheme === "light" ? "/moon.svg" : "/sun.svg"}
        alt={
          resolvedTheme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode"
        }
        width="18"
        height="18"
        className={styles.icon}
      />
    </button>
  );
}
