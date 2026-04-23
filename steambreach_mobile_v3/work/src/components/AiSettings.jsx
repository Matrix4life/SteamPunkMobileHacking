import React, { useState, useEffect } from 'react';

const C = {
  bg: '#0a0a0f', panel: '#0f0f1a', border: '#1a1a2e',
  primary: '#00ff88', text: '#c8c8e8', textDim: '#5a5a7a',
  warning: '#ffaa00', danger: '#ff3366'
};

export default function AiSettings({ returnToGame }) {
  const [config, setConfig] = useState({ provider: 'gemini', apiKey: '', model: '', baseUrl: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hexoverride_ai_config'));
      if (stored) setConfig(stored);
    } catch (e) {}
  }, []);

  const handleSave = () => {
    localStorage.setItem('hexoverride_ai_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    background: '#050508', border: `1px solid ${C.border}`, color: C.text,
    padding: '10px', fontFamily: 'inherit', fontSize: '12px', width: '100%',
    borderRadius: '2px', outline: 'none', marginBottom: '16px'
  };

  const labelStyle = { display: 'block', color: C.primary, fontSize: '10px', letterSpacing: '2px', marginBottom: '6px' };

  return (
    <div style={{ background: C.bg, color: C.text, position: 'absolute', inset: 0, fontFamily: "'Consolas', monospace", padding: '40px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: C.panel, border: `1px solid ${C.border}`, padding: '30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: `1px solid ${C.border}`, paddingBottom: '20px' }}>
          <div>
            <h2 style={{ color: C.primary, margin: '0 0 5px 0', letterSpacing: '4px' }}>DIRECTOR API CONFIG</h2>
            <div style={{ color: C.textDim, fontSize: '11px' }}>UNIVERSAL LLM ADAPTER v1.0</div>
          </div>
          <button onClick={returnToGame} style={{ background: 'transparent', border: `1px solid ${C.dim}`, color: C.textDim, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            ← BACK
          </button>
        </div>

        <label style={labelStyle}>AI PROVIDER</label>
       <select 
          value={config.provider} 
          onChange={e => setConfig({ ...config, provider: e.target.value })} 
          style={inputStyle}
        >
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI (ChatGPT)</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="groq">Groq (Ultra-Fast)</option>
          <option value="ollama">Ollama (Local / Uncensored)</option>
        </select>

        {config.provider !== 'ollama' && (
          <>
            <label style={labelStyle}>API KEY (Encrypted locally in browser)</label>
            <input 
              type="password" 
              value={config.apiKey} 
              onChange={e => setConfig({ ...config, apiKey: e.target.value })} 
              placeholder={`Enter your ${config.provider.toUpperCase()} API key...`}
              style={inputStyle} 
            />
          </>
        )}

        <label style={labelStyle}>MODEL OVERRIDE (Optional)</label>
        <input 
          type="text" 
          value={config.model} 
          onChange={e => setConfig({ ...config, model: e.target.value })} 
          placeholder="e.g. gpt-4o, claude-3-opus-20240229, llama3"
          style={inputStyle} 
        />

        {config.provider === 'ollama' && (
          <>
            <label style={labelStyle}>OLLAMA BASE URL</label>
            <input 
              type="text" 
              value={config.baseUrl} 
              onChange={e => setConfig({ ...config, baseUrl: e.target.value })} 
              placeholder="http://localhost:11434/api/generate"
              style={inputStyle} 
            />
            <div style={{ fontSize: '10px', color: C.warning, marginBottom: '16px' }}>
              ⚠ Make sure your local Ollama instance is running and allows CORS origins.
            </div>
          </>
        )}

        <button 
          onClick={handleSave} 
          style={{ background: saved ? C.primary : 'transparent', color: saved ? '#000' : C.primary, border: `1px solid ${C.primary}`, padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit', width: '100%', fontWeight: 'bold', letterSpacing: '2px', transition: 'all 0.2s' }}
        >
          {saved ? '✓ CONFIGURATION SAVED' : 'SAVE CONFIGURATION'}
        </button>

      </div>
    </div>
  );
}
