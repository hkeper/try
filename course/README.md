# Курс «AI-локатор на Playwright» — интерактивная версия

Статический сайт без сборки: `index.html` + `assets/` + `lessons/`.
Опубликован как Artifact на claude.ai (там кнопка «Проверить» спрашивает Claude через capability `sample`).

## Как устроено

- `assets/store.js` — где хранится прогресс (сейчас `localStorage`; сюда встанет синхронизация с аккаунтом).
- `assets/ai.js` — кто отвечает на «Проверить»/«Спросить»: claude.ai (`sample`), свой API-ключ ученика, либо никто (копирование запроса). Сюда встанет режим «сервер курса».

- `lessons/course.js` — оглавление: модули и список уроков. Урок без `sections` показывается как «готовится».
- `lessons/lesson-XX.js` — содержимое урока через `COURSE.define('lesson-XX', {...})`.
- `assets/app.js` — роутинг по `#lesson-XX`, рендер, проверка, прогресс в `localStorage`.
- `index.html` — подключает скрипты. Новый урок = новый файл + строка `<script>` здесь.

## Формат урока

```js
COURSE.define('lesson-03', {
  time: '1,5 часа',
  tag: 'lesson-03',
  context: 'Что уже есть в проекте к этому уроку — уходит в промпт проверки.',
  sections: [
    { kind: 'why' | 'theory' | 'code' | 'task' | 'checkpoint' | 'review' | 'questions' | 'commit',
      title: '...',
      html: '...',          // теория/код, HTML
      tasks: [{
        id: 'unique-in-lesson',
        title: '...',
        prompt: '<p>Условие (HTML)</p>',
        rubric: 'Критерии приёмки — видит только Claude',
        reference: 'Эталон — показывается после passed или 3 попыток',
        hints: ['...'],
        mono: true,          // поле для кода/вывода терминала
        inputLabel: '...', placeholder: '...',
      }] },
  ],
});
```

## Сборка и деплой

`index.html` написан без `<!doctype>`/`<head>` — их добавляет claude.ai. Для обычного хостинга:

```bash
node build.mjs   # → dist/ с полным HTML-документом
```

Деплой — Cloudflare Pages (бесплатно, работает с приватным репозиторием):
Workers & Pages → Create → Pages → Connect to Git → репозиторий курса;
Build command `node build.mjs`, Build output directory `dist`. Дальше каждый push в `main` публикуется сам,
для остальных веток создаются preview-адреса. `.github/workflows/ci.yml` проверяет синтаксис и сборку.

## Проверка

«Проверить» отправляет Claude урок, условие, критерии, эталон и ответ; Claude возвращает JSON
`{status: passed|flaky|failed, summary, points[], hint, next}`. Где `sample` недоступен
и ключа нет, остаётся «Скопировать запрос для чата» — тот же запрос без эталона.

Свой ключ: вводится в боковой панели («Проверка»), хранится только в браузере, запрос идёт
напрямую в `api.anthropic.com` (заголовок `anthropic-dangerous-direct-browser-access`).
По умолчанию `claude-opus-5` с `fallbacks: "default"`; ученик может выбрать модель дешевле.
