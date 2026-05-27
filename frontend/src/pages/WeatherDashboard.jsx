import { useState } from "react";

const FORECAST = [
  { day: "Today", temp: 32, condition: "Partly Cloudy", humidity: 65, wind: 12, rain: 10, icon: "⛅" },
  { day: "Tomorrow", temp: 34, condition: "Hot & Dry", humidity: 55, wind: 8, rain: 5, icon: "☀️" },
  { day: "+2 Days", temp: 31, condition: "Thunderstorms", humidity: 78, wind: 18, rain: 70, icon: "⛈" },
  { day: "+3 Days", temp: 29, condition: "Showers", humidity: 82, wind: 15, rain: 60, icon: "🌧" },
  { day: "+4 Days", temp: 30, condition: "Partly Cloudy", humidity: 70, wind: 10, rain: 20, icon: "⛅" },
  { day: "+5 Days", temp: 33, condition: "Sunny", humidity: 58, wind: 7, rain: 5, icon: "☀️" },
];

const WEATHER_ALERTS = [
  { type: "warning", message: "Thunderstorms forecast +2 days — blasting may be delayed. Prepare alternate schedule.", time: "06:00 daily" },
  { type: "info", message: "High temperature (34°C) tomorrow — increase water truck shifts for dust suppression.", time: "06:00 daily" },
  { type: "info", message: "Wind speeds up to 18km/h during storms — check high-wall stability before operations resume.", time: "06:00 daily" },
];

const OPERATIONAL_IMPACTS = [
  { condition: "Heavy Rain (>25mm/day)", blastDelay: "Yes", haulRoad: "Slippery", dustSuppression: "Not needed", risk: "medium" },
  { condition: "High Wind (>30km/h)", blastDelay: "Yes", haulRoad: "Normal", dustSuppression: "Reduced effectiveness", risk: "medium" },
  { condition: "Extreme Heat (>35°C)", blastDelay: "No", haulRoad: "Normal", dustSuppression: "Increased required", risk: "low" },
  { condition: "Thunderstorms", blastDelay: "Yes", haulRoad: "Hazardous", dustSuppression: "Not needed", risk: "high" },
  { condition: "Dry (>7 days no rain)", blastDelay: "No", haulRoad: "Dusty", dustSuppression: "Maximum required", risk: "medium" },
];

export default function WeatherDashboard() {
  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Weather & Operations</div><div className="page-subtitle">6-day forecast, operational impact assessment, and AI-driven scheduling recommendations</div></div>
      </div>

      <div className="weather-alerts">
        {WEATHER_ALERTS.map((a, i) => (
          <div key={i} className={`weather-alert ${a.type}`}>
            <span>{a.type === "warning" ? "⚠" : "◈"}</span>
            <span>{a.message}</span>
            <span className="weather-alert-time">{a.time}</span>
          </div>
        ))}
      </div>

      <div className="weather-forecast">
        {FORECAST.map((d, i) => (
          <div key={i} className="weather-day">
            <div className="weather-day-name">{d.day}</div>
            <div className="weather-day-icon">{d.icon}</div>
            <div className="weather-day-temp">{d.temp}°</div>
            <div className="weather-day-condition">{d.condition}</div>
            <div className="weather-day-details">
              <span>💧 {d.humidity}%</span>
              <span>💨 {d.wind}km/h</span>
              <span>🌧 {d.rain}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-panels" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Weather Impact Matrix</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Condition</th><th>Blast Delay?</th><th>Haul Road</th><th>Dust Suppression</th><th>Risk</th></tr></thead>
              <tbody>
                {OPERATIONAL_IMPACTS.map((o, i) => (
                  <tr key={i}>
                    <td className="cell-bold">{o.condition}</td>
                    <td><span className={`badge badge-${o.blastDelay === "Yes" ? "gold" : "green"}`}>{o.blastDelay}</span></td>
                    <td>{o.haulRoad}</td>
                    <td>{o.dustSuppression}</td>
                    <td><span className={`badge badge-${o.risk === "high" ? "red" : o.risk === "medium" ? "gold" : "green"}`}>{o.risk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">AI Operational Recommendations</div></div>
          <div className="card-body">
            <div className="ai-rec-list">
              <div className="ai-rec-item">
                <div className="ai-rec-icon">⛅</div>
                <div className="ai-rec-content">
                  <div className="ai-rec-title">Today (Partly Cloudy, 32°C)</div>
                  <div className="ai-rec-desc">Normal operations. Dust suppression recommended on haul roads. Monitor crusher bearing temps — ambient 32°C may increase baseline by 3-5°C.</div>
                </div>
              </div>
              <div className="ai-rec-item">
                <div className="ai-rec-icon">☀️</div>
                <div className="ai-rec-content">
                  <div className="ai-rec-title">Tomorrow (Hot & Dry, 34°C)</div>
                  <div className="ai-rec-desc">Increase water truck frequency by 2 additional passes on main haul roads. Schedule high-exertion tasks for early morning. Ensure adequate drinking water stations. Monitor operators for heat stress.</div>
                </div>
              </div>
              <div className="ai-rec-item">
                <div className="ai-rec-icon">⛈</div>
                <div className="ai-rec-content">
                  <div className="ai-rec-title">+2 Days (Thunderstorms, 70% rain)</div>
                  <div className="ai-rec-desc">HIGH IMPACT: Postpone all blasting operations. Inspect high-walls before afternoon shift. Activate stormwater diversion. Prepare for potential conveyor trip on lightning detection. Review emergency response protocols.</div>
                </div>
              </div>
              <div className="ai-rec-item">
                <div className="ai-rec-icon">⬡</div>
                <div className="ai-rec-content">
                  <div className="ai-rec-title">Schedule Optimisation</div>
                  <div className="ai-rec-desc">Recommend: Move blasting from +2 days (thunderstorms) to today or tomorrow morning. Schedule crusher maintenance for +2 days afternoon if production stopped. Use +3 days (showers) for light maintenance tasks.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
