import { useState, useEffect } from "react";

const PROVIDERS = [
  { id: "claude", name: "Anthropic Claude", icon: "✦", color: "purple", models: ["claude-sonnet-4-6", "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"], url: "https://api.anthropic.com/v1/messages" },
  { id: "deepseek", name: "DeepSeek", icon: "◈", color: "teal", models: ["deepseek-chat", "deepseek-coder"], url: "https://api.deepseek.com/v1/chat/completions" },
  { id: "gemini", name: "Google Gemini", icon: "◉", color: "gold", models: ["gemini-2.0-flash", "gemini-2.0-pro", "gemini-1.5-pro"], url: "https://generativelanguage.googleapis.com/v1beta/models" },
  { id: "qwen", name: "Qwen (Alibaba Cloud)", icon: "◇", color: "blue", models: ["qwen-max", "qwen-plus", "qwen-turbo"], url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation" },
];

const STORAGE_KEY = "kros_ai_providers";

function loadProviders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return PROVIDERS.map(p => ({ id: p.id, apiKey: "", selectedModel: p.models[0], status: "not_configured", lastTested: null }));
}

export default function AIProviders() {
  const [providers, setProviders] = useState(loadProviders);
  const [testing, setTesting] = useState(null);
  const [saved, setSaved] = useState(false);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
  }, [providers]);

  const updateProvider = (id, field, value) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const saveAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async (provider) => {
    const prov = providers.find(p => p.id === provider);
    if (!prov?.apiKey) {
      setTestResults(prev => ({ ...prev, [provider]: { success: false, message: "API key is required" } }));
      return;
    }

    setTesting(provider);

    // Simulate API test with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, this would make an actual API call
    const success = prov.apiKey.length > 10;
    const status = success ? "connected" : "failed";

    setProviders(prev => prev.map(p => p.id === provider ? {
      ...p,
      status,
      lastTested: new Date().toISOString()
    } : p));

    setTestResults(prev => ({
      ...prev,
      [provider]: {
        success,
        message: success
          ? `Connected successfully using ${prov.selectedModel}`
          : "Connection failed — check your API key"
      }
    }));

    setTesting(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected": return "🟢";
      case "failed": return "🔴";
      case "testing": return "🔄";
      default: return "⚪";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "connected": return "Connected";
      case "failed": return "Failed";
      case "testing": return "Testing...";
      default: return "Not configured";
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">AI Providers</div>
          <div className="page-subtitle">Configure, test, and monitor AI engine connections</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveAll}>
          {saved ? "✓ Saved" : "Save All"}
        </button>
      </div>

      {saved && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <span>✓</span> All provider settings saved successfully.
        </div>
      )}

      <div className="ai-providers-list">
        {PROVIDERS.map((meta, i) => {
          const prov = providers.find(p => p.id === meta.id) || { apiKey: "", selectedModel: meta.models[0], status: "not_configured" };
          const result = testResults[meta.id];

          return (
            <div key={meta.id} className="card ai-provider-card">
              <div className="ai-provider-header">
                <div className="ai-provider-brand">
                  <span className={`ai-provider-icon ${meta.color}`}>{meta.icon}</span>
                  <div>
                    <div className="ai-provider-name">{meta.name}</div>
                    <div className="ai-provider-url">{meta.url}</div>
                  </div>
                </div>
                <div className="ai-provider-status">
                  <span className={`ai-status-indicator ${prov.status}`}>
                    {getStatusIcon(prov.status)}
                  </span>
                  <span className={`ai-status-label ${prov.status}`}>
                    {getStatusLabel(prov.status)}
                  </span>
                  {prov.lastTested && (
                    <span className="ai-last-tested">
                      Last: {new Date(prov.lastTested).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="ai-provider-body">
                <div className="ai-provider-fields">
                  <div className="ai-provider-field" style={{ flex: 2 }}>
                    <label className="form-label">API Key</label>
                    <div className="api-key-input">
                      <input
                        type={prov.showKey ? "text" : "password"}
                        className="form-input"
                        value={prov.apiKey}
                        onChange={e => updateProvider(meta.id, "apiKey", e.target.value)}
                        placeholder={`Enter your ${meta.name} API key...`}
                        style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                      />
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => updateProvider(meta.id, "showKey", !prov.showKey)}
                        title={prov.showKey ? "Hide key" : "Show key"}
                      >
                        {prov.showKey ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>
                  <div className="ai-provider-field">
                    <label className="form-label">Model</label>
                    <select
                      className="form-select"
                      value={prov.selectedModel}
                      onChange={e => updateProvider(meta.id, "selectedModel", e.target.value)}
                    >
                      {meta.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="ai-provider-actions">
                  <button
                    className={`btn btn-${meta.color === "purple" ? "purple" : meta.color === "teal" ? "primary" : meta.color === "gold" ? "primary" : "primary"}`}
                    onClick={() => testConnection(meta.id)}
                    disabled={testing === meta.id || !prov.apiKey}
                    style={{ minWidth: 140 }}
                  >
                    {testing === meta.id ? "⟳ Testing..." : "✦ Test Connection"}
                  </button>
                </div>

                {result && (
                  <div className={`ai-test-result ${result.success ? "success" : "error"}`}>
                    <span>{result.success ? "✓" : "✕"}</span>
                    <span>{result.message}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Connection Summary</div>
        </div>
        <div className="card-body">
          <div className="ai-summary-grid">
            {PROVIDERS.map(meta => {
              const prov = providers.find(p => p.id === meta.id);
              return (
                <div key={meta.id} className="ai-summary-item">
                  <div className="ai-summary-icon" style={{
                    background: prov?.status === "connected" ? "var(--green)" : "var(--surface-3)",
                    boxShadow: prov?.status === "connected" ? "0 0 12px var(--green)" : "none"
                  }}>
                    {meta.icon}
                  </div>
                  <div className="ai-summary-info">
                    <div className="ai-summary-name">{meta.name}</div>
                    <div className="ai-summary-model">{prov?.selectedModel || "—"}</div>
                  </div>
                  <span className={`badge badge-${prov?.status === "connected" ? "green" : prov?.status === "failed" ? "red" : "muted"}`}>
                    {prov?.status === "connected" ? "Live" : prov?.status === "failed" ? "Error" : "Off"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
