# Roadmap

## Current Product Direction

Pace is a polished running pace converter with editable mile and kilometer pace, live race finish-time calculations, theme modes, and an iOS 6-inspired skeuomorphic interface. Future work should deepen the race-calculation workflow without turning the app into a noisy training dashboard.

## Feature Priority Summary

| Feature | Decision | Priority |
| --- | --- | --- |
| Race detail tabs | Build | High |
| Race prediction times | Build | High |
| World records data | Build later | Medium |
| Age/sex performance score | Defer | Low |

## 1. Race Detail Tabs

### Decision

Build.

### Why

The finish-time grid already shows useful race data, but it is flat. Race Detail should be the persistent workspace for one selected race: basic facts stay visible, and deeper tools live behind segmented tabs.

### UI Plan

- Add a small iOS-style circular `i` inspector button on each race row.
- Tapping the `i` opens Race Detail as its own app block beneath the pace converter.
- Keep the race header and close button at the top of the block.
- Keep basic facts above the tab bar: `Distance` and `Finish Time`.
- Add an iOS-style segmented tab control with `Predictions`, `Performance`, and `Records`.
- Default the selected tab to `Predictions`.
- `Predictions` is functional now.
- `Performance` and `Records` are visible placeholders for now.

### Business Logic Plan

- Keep selected race state: `{ name, meters, category } | null`.
- Keep `secondsPerMeter` as the single source of truth.
- Derive the always-visible `Finish Time` fact as `secondsPerMeter * race.meters`.
- Keep Race Detail facts live when pace changes.
- Store tab state locally to the Race Detail flow.
- Store prediction snapshots separately from the live facts so predictions do not change after they are generated.

### Implementation Notes

- Remove the standalone Race Predictions card.
- Move the existing prediction grid into the Race Detail `Predictions` tab.
- Reuse the same tab visual pattern as existing segmented controls.
- Keep the inspector purely client-side.
- Do not add routing for the first version.

### Open Questions

- Should `Performance` and `Records` remain disabled until data exists, or render placeholder tab panels?

## 2. Race Prediction Times

### Decision

Build.

### Why

Race prediction is the strongest feature after the current converter because it turns one known race result into useful projections for other distances.

### UI Plan

- Place predictions in the Race Detail `Predictions` tab.
- Show a full prediction grid grouped by `Track`, `Road`, and `Ultra`.
- Highlight the source race row with a high-contrast iOS-style selected state.
- Include a short note: `Predicted with Riegel's formula.`
- Do not show a formula picker in the first tabbed version.

### Business Logic Plan

- Use the selected race time and distance as the baseline.
- Riegel formula: `T2 = T1 * (D2 / D1)^1.06`.
- Add Dave Cameron only after confirming the exact formula and source.
- Predictions should not overwrite the global pace unless the user explicitly selects a predicted time.
- Freeze predictions from a snapshot: `{ race, sourceSeconds }`.
- Refresh the prediction snapshot when a new race is selected.
- Do not live-update predictions when pace changes after the snapshot is created.

### Implementation Notes

- Add a pure helper like `predictRaceTime({ sourceSeconds, sourceMeters, targetMeters, formula })`.
- Unit test known examples and monotonic behavior.
- Keep Riegel as the only active formula for now.
- Keep the current full-grid prediction behavior for now, including custom race baselines.

### Open Questions

- Should selecting a prediction update the global pace immediately or ask for confirmation?
- Should sprint predictions remain in the full grid long-term, or be filtered once formula guidance is clearer?

## 3. World Records Data

### Decision

Build later.

### Why

World records would make race detail pages more interesting, but they introduce source freshness, attribution, and maintenance concerns. This should come after the race detail inspector exists.

### UI Plan

- Add a `Records` tab inside Race Detail.
- For now, render a placeholder row: `World records require curated source data.`
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
- Add a `Performance` tab inside Race Detail as a placeholder for now.
- For now, render a placeholder row: `Performance scoring requires age grading data.`
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
- Race Detail tabs switch without closing Race Detail.
- Race Detail facts update live when pace changes.
- Prediction tab values remain frozen after the snapshot is created.
- Selecting a different race refreshes the prediction snapshot.
- Custom Race predictions preserve the custom distance and finish time at selection time.
- Prediction formulas produce stable deterministic values.
- Theme modes still work in list and detail views.
- Mobile detail view supports back navigation and preserves current pace state.
- World record rows render only where data exists.

## Assumptions

- Race Detail is the UI container for predictions, records, and performance scoring.
- `Predictions`, `Performance`, and `Records` should be visible as tabs, but only `Predictions` is functional now.
- Predictions use snapshot behavior because they represent a generated race result set, not the live pace state.
- Wikipedia can be used as a research/source reference, but the app should ship static curated record data rather than fetching from Wikipedia at runtime.
- This roadmap should be planning-oriented, not a changelog or issue tracker.
