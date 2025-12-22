"use client";

import { useState, useEffect } from "react";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { Monitor, Sun, Moon } from "@phosphor-icons/react";
import styles from "./themetoggle.module.css";

type ThemeOption = "system" | "light" | "dark";

export default function ThemeToggle() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>("system");
  const [mounted, setMounted] = useState(false);

  // Apply the actual theme to the document
  const applyTheme = (themeOption: ThemeOption) => {
    let actualTheme: "light" | "dark";

    if (themeOption === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      actualTheme = themeOption;
    }

    document.documentElement.setAttribute("data-theme", actualTheme);
  };

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme-preference") as ThemeOption | null;
    const initialTheme = stored || "system";
    setSelectedTheme(initialTheme);
    applyTheme(initialTheme);

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (localStorage.getItem("theme-preference") === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleThemeChange = (value: ThemeOption[]) => {
    if (value.length === 0) return; // Prevent deselection

    const newTheme = value[0];
    setSelectedTheme(newTheme);
    localStorage.setItem("theme-preference", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return <div className={styles.placeholder} />;
  }

  return (
    <ToggleGroup
      className={styles.toggleGroup}
      value={[selectedTheme]}
      onValueChange={handleThemeChange}
      aria-label="Theme selection"
    >
      <Toggle
        className={styles.toggle}
        value="system"
        aria-label="System theme"
        title="Use system theme"
      >
        <Monitor size={18} weight="regular" color="currentColor" />
      </Toggle>

      <Toggle
        className={styles.toggle}
        value="light"
        aria-label="Light theme"
        title="Light theme"
      >
        <Sun size={18} weight="regular" color="currentColor" />
      </Toggle>

      <Toggle
        className={styles.toggle}
        value="dark"
        aria-label="Dark theme"
        title="Dark theme"
      >
        <Moon size={18} weight="regular" color="currentColor" />
      </Toggle>
    </ToggleGroup>
  );
}
