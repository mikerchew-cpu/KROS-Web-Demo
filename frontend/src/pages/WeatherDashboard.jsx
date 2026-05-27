import { useState } from "react";

const LOCATIONS = [
  { id: "kros-hill", name: "Kros Hill", lat: "3.815°N", long: "101.891°E", elevation: "425m" },
  { id: "bukit-besi", name: "Bukit Besi", lat: "4.185°N", long: "103.112°E", elevation: "210m" },
  { id: "sg-lembing", name: "Sungai Lembing", lat: "3.621°N", long: "102.845°E", elevation: "180m" },
];

const FORECAST = [
  { day: "Today", temp: 32, tempHi: 34, tempLo: 25, condition: "Partly Cloudy", humidity: 65, wind: 12, gust: 20, rain: 10, icon: "⛅", uv: 7 },
  { day: "Tomorrow", temp: 34, tempHi: 36, tempLo: 26, condition: "Hot & Dry", humidity: 55, wind: 8, gust: 14, rain: 5, icon: "☀️", uv: 9 },
  { day: "+2 Days", temp: 31, tempHi: 33, tempLo: 24, condition: "Thunderstorms", humidity: 78, wind: 18, gust: 30, rain: 70, icon: "⛈", uv: 5 },
  { day: "+3 Days", temp: 29, tempHi: 31, tempLo: 23, condition: "Showers", humidity: 82, wind: 15, gust: 25, rain: 60, icon: "🌧", uv: 4 },
  { day: "+4 Days", temp: 30, tempHi: 32, tempLo: 24, condition: "Partly Cloudy", humidity: 70, wind: 10, gust: 18, rain: 20, icon: "⛅", uv: 6 },
  { day: "+5 Days", temp: 33, tempHi: 35, tempLo: 25, condition: "Sunny", humidity: 58, wind: 7, gust: 12, rain: 5, icon: "☀️", uv: 8 },
];

const LOCATION_FORECASTS = {
  "kros-hill": FORECAST,
  "bukit-besi": FORECAST.map(d => ({ ...d, temp: d.temp + 1, tempHi: d.tempHi + 1, tempLo: d.tempLo + 1, rain: Math.min(d.rain + 10, 100) })),
  "sg-lembing": FORECAST.map(d => ({ ...d, temp: d.temp - 2, tempHi: d.tempHi - 1, tempLo: d.tempLo - 3, rain: Math.max(d.rain - 5, 0) })),
};

const WEATHER_ALERTS = [
  { type: "warning", message: "Thunderstorms forecast +2 days across all sites — blasting may be delayed", time: "06:00" },
  { type: "warning", message: "Bukit Besi: extreme heat index 38°C tomorrow — heat stress protocol active", time: "06:00" },
  { type: "info", message: "Sungai Lembing: cooler temps expected — good window for outdoor maintenance", time: "06:00" },
];

const OPERATIONAL_IMPACTS = [
  { condition: "Heavy Rain (>25mm/day)", blastDelay: "Yes", haulRoad: "Slippery", dustSuppression: "Not needed", risk: "medium" },
  { condition: "High Wind (>30km/h)", blastDelay: "Yes", haulRoad: "Normal", dustSuppression: "Reduced", risk: "medium" },
  { condition: "Extreme Heat (>35°C)", blastDelay: "No", haulRoad: "Normal", dustSuppression: "Max required", risk: "medium" },
  { condition: "Thunderstorms", blastDelay: "Yes", haulRoad: "Hazardous", dustSuppression: "Not needed", risk: "high" },
  { condition: "Dry (>7 days)", blastDelay: "No", haulRoad: "Dusty", dustSuppression: "Max required", risk: "low" },
];

export default function WeatherDashboard() {
  const [selectedLocation, setSelectedLocation] = useState("kros-hill");
  const loc = LOCATIONS.find(l => l.id === selectedLocation) || LOCATIONS[0];
  const forecast = LOCATION_FORECASTS[selectedLocation] || FORECAST;

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <div className="page-title">Weather & Operations</div>
          <div className="page-subtitle">Multi-site forecasting & operational impact</div>
        </div>
      </div>

      <div className="location-bar">
        {LOCATIONS.map(l => (
          <button key={l.id} className={`loc-chip ${selectedLocation === l.id ? "active" : ""}`} onClick={() => setSelectedLocation(l.id)}>
            <span className="loc-name">{l.name}</span>
            <span className="loc-meta">{l.lat}, {l.long}</span>
          </button>
        ))}
        <span className="loc-elevation">{loc.elevation} ASL</span>
      </div>

      <div className="weather-alerts-compact">
        {WEATHER_ALERTS.map((a, i) => (
          <div key={i} className={`alert-compact ${a.type}`}>
            <span>{a.type === "warning" ? "⚠" : "◈"}</span>
            <span>{a.message}</span>
            <span className="alert-time">{a.time}</span>
          </div>
        ))}
      </div>

      <div className="forecast-row">
        {forecast.map((d, i) => (
          <div key={i} className={`fc-card ${i === 0 ? "today" : ""} ${d.condition === "Thunderstorms" ? "storm" : ""}`}>
            <div className="fc-day">{d.day}</div>
            <div className="fc-icon">{d.icon}</div>
            <div className="fc-temp">{d.temp}°</div>
            <div className="fc-hilo">{d.tempHi}° / {d.tempLo}°</div>
            <div className="fc-cond">{d.condition}</div>
            <div className="fc-details">
              <span title="Humidity">💧{d.humidity}%</span>
              <span title="Wind">💨{d.wind}km/h</span>
              <span title="Rain">🌧{d.rain}%</span>
              <span title="UV Index">☀️{d.uv}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-panels">
        <div className="card">
          <div className="card-header"><div className="card-title">Impact Matrix</div></div>
          <div className="table-wrap">
            <table className="compact-table">
              <thead><tr><th>Condition</th><th>Blast</th><th>Road</th><th>Dust</th><th>Risk</th></tr></thead>
              <tbody>
                {OPERATIONAL_IMPACTS.map((o, i) => (
                  <tr key={i}>
                    <td className="cell-bold">{o.condition}</td>
                    <td><span className={`badge badge-${o.blastDelay === "Yes" ? "gold" : "green"}`}>{o.blastDelay}</span></td>
                    <td>{o.haulRoad}</td>
                    <td>{o.dustSuppression}</td>
                    <td><span className={`badge badge-${o.risk}`}>{o.risk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">AI Recommendations — {loc.name}</div></div>
          <div className="card-body">
            <div className="ai-rec-list stack">
              {forecast.slice(0, 3).map((d, i) => (
                <div key={i} className="ai-rec-item compact">
                  <div className="ai-rec-icon">{d.icon}</div>
                  <div className="ai-rec-content">
                    <div className="ai-rec-title">{d.day} ({d.condition}, {d.temp}°C)</div>
                    <div className="ai-rec-desc">
                      {d.condition === "Thunderstorms" ? "Postpone blasting. Inspect high-walls. Activate stormwater diversion. Lightning risk — stop outdoor operations." :
                       d.condition === "Hot & Dry" || d.temp >= 34 ? "Increase water trucks ×2. Heat stress protocol. Schedule heavy work for early morning." :
                       d.condition === "Showers" ? "Good for light maintenance. Haul roads may be slick — reduce speed limits. Monitor drainage." :
                       d.condition === "Sunny" || d.condition === "Partly Cloudy" ? "Normal operations. Standard dust suppression. Monitor temps for heat build-up." :
                       "Standard operating conditions."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
