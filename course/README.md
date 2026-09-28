# Курс «AI-локатор на Playwright» — интерактивная версия

Статический сайт без сборки: `index.html` + `assets/` + `lessons/`.
Опубликован как Artifact на claude.ai (там кнопка «Проверить» спрашивает Claude через capability `sample`).

## Как устроено

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

## Проверка

«Проверить» отправляет Claude урок, условие, критерии, эталон и ответ; Claude возвращает JSON
`{status: passed|flaky|failed, summary, points[], hint, next}`. Где `sample` недоступен
(открыто не на claude.ai, аноним), остаётся «Скопировать запрос для чата» — тот же запрос без эталона.
