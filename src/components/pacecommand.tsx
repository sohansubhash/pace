import { Command } from "cmdk";
import { useState, useEffect, useRef } from "react";
import {
  RACE_DISTANCES,
  parseTimeInput,
  convertPace,
  calculatePaceFromRaceTime,
} from "../util";
import sharedStyles from "./shared.module.css";
import styles from "./pacecommand.module.css";

interface PaceCommandProps {
  onCommandUpdate: (preciseMinPerMile: number) => void;
}

type CommandState =
  | { type: "ready" }
  | { type: "awaiting_value"; command: string; unit: string };

const COMMANDS = [
  {
    id: "min-mile",
    label: "Min/Mile",
    searchTerms: ["min", "mile", "pace", "minute", "mi"],
    unit: "min/mi",
    placeholder: "Enter min/mi (e.g., 7:30 or 730)",
  },
  {
    id: "min-km",
    label: "Min/KM",
    searchTerms: ["min", "km", "kilometer", "pace", "minute"],
    unit: "min/km",
    placeholder: "Enter min/km (e.g., 4:30 or 430)",
  },
  {
    id: "mph",
    label: "MPH",
    searchTerms: ["mph", "speed", "miles", "hour"],
    unit: "mph",
    placeholder: "Enter MPH (e.g., 8.5)",
  },
  {
    id: "kmh",
    label: "KM/H",
    searchTerms: ["kmh", "kph", "speed", "kilometer", "hour"],
    unit: "km/h",
    placeholder: "Enter KM/H (e.g., 12.5)",
  },
  {
    id: "5k",
    label: "5K",
    searchTerms: ["5k", "5", "race", "time", "five"],
    unit: "5K time",
    placeholder: "Enter 5K time (e.g., 20:15 or 1:25:30)",
  },
  {
    id: "10k",
    label: "10K",
    searchTerms: ["10k", "10", "race", "time", "ten"],
    unit: "10K time",
    placeholder: "Enter 10K time (e.g., 42:30)",
  },
  {
    id: "half-marathon",
    label: "Half Marathon",
    searchTerms: ["half", "marathon", "race", "time", "21k", "13.1"],
    unit: "Half Marathon time",
    placeholder: "Enter Half Marathon time (e.g., 1:30:00)",
  },
  {
    id: "marathon",
    label: "Marathon",
    searchTerms: ["marathon", "race", "time", "42k", "26.2"],
    unit: "Marathon time",
    placeholder: "Enter Marathon time (e.g., 3:15:45)",
  },
];

export default function PaceCommand({ onCommandUpdate }: PaceCommandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commandState, setCommandState] = useState<CommandState>({
    type: "ready",
  });
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut: ⌘+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setCommandState({ type: "ready" });
          setInputValue("");
          // Focus input after state update
          setTimeout(() => inputRef.current?.focus(), 0);
        } else {
          // If already open and in ready state, close; if awaiting value, go back to ready
          if (commandState.type === "awaiting_value") {
            setCommandState({ type: "ready" });
            setInputValue("");
          } else {
            setIsOpen(false);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, commandState.type]);

  const handleCommand = (commandId: string) => {
    const command = COMMANDS.find((cmd) => cmd.id === commandId);
    if (command) {
      setCommandState({
        type: "awaiting_value",
        command: commandId,
        unit: command.unit,
      });
      setInputValue("");
      // Focus input for value entry
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleValueSubmit = (value: string) => {
    if (commandState.type !== "awaiting_value") return;

    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    let preciseMinPerMile = 0;

    if (commandState.command === "min-mile") {
      const paceValue = parseTimeInput(trimmedValue);
      if (paceValue > 0) preciseMinPerMile = paceValue;
    } else if (commandState.command === "min-km") {
      const paceValue = parseTimeInput(trimmedValue);
      if (paceValue > 0)
        preciseMinPerMile = convertPace(paceValue, "min/km", "min/mi");
    } else if (commandState.command === "mph") {
      const speedValue = parseFloat(trimmedValue);
      if (speedValue > 0)
        preciseMinPerMile = convertPace(speedValue, "mph", "min/mi");
    } else if (commandState.command === "kmh") {
      const speedValue = parseFloat(trimmedValue);
      if (speedValue > 0)
        preciseMinPerMile = convertPace(speedValue, "kmh", "min/mi");
    } else if (
      ["5k", "10k", "half-marathon", "marathon"].includes(commandState.command)
    ) {
      const raceTimeMinutes = parseTimeInput(trimmedValue);
      if (raceTimeMinutes > 0) {
        let raceMiles = 0;
        if (commandState.command === "5k") raceMiles = RACE_DISTANCES["5K"];
        else if (commandState.command === "10k")
          raceMiles = RACE_DISTANCES["10K"];
        else if (commandState.command === "half-marathon")
          raceMiles = RACE_DISTANCES["HALF MARATHON"];
        else if (commandState.command === "marathon")
          raceMiles = RACE_DISTANCES.MARATHON;

        if (raceMiles > 0) {
          preciseMinPerMile = calculatePaceFromRaceTime(
            raceTimeMinutes,
            raceMiles,
          );
        }
      }
    }

    if (preciseMinPerMile > 0) {
      onCommandUpdate(preciseMinPerMile);
    }

    setCommandState({ type: "ready" });
    setInputValue("");
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      if (commandState.type === "awaiting_value") {
        handleValueSubmit(inputValue);
      }
    } else if (e.key === "Escape") {
      if (commandState.type === "awaiting_value") {
        setCommandState({ type: "ready" });
        setInputValue("");
      } else {
        setIsOpen(false);
      }
    }
  };

  const getPlaceholderText = () => {
    if (commandState.type === "awaiting_value") {
      const command = COMMANDS.find((cmd) => cmd.id === commandState.command);
      return command?.placeholder || "Enter value...";
    }
    return "Enter a pace, speed, or race time (⌘K)";
  };

  const getFilteredCommands = () => {
    if (!inputValue || commandState.type === "awaiting_value") return COMMANDS;

    const searchTerm = inputValue.toLowerCase();
    return COMMANDS.filter(
      (command) =>
        command.label.toLowerCase().includes(searchTerm) ||
        command.searchTerms.some((term) =>
          term.toLowerCase().includes(searchTerm),
        ),
    );
  };

  const filtered = getFilteredCommands();
  const paceCommands = filtered.slice(0, 2);
  const speedCommands = filtered.slice(2, 4);
  const raceCommands = filtered.slice(4);

  return (
    <div className={sharedStyles.headerContainer}>
      <div className={sharedStyles.sectionHeader}>
        <span>Quick Entry</span>
        <img
          src="/mag.svg"
          alt="Search"
          className={sharedStyles.headerIcon}
          width={16}
          height={16}
        />
      </div>

      <div className={styles.commandContainer}>
        <Command>
          <Command.Input
            ref={inputRef}
            placeholder={getPlaceholderText()}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleInputKeyDown}
            className={styles.commandInput}
            onFocus={() => setIsOpen(true)}
          />

          {isOpen && commandState.type === "ready" && (
            <Command.List className={styles.commandList}>
              {paceCommands.length > 0 && (
                <Command.Group heading="Pace">
                  {paceCommands.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.id}
                      onSelect={() => handleCommand(command.id)}
                    >
                      {command.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {speedCommands.length > 0 && (
                <Command.Group heading="Speed">
                  {speedCommands.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.id}
                      onSelect={() => handleCommand(command.id)}
                    >
                      {command.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {raceCommands.length > 0 && (
                <Command.Group heading="Race Times">
                  {raceCommands.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.id}
                      onSelect={() => handleCommand(command.id)}
                    >
                      {command.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {filtered.length === 0 && (
                <Command.Empty>No commands found.</Command.Empty>
              )}
            </Command.List>
          )}
        </Command>
      </div>
    </div>
  );
}
