# EcoRoute AI

EcoRoute AI is an AI-powered sustainable waste collection intelligence prototype.
It demonstrates how smart-bin sensor signals can become collection priorities,
explainable decisions, dispatch queues, fleet routes, and simulated environmental
impact estimates.

## 🌐 Live Prototype

[🚀 Open EcoRoute AI](https://eco-route-noie9t4d5-eco-route-ai.vercel.app/)

## 🎥 Demo Video

[▶️ Watch the Complete EcoRoute AI Demo](https://drive.google.com/file/d/1FGuPkgRcanajWVcUHYBTch1jqNqNo1JR/view?usp=sharing)


## Run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in Terminal.

## Build check

```bash
npm run build
```

## Important prototype note

The 20-bin operational dataset in `src/data/smart_bins.csv` is a presentation/demo
subset derived from the project concept. The original ML training dataset contained
4,638 records. The Random Forest model summary is provided in `ml/model_summary.json`.

GPS locations, waste quantities, truck capacities, fuel efficiency, traffic factors,
route distances and emissions are simulated prototype assumptions. They are not
live municipal data and the displayed environmental reductions are scenario estimates,
not guaranteed real-world reductions.

The four city choices re-project the same prototype bin pattern around each city
center to demonstrate the product workflow. This is not a claim that the displayed
bins are real municipal assets.

IBM BOB is represented in the ideation/execution workflow section as part of the
project methodology.


## Added interactive layer

- Light / dark mode toggle with remembered preference.
- Map focus filters: all, high, medium and collection set.
- Operator activity feed.
- One-click "queue highest risk".
- Toast feedback for operator actions.
- Existing dispatch queue, route playback, What-If controls, dataset explorer and explainable AI remain intact.


### V5 city + bin dynamics
- Every bin now has a distinct probability, waste estimate, sensor reading, class, and priority for the selected city.
- Switching cities recalculates the operational values deterministically; it does not simply move the same values to another map.
- High / Medium / Low thresholds are now 78%+, 55–77.9%, and below 55% to make the three operational states visibly useful.
- City differences are a transparent prototype simulation layer because the supplied smart-bin dataset is not a four-city municipal dataset.


### V7 multi-bin explorer
- Added a persistent visible selector for all 20 bins.
- Clicking any bin changes the selected-bin report and scrolls to the detailed report.
- Added selected-bin KPIs for probability, priority, and estimated waste.
- The same bin selector respects the selected city, so each city/bin combination has its own simulated operational values.


### V8 WHAT-IF
The final prototype includes an interactive What-If Lab for collection threshold, traffic overhead, truck capacity, waste, route distance, fuel, CO2, and trip estimates. Values are clearly presented as prototype scenario estimates.
