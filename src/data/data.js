import Papa from "papaparse";
import csvText from "./smart_bins.csv?raw";
import routes from "./routes.json";

export const bins = Papa.parse(csvText, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
}).data;

export const routeData = routes;

export const cities = {
  Visakhapatnam: { lat: 17.735, lon: 83.315, zoom: 13 },
  Hyderabad: { lat: 17.4065, lon: 78.4772, zoom: 12 },
  Bengaluru: { lat: 12.9716, lon: 77.5946, zoom: 12 },
  Chennai: { lat: 13.0827, lon: 80.2707, zoom: 12 },
};

const baseCenter = { lat: 17.735, lon: 83.315 };

const cityProfiles = {
  Visakhapatnam: {
    probabilityShift: 0.00,
    wasteShift: 0.00,
    sensorShift: 0.00,
  },
  Hyderabad: {
    probabilityShift: -0.055,
    wasteShift: 0.065,
    sensorShift: 0.018,
  },
  Bengaluru: {
    probabilityShift: 0.045,
    wasteShift: -0.035,
    sensorShift: -0.012,
  },
  Chennai: {
    probabilityShift: -0.025,
    wasteShift: 0.045,
    sensorShift: 0.010,
  },
};

function clamp(value, min = 0.08, max = 0.97) {
  return Math.max(min, Math.min(max, value));
}

/*
 * Prototype note:
 * The source smart-bin dataset does not contain four-city municipal records.
 * These city profiles therefore create a deterministic simulation layer so the
 * same source model can be demonstrated across multiple cities without falsely
 * presenting the values as live municipal data.
 */
function cityBinVariation(city, index) {
  const profile = cityProfiles[city] || cityProfiles.Visakhapatnam;

  // Bin-specific signature: makes B001, B002, B003... behave differently.
  const binWave =
    Math.sin((index + 1) * 1.91 + city.length * 0.73) * 0.105 +
    Math.cos((index + 2) * 0.83 + city.length) * 0.035;

  // Small city-specific operating context.
  const cityWave =
    Math.sin((index + 1) * 0.57 + city.charCodeAt(0)) * 0.018;

  return {
    probabilityShift: profile.probabilityShift + binWave + cityWave,
    wasteMultiplier:
      1 +
      profile.wasteShift +
      Math.cos((index + 1) * 1.27 + city.length) * 0.075 +
      Math.sin((index + 1) * 0.49 + city.charCodeAt(0)) * 0.025,
    sensorShift:
      profile.sensorShift +
      Math.sin((index + 1) * 1.13 + city.length) * 0.025,
  };
}

export function cityBins(city) {
  const c = cities[city];
  return bins.map((b, index) => {
    const variation = cityBinVariation(city, index);
    const probability = clamp(
      b.Emptying_Probability + variation.probabilityShift
    );
    const priority = priorityFor(probability);

    return {
      ...b,
      Latitude: c.lat + (b.Latitude - baseCenter.lat),
      Longitude: c.lon + (b.Longitude - baseCenter.lon),

      // Every city + every bin gets its own simulated operational reading.
      Emptying_Probability: probability,
      Predicted_Class: probability >= 0.50 ? "Emptying" : "Non Emptying",
      Collection_Priority: priority,

      // Keep the source sensor values visible, while adding a small
      // deterministic city/bin operational variation for the prototype.
      VS: Number(Math.max(0, b.VS + variation.sensorShift).toFixed(3)),
      Estimated_Waste_kg: Number(
        Math.max(8, b.Estimated_Waste_kg * variation.wasteMultiplier).toFixed(1)
      ),
    };
  });
}

export const featureImportance = [
  ["VS", 0.420165],
  ["FL_B", 0.177029],
  ["FL_B_3", 0.087812],
  ["FL_B_12", 0.080407],
  ["FL_A", 0.069715],
  ["FL_A_12", 0.058644],
  ["FL_A_3", 0.057085],
  ["Container Type", 0.025],
  ["Recyclable fraction", 0.024143],
];

export const sensorLabels = ["FL_B", "FL_A", "VS", "FL_B_3", "FL_A_3", "FL_B_12", "FL_A_12"];

export function priorityFor(p) {
  if (p >= 0.70) return "High";
  if (p >= 0.50) return "Medium";
  return "Low";
}

export function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function interactiveOptimize(queueIds, city, capacity = 750) {
  const cb = cityBins(city);
  const selected = cb.filter((b) => queueIds.includes(b.Bin_ID));
  const depot = cities[city];
  const remaining = [...selected];
  const trucks = [
    { id: "T01", capacity: 500 },
    { id: "T02", capacity },
    { id: "T03", capacity: 1000 },
  ];
  const output = [];

  for (const truck of trucks) {
    if (!remaining.length) break;
    let current = depot;
    let load = 0;
    const stops = ["DEPOT"];

    while (remaining.length) {
      const candidates = remaining
        .filter((b) => load + b.Estimated_Waste_kg <= truck.capacity)
        .map((b) => ({
          b,
          d: haversine(current, { lat: b.Latitude, lon: b.Longitude }),
        }))
        .sort((a, z) => a.d - z.d);

      if (!candidates.length) break;
      const next = candidates[0].b;
      stops.push(next.Bin_ID);
      load += next.Estimated_Waste_kg;
      current = { lat: next.Latitude, lon: next.Longitude };
      remaining.splice(remaining.findIndex((x) => x.Bin_ID === next.Bin_ID), 1);
    }

    if (stops.length > 1) stops.push("DEPOT");
    output.push({ ...truck, stops, load });
  }

  if (remaining.length) {
    output.push({
      id: "UNASSIGNED",
      capacity: 0,
      stops: remaining.map((b) => b.Bin_ID),
      load: remaining.reduce((s, b) => s + b.Estimated_Waste_kg, 0),
    });
  }
  return output;
}
