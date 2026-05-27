import { useState, useEffect, useRef } from "react";

const PAGES = {
  dashboard: "Dashboard", "prod-board": "Production Board", "prod-analysis": "Mine Production Analysis",
  workflow: "Workflow Manager", handover: "Shift Handover", "mine-analysis": "Mine Analysis",
  weightbridge: "Fleet & Weightbridge", "grade-control": "Grade Control", stockpile: "Stockpile Manager",
  blasting: "Blast Dashboard", safety: "Safety & Fatigue", environmental: "Environmental Monitor",
  "predictive-mt": "Predictive Maintenance", "exec-report": "Executive Report",
  training: "Training Matrix", weather: "Weather Dashboard", skills: "Skills Library",
  ask: "Ask AI", succession: "Succession", exit: "Exit Capture", compliance: "Compliance",
  admin: "Admin", manual: "User Manual", settings: "Settings",
};

export default function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const matches = Object.entries(PAGES).filter(([id, label]) =>
      label.toLowerCase().includes(q) || id.includes(q)
    ).slice(0, 8);
    setResults(matches);
  }, [query]);

  const select = (id) => {
    setQuery("");
    setResults([]);
    setFocused(false);
    if (onNavigate) onNavigate(id);
    inputRef.current?.blur();
  };

  return (
    <div className="global-search">
      <div className="global-search-input-row">
        <span className="global-search-icon">🔍</span>
        <input ref={inputRef} className="global-search-input" type="text" placeholder="Search modules, skills, reports..." value={query}
          onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} />
        {query && <button className="global-search-clear" onClick={() => { setQuery(""); setResults([]); }}>✕</button>}
      </div>
      {focused && results.length > 0 && (
        <div className="global-search-dropdown">
          {results.map(([id, label]) => (
            <div key={id} className="global-search-result" onClick={() => select(id)} onMouseDown={e => e.preventDefault()}>
              <span className="global-search-result-label">{label}</span>
              <span className="global-search-result-id cell-mono">{id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
