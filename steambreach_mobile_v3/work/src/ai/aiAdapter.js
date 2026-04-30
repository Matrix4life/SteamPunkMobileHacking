// src/ai/aiAdapter.js
// Multi-provider AI abstraction layer.
// When no API key is configured, silently falls back to offline static content.

import { getOfflineResponse } from '../data/offlineFallbacks';

export const DEFAULT_AI_CONFIG = {
  provider: 'gemini',
  apiKey: '',
  model: '',
  baseUrl: 'http://localhost:11434/api/generate'
};

export const loadAiConfig = () => {
  try {
    return JSON.parse(localStorage.getItem('hexoverride_ai_config')) || DEFAULT_AI_CONFIG;
  } catch { return DEFAULT_AI_CONFIG; }
};

// Returns true if the current config has a usable API key
export const hasApiKey = (config = loadAiConfig()) => {
  const { provider, apiKey } = config;
  if (provider === 'ollama') return true; // local, no key needed
  return !!(apiKey && apiKey.trim().length > 8);
};

export async function generateDirectorText(prompt, systemInstruction = '', config = loadAiConfig()) {
  // OFFLINE MODE — no key configured, use static fallbacks silently
  if (!hasApiKey(config)) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 400));
    return getOfflineResponse(prompt, systemInstruction);
  }

  const { provider, apiKey, model, baseUrl } = config;

  try {
    if (provider === 'gemini')    return await fetchGemini(prompt, systemInstruction, apiKey, model);
    if (provider === 'openai')    return await fetchOpenAI(prompt, systemInstruction, apiKey, model);
    if (provider === 'anthropic') return await fetchAnthropic(prompt, systemInstruction, apiKey, model);
    if (provider === 'groq')      return await fetchGroq(prompt, systemInstruction, apiKey, model);
    if (provider === 'ollama')    return await fetchOllama(prompt, systemInstruction, model, baseUrl);
    throw new Error(`Unknown provider: ${provider}`);
  } catch (error) {
    console.warn(`[AI ADAPTER] ${provider} failed, using offline fallback:`, error.message);
    return getOfflineResponse(prompt, systemInstruction);
  }
}

async function fetchGemini(prompt, system, key, model) {
  if (!key || key.trim() === '') return getOfflineResponse(prompt, system);
  const targetModel = (model && model.trim() !== '') ? model : 'gemini-1.5-flash';
  const payload = { contents: [{ parts: [{ text: prompt || ' ' }] }] };
  if (system && system.trim() !== '') payload.systemInstruction = { parts: [{ text: system }] };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) { console.warn(`[GEMINI] HTTP ${res.status} — offline fallback`); return getOfflineResponse(prompt, system); }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || getOfflineResponse(prompt, system);
}

const GROQ_DEFAULT_MODEL = 'llama-3.1-8b-instant';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function fetchGroq(prompt, system, key, model) {
  if (!key || key.trim() === '') return getOfflineResponse(prompt, system);
  const keyList = key.split(',');
  const randomKey = keyList[Math.floor(Math.random() * keyList.length)].trim();
  const buildMessages = () => {
    const msgs = [];
    if (system && system.trim() !== '') msgs.push({ role: 'system', content: system });
    msgs.push({ role: 'user', content: prompt || ' ' });
    return msgs;
  };
  const hasCustomModel = model && model.trim() !== '';
  const targetModel = hasCustomModel ? model.trim() : GROQ_DEFAULT_MODEL;
  const doRequest = async (modelId) => fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${randomKey}` },
    body: JSON.stringify({ model: modelId, messages: buildMessages(), max_tokens: 400, temperature: 0.8 })
  });
  let res = await doRequest(targetModel);
  if (!res.ok && hasCustomModel && (res.status === 404 || res.status === 400)) {
    console.warn(`[GROQ] Model "${targetModel}" rejected — retrying with ${GROQ_DEFAULT_MODEL}`);
    res = await doRequest(GROQ_DEFAULT_MODEL);
    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || getOfflineResponse(prompt, system);
      return `[!] GROQ: Model "${targetModel}" deprecated. Fell back to ${GROQ_DEFAULT_MODEL}.\n[!] Clear Model Override in AI SETTINGS.\n\n${text}`;
    }
  }
  if (!res.ok) { console.warn(`[GROQ] HTTP ${res.status} — offline fallback`); return getOfflineResponse(prompt, system); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || getOfflineResponse(prompt, system);
}

async function fetchOpenAI(prompt, system, key, model) {
  if (!key || key.trim() === '') return getOfflineResponse(prompt, system);
  const messages = [];
  if (system && system.trim() !== '') messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt || ' ' });
  const targetModel = (model && model.trim() !== '') ? model : 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: targetModel, messages })
  });
  if (!res.ok) { console.warn(`[OPENAI] HTTP ${res.status} — offline fallback`); return getOfflineResponse(prompt, system); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || getOfflineResponse(prompt, system);
}

async function fetchAnthropic(prompt, system, key, model) {
  if (!key || key.trim() === '') return getOfflineResponse(prompt, system);
  const targetModel = (model && model.trim() !== '') ? model : 'claude-3-haiku-20240307';
  const payload = { model: targetModel, max_tokens: 1024, messages: [{ role: 'user', content: prompt || ' ' }] };
  if (system && system.trim() !== '') payload.system = system;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerously-allow-browser': 'true' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) { console.warn(`[ANTHROPIC] HTTP ${res.status} — offline fallback`); return getOfflineResponse(prompt, system); }
  const data = await res.json();
  return data.content?.[0]?.text || getOfflineResponse(prompt, system);
}

async function fetchOllama(prompt, system, model, baseUrl) {
  const targetModel = (model && model.trim() !== '') ? model : 'llama3';
  const targetUrl   = (baseUrl && baseUrl.trim() !== '') ? baseUrl : 'http://localhost:11434/api/generate';
  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: targetModel, system: system || '', prompt: prompt || ' ', stream: false })
  });
  if (!res.ok) { console.warn(`[OLLAMA] HTTP ${res.status} — offline fallback`); return getOfflineResponse(prompt, system); }
  const data = await res.json();
  return data.response || getOfflineResponse(prompt, system);
}
