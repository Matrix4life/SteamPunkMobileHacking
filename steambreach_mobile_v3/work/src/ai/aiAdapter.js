// src/ai/aiAdapter.js

export const DEFAULT_AI_CONFIG = {
  provider: 'gemini',
  apiKey: '',
  model: '',
  baseUrl: 'http://localhost:11434/api/generate'
};

export const loadAiConfig = () => {
  try {
    return JSON.parse(localStorage.getItem('steambreach_ai_config')) || DEFAULT_AI_CONFIG;
  } catch { return DEFAULT_AI_CONFIG; }
};

export async function generateDirectorText(prompt, systemInstruction = '', config = loadAiConfig()) {
  const { provider, apiKey, model, baseUrl } = config;

  try {
    if (provider === 'gemini') {
      return await fetchGemini(prompt, systemInstruction, apiKey, model);
    } else if (provider === 'openai') {
      return await fetchOpenAI(prompt, systemInstruction, apiKey, model);
    } else if (provider === 'anthropic') {
      return await fetchAnthropic(prompt, systemInstruction, apiKey, model);
    } else if (provider === 'groq') {
      return await fetchGroq(prompt, systemInstruction, apiKey, model);
    } else if (provider === 'ollama') {
      return await fetchOllama(prompt, systemInstruction, model, baseUrl);
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error(`[AI ADAPTER] ${provider} Error:`, error);
    return "ERROR: EXTERNAL DIRECTOR OFFLINE.";
  }
}

// --- PROVIDER FETCH IMPLEMENTATIONS ---

async function fetchGemini(prompt, system, key, model) {
  if (!key || key.trim() === '') return "ERROR: NO API KEY PROVIDED. CHECK AI SETTINGS.";
  const targetModel = (model && model.trim() !== '') ? model : 'gemini-1.5-flash';
  
  const payload = { contents: [{ parts: [{ text: prompt || " " }] }] };
  if (system && system.trim() !== '') {
    payload.systemInstruction = { parts: [{ text: system }] };
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  
  if (!res.ok) return `ERROR: GEMINI OFFLINE (HTTP ${res.status})`;
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "NO RESPONSE";
}

async function fetchGroq(prompt, system, key, model) {
  if (!key || key.trim() === '') return "ERROR: NO GROQ API KEY PROVIDED.";
  
  // Groq crashes if the system message is empty, so we only add it if it exists
  const messages = [];
  if (system && system.trim() !== '') {
    messages.push({ role: 'system', content: system });
  }
  messages.push({ role: 'user', content: prompt || " " });
  
  // Use the newest 3.1 model if the user left the model override box blank
  const targetModel = (model && model.trim() !== '') ? model : 'llama-3.1-8b-instant';

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: targetModel, messages: messages })
  });
  
  if (!res.ok) {
    // This logs the EXACT reason Groq rejected the request to your console (F12)
    const err = await res.json().catch(() => ({}));
    console.error("[GROQ ERROR DETECTED]:", err);
    return `ERROR: GROQ CONNECTION FAILED (${res.status})`;
  }
  
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "NO RESPONSE";
}

async function fetchOpenAI(prompt, system, key, model) {
  if (!key || key.trim() === '') return "ERROR: NO OPENAI API KEY PROVIDED.";
  
  const messages = [];
  if (system && system.trim() !== '') messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt || " " });
  
  const targetModel = (model && model.trim() !== '') ? model : 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: targetModel, messages: messages })
  });
  if (!res.ok) return `ERROR: OPENAI OFFLINE (${res.status})`;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "NO RESPONSE";
}

async function fetchAnthropic(prompt, system, key, model) {
  if (!key || key.trim() === '') return "ERROR: NO CLAUDE API KEY PROVIDED.";
  const targetModel = (model && model.trim() !== '') ? model : 'claude-3-haiku-20240307';
  
  const payload = { model: targetModel, max_tokens: 1024, messages: [{ role: 'user', content: prompt || " " }] };
  if (system && system.trim() !== '') payload.system = system;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerously-allow-browser': 'true' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return `ERROR: ANTHROPIC OFFLINE (${res.status})`;
  const data = await res.json();
  return data.content?.[0]?.text || "NO RESPONSE";
}

async function fetchOllama(prompt, system, model, baseUrl) {
  const targetModel = (model && model.trim() !== '') ? model : 'llama3';
  const targetUrl = (baseUrl && baseUrl.trim() !== '') ? baseUrl : 'http://localhost:11434/api/generate';
  
  const res = await fetch(targetUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: targetModel, system: system || "", prompt: prompt || " ", stream: false })
  });
  if (!res.ok) return `ERROR: OLLAMA OFFLINE (${res.status})`;
  const data = await res.json();
  return data.response || "NO RESPONSE";
}
