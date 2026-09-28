/* Хранилище прогресса. Сейчас — localStorage этого браузера.
   Позже сюда встанет синхронизация с аккаунтом: интерфейс load/save не меняется. */
window.CourseStore = (function () {
  'use strict';
  const KEY = 'ai-locator-course:v1';
  return {
    kind: 'local',
    load() {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    },
    save(state) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* без хранилища тоже работаем */ }
    },
  };
})();
