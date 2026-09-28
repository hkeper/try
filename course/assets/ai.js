/* Кто отвечает на «Проверить» и «Спросить».
   Режимы:
   - claudeai: страница открыта на claude.ai, запрос идёт через аккаунт ученика (capability sample);
   - key:      ученик ввёл свой API-ключ Anthropic, браузер ходит в API напрямую;
   - none:     ни того ни другого — остаётся «Скопировать запрос для чата».
   Позже добавится режим server: прокси курса с оплаченным доступом. */
window.CourseAI = (function () {
  'use strict';

  const KEY_STORE = 'ai-locator-course:api';
  const MODELS = [
    { id: 'claude-opus-5', label: 'Claude Opus 5 — точнее всего' },
    { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 — дешевле' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — самый дешёвый' },
  ];
  const PERMANENT = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];

  let sample = null;
  let sampleBlocked = false;
  const listeners = [];
  const ready = (window.claude && typeof window.claude.use === 'function')
    ? window.claude.use('sample').then(s => { sample = s; notify(); return s; }).catch(() => null)
    : Promise.resolve(null);

  function notify() { listeners.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); }

  function readKey() {
    try { return JSON.parse(localStorage.getItem(KEY_STORE)) || {}; } catch (e) { return {}; }
  }
  function writeKey(v) {
    try {
      if (v) localStorage.setItem(KEY_STORE, JSON.stringify(v)); else localStorage.removeItem(KEY_STORE);
    } catch (e) { /* ignore */ }
    notify();
  }

  function mode() {
    if (sample && !sampleBlocked) return 'claudeai';
    if (readKey().apiKey) return 'key';
    return 'none';
  }

  // ---------- разбор JSON из ответа (как sample.json: целиком, из ```-блока или от { до }) ----------
  function parseJson(text) {
    const t = String(text || '').trim();
    try { return JSON.parse(t); } catch (e) { /* дальше */ }
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) { try { return JSON.parse(fence[1]); } catch (e) { /* дальше */ } }
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a !== -1 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { /* дальше */ } }
    throw { code: 'invalid_json', text: t };
  }

  // ---------- прямой вызов Messages API со своим ключом ----------
  function httpError(status, body) {
    const msg = (body && body.error && body.error.message) || '';
    if (status === 401) return { code: 'bad_key', message: msg };
    if (status === 403) return { code: 'forbidden', message: msg };
    if (status === 429) return { code: 'rate_limited', message: msg };
    if (status === 413) return { code: 'prompt_too_large', message: msg };
    if (status === 400) return { code: 'bad_request', message: msg };
    if (status === 529 || status >= 500) return { code: 'upstream_error', message: msg };
    return { code: 'upstream_error', message: msg };
  }

  async function callApi(messages, opts) {
    const cfg = readKey();
    const body = {
      model: cfg.model || MODELS[0].id,
      max_tokens: 16000,
      messages,
      stream: true,
    };
    const headers = {
      'content-type': 'application/json',
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
    if (body.model === 'claude-opus-5') {
      // при отказе классификатора сервер сам повторит запрос на рекомендованной модели
      headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
      body.fallbacks = 'default';
    }
    let res;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers, body: JSON.stringify(body), signal: opts.signal,
      });
    } catch (e) {
      if (e && e.name === 'AbortError') throw { code: 'cancelled' };
      throw { code: 'network' };
    }
    if (!res.ok) {
      let j = null;
      try { j = await res.json(); } catch (e) { /* ignore */ }
      throw httpError(res.status, j);
    }

    // читаем SSE: нас интересуют text_delta, stop_reason и error
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '', text = '', stop = null;
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 1);
          if (!line.startsWith('data:')) continue;
          let ev;
          try { ev = JSON.parse(line.slice(5)); } catch (e) { continue; }
          if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
            text += ev.delta.text;
            if (opts.onText) opts.onText({ text });
          } else if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason) {
            stop = ev.delta.stop_reason;
          } else if (ev.type === 'error') {
            throw { code: ev.error && ev.error.type === 'overloaded_error' ? 'upstream_error' : 'upstream_error', text: text || undefined };
          }
        }
      }
    } catch (e) {
      if (e && e.name === 'AbortError') throw { code: 'cancelled', text: text || undefined };
      throw e && e.code ? e : { code: 'network', text: text || undefined };
    }
    if (stop === 'refusal') throw { code: 'refused' };
    if (!text.trim()) throw { code: 'empty_completion' };
    return { text, truncated: stop === 'max_tokens' };
  }

  function toMessages(input) {
    return typeof input === 'string' ? [{ role: 'user', content: input }] : input;
  }

  // ---------- общий интерфейс ----------
  async function run(input, opts) {
    await ready;
    const m = mode();
    try {
      if (m === 'claudeai') {
        return await sample(input, { cache: false, signal: opts.signal, onText: opts.onText });
      }
      if (m === 'key') return await callApi(toMessages(input), opts);
    } catch (e) {
      if (m === 'claudeai' && e && PERMANENT.includes(e.code)) { sampleBlocked = true; notify(); }
      throw e;
    }
    throw { code: 'no_provider' };
  }

  return {
    MODELS,
    ready,
    mode,
    onChange(fn) { listeners.push(fn); },
    getKeyConfig() { const c = readKey(); return { hasKey: !!c.apiKey, model: c.model || MODELS[0].id }; },
    setKeyConfig(apiKey, model) { writeKey(apiKey ? { apiKey, model } : null); },
    setModel(model) { const c = readKey(); if (c.apiKey) writeKey({ apiKey: c.apiKey, model }); },
    async json(prompt, opts) {
      const { text } = await run(prompt, opts || {});
      return parseJson(text);
    },
    chat(turns, opts) { return run(turns, opts || {}); },
  };
})();
