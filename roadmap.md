# Roadmap

## Current Product Direction

Pace is a polished running pace converter with editable mile and kilometer pace, live race finish-time calculations, theme modes, and an iOS 6-inspired skeuomorphic interface. Future work should deepen the race-calculation workflow without turning the app into a noisy training dashboard.

## Feature Priority Summary

| Feature | Decision | Priority |
| --- | --- | --- |
| Race detail inspector | Build | High |
| Race prediction times | Build | High |
| World records data | Build later | Medium |
| Age/sex performance score | Defer | Low |

## 1. Race Detail Inspector

### Decision

Build.

### Why

The finish-time grid already shows useful race data, but it is flat. A race detail inspector would make each race feel interactive and create a natural place for future features like predictions and records.

### UI Plan

- Add a small iOS-style circular `i` inspector button on each race row.
- Tapping a row or the `i` opens a race detail view.
- On desktop and tablet, show the detail view as a right-side panel within the finish-times block.
- On narrow mobile, use a pushed detail page with a Back button.
- Show race name, distance, current finish time, current pace, and placeholder sections for predictions and records.

### Business Logic Plan

- Add selected race state: `{ name, meters, category } | null`.
- Keep `secondsPerMeter` as the single source of truth.
- Derive finish time as `secondsPerMeter * race.meters`.
- Editing the selected race finish time updates `secondsPerMeter`, matching the current row-editing behavior.

### Implementation Notes

- Extract race data and time helpers from `App.tsx` into small modules when this feature starts.
- Keep the inspector purely client-side.
- Do not add routing for the first version.

### Open Questions

- Should row tap and the `i` button both open the inspector, or should row tap remain focused on editing?
- On desktop, should the inspector replace one race category column or sit below the grid as a detail panel?

## 2. Race Prediction Times

### Decision

Build.

### Why

Race prediction is the strongest feature after the current converter because it turns one known race result into useful projections for other distances.

### UI Plan

- Place predictions inside the race detail inspector.
- Add a section titled `Predictions`.
- Show predicted finish times for the other Road distances first.
- Add a segmented formula selector with `Riegel` and `Cameron`.
- Default to `Riegel`.

### Business Logic Plan

- Use the selected race time as the baseline.
- Riegel formula: `T2 = T1 * (D2 / D1)^1.06`.
- Add Dave Cameron only after confirming the exact formula and source.
- Predictions should not overwrite the global pace unless the user explicitly selects a predicted time.

### Implementation Notes

- Add a pure helper like `predictRaceTime({ sourceSeconds, sourceMeters, targetMeters, formula })`.
- Unit test known examples and monotonic behavior.
- Only show predictions for distances where the formula makes sense.
- Avoid sprint distances for Riegel by default.

### Open Questions

- Should prediction targets include only Road races, or should Track and Ultra be selectable later?
- Should selecting a prediction update the global pace immediately or ask for confirmation?

## 3. World Records Data

### Decision

Build later.

### Why

World records would make race detail pages more interesting, but they introduce source freshness, attribution, and maintenance concerns. This should come after the race detail inspector exists.

### UI Plan

- Add a `World Records` section inside the race detail inspector.
- Show men's and women's records for the selected race.
- Include record time, athlete, country, date, and source link.
- If a race has no clean record equivalent, omit the row instead of forcing data.

### Business Logic Plan

- Use static curated JSON data checked into the repo for v1.
- Include source URL and last verified date for each record.
- Do not scrape records at runtime.
- Do not depend on Wikipedia dynamically in the app.

### Implementation Notes

- Add a data file keyed by canonical race ID.
- Keep records optional per race.
- Update records manually as a maintenance task.
- Verify sources before implementation.

### Open Questions

- Which race distances should be record-backed in the first records pass?
- Should records include track-only distinctions when a road race has a similarly named distance?

## 4. Age/Sex Performance Score

### Decision

Defer.

### Why

This could be useful, but it changes the app from a pace utility into a performance-ranking tool. It also requires careful data sourcing and clear methodology.

### UI Plan

- Do not add this to the main UI for now.
- If built later, place it inside race detail as an optional `Performance` section.
- Ask for age and sex only inside that section, not globally.
- Avoid the label "elite runner score".
- Prefer a neutral label like `Performance Percentile` or `Age-Graded Score`.

### Business Logic Plan

- Require age, sex, race distance, and finish time.
- Use a recognized age-grading dataset, not ad hoc public records.
- Show methodology and source clearly.

### Implementation Notes

- Treat this as a separate feature after records and predictions.
- Research and validate the data source before implementation.
- Do not implement this from the current roadmap note alone.

### Open Questions

- Which age-grading dataset should be used?
- Should the app store user demographic inputs locally, or keep them transient per session?

## Test Plan For Future Implementation

- Editing pace updates all finish times.
- Editing any race finish time updates pace and all other races.
- Opening the race inspector does not desync editable rows.
- Prediction formulas produce stable deterministic values.
- Theme modes still work in list and detail views.
- Mobile detail view supports back navigation and preserves current pace state.
- World record rows render only where data exists.

## Assumptions

- The next real feature should be Race Detail Inspector because it creates the UI container for predictions and records.
- Road race prediction is the primary use case.
- Track and Ultra can remain in the finish-time grid but should not drive prediction defaults yet.
- Wikipedia can be used as a research/source reference, but the app should ship static curated record data rather than fetching from Wikipedia at runtime.
- This roadmap should be planning-oriented, not a changelog or issue tracker.
