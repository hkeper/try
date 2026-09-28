COURSE.define('lesson-02', {
  time: '2 часа',
  tag: 'lesson-02',
  context: 'Урок 2: после урока 1 есть package.json с @playwright/test, .gitignore и tests/login.spec.ts с полными URL. Теперь добавляем typescript, @types/node, dotenv; tsconfig.json (noEmit, strict) и скрипт typecheck; playwright.config.ts с baseURL из BASE_URL через ??, testIdAttribute: data-test, настройками для CI (forbidOnly, retries, workers); .env в .gitignore, .env.example в git.',
  sections: [
    {
      kind: 'why',
      title: 'Зачем этот урок',
      html: `
<p>Сейчас адрес сайта зашит в каждый тест, а TypeScript никто не проверяет: Playwright просто вырезает типы и запускает код. Ошибка типа всплывёт только в рантайме или не всплывёт вовсе.</p>
<p>После урока в проекте будет строгий <code>tsc</code>, один конфиг Playwright с адресом из переменной окружения и поиск по <code>data-test</code> через <code>getByTestId</code>. Дальше этот конфиг понадобится для ключа Claude API.</p>`,
    },
    {
      kind: 'theory',
      title: 'Теория',
      html: `
<h3>Кто компилирует TypeScript</h3>
<p>Playwright запускает <code>.ts</code> сам, но только транспилирует: типы стираются без проверки. Проверку делает <code>tsc</code>. Поэтому в <code>tsconfig.json</code> ставим <code>"noEmit": true</code>: JavaScript нам не нужен, нужен только отчёт об ошибках. Запускаем его отдельным скриптом <code>npm run typecheck</code>.</p>

<h3>playwright.config.ts</h3>
<p>Конфиг экспортирует объект через <code>defineConfig</code> — эта обёртка ничего не делает в рантайме, она даёт подсказки типов. Ключевые поля:</p>
<ul>
<li><code>testDir</code> — где искать тесты.</li>
<li><code>use.baseURL</code> — префикс для <code>page.goto('/')</code>.</li>
<li><code>use.testIdAttribute</code> — какой атрибут читает <code>getByTestId</code>. По умолчанию <code>data-testid</code>, на saucedemo — <code>data-test</code>.</li>
<li><code>forbidOnly</code>, <code>retries</code>, <code>workers</code> — разное поведение локально и в CI (по переменной <code>CI</code>, которую выставляет GitHub Actions).</li>
</ul>

<h3>dotenv и .env</h3>
<p><code>import 'dotenv/config'</code> читает файл <code>.env</code> и кладёт значения в <code>process.env</code>, если там таких ещё нет. Уже заданные переменные окружения (например, в CI) не перезаписываются.</p>
<p><code>.env</code> хранит личные значения и секреты, поэтому в git не идёт. В git идёт <code>.env.example</code> — список нужных переменных без секретов.</p>

<h3><code>??</code> против <code>||</code></h3>
<p><code>a ?? b</code> возьмёт <code>b</code>, только если <code>a</code> равно <code>null</code> или <code>undefined</code>. <code>a || b</code> возьмёт <code>b</code> для любого «ложного» <code>a</code>: <code>''</code>, <code>0</code>, <code>false</code>. Для строки из окружения это важно: строка <code>BASE_URL=</code> в <code>.env</code> даёт пустую строку.</p>
<div class="callout warn">Вопрос про пустой <code>BASE_URL</code> будет в конце урока. Подумай заранее, что именно получится в каждом варианте.</div>`,
    },
    {
      kind: 'code',
      title: 'Код по частям',
      html: `
<h3>1. Зависимости</h3>
<pre><code class="language-bash">npm install --save-dev typescript @types/node dotenv</code></pre>
<p>Всё в <code>devDependencies</code>: это инструменты разработки и тестов, в прод ничего не уезжает.</p>

<h3>2. tsconfig.json</h3>
<p class="code-file">tsconfig.json</p>
<pre><code class="language-json">{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["playwright.config.ts", "tests/**/*.ts", "src/**/*.ts"]
}</code></pre>

<h3>3. Скрипт проверки типов</h3>
<p class="code-file">package.json → scripts</p>
<pre><code class="language-json">"scripts": {
  "test": "playwright test",
  "typecheck": "tsc"
}</code></pre>

<h3>4. playwright.config.ts</h3>
<p class="code-file">playwright.config.ts</p>
<pre><code class="language-typescript">import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});</code></pre>

<h3>5. Переменные окружения</h3>
<p class="code-file">.env.example (в git)</p>
<pre><code class="language-bash">BASE_URL=https://www.saucedemo.com</code></pre>
<p>Скопируй его в <code>.env</code> и добавь в <code>.gitignore</code>:</p>
<p class="code-file">.gitignore</p>
<pre><code class="language-bash"># Local environment
.env</code></pre>`,
    },
    {
      kind: 'task',
      title: 'Самостоятельное задание',
      tasks: [
        {
          id: 'rewrite-login',
          title: 'Переведи login.spec.ts на конфиг',
          mono: true,
          inputLabel: 'Новый tests/login.spec.ts целиком',
          prompt: `<p>Перепиши <code>tests/login.spec.ts</code>:</p>
<ol>
<li>Вместо полного адреса — <code>page.goto('/')</code>.</li>
<li>Поле логина и кнопку ищи через <code>getByTestId</code> (посмотри в DevTools, какие значения <code>data-test</code> у них на saucedemo).</li>
<li>Добавь тест: пользователь <code>locked_out_user</code> с паролем <code>secret_sauce</code> видит ошибку, что он заблокирован.</li>
</ol>`,
          rubric: `Обязательно:
- page.goto('/') во всех тестах, полного URL нет;
- getByTestId('username') и getByTestId('login-button') (значения data-test на saucedemo: username, password, login-button, error);
- новый тест: fill username 'locked_out_user', password 'secret_sauce', click login, затем await expect(getByTestId('error')).toContainText / toHaveText с текстом про locked out ("Sorry, this user has been locked out.");
- все expect с await, нет waitForTimeout.
Допустимо оставить тест на title. getByRole для кнопки вместо getByTestId — flaky (задание просило getByTestId).`,
          reference: `import { test, expect } from '@playwright/test';

test('login page opens', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Swag Labs');
});

test('login page has username field and login button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('username')).toBeVisible();
  await expect(page.getByTestId('login-button')).toBeVisible();
});

test('locked out user sees an error', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('locked_out_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('error')).toContainText('locked out');
});`,
          hints: ['В DevTools: правый клик по полю → «Просмотреть код», атрибут data-test.', 'Сообщение об ошибке тоже имеет свой data-test.'],
        },
      ],
    },
    {
      kind: 'checkpoint',
      title: 'Чекпоинт',
      html: `<pre><code class="language-bash">npm run typecheck
npm test</code></pre>`,
      tasks: [
        {
          id: 'checkpoint-output',
          title: 'Типы и тесты зелёные',
          mono: true,
          inputLabel: 'Вывод обеих команд',
          prompt: `<p>Вставь вывод <code>npm run typecheck</code> и <code>npm test</code>. Затем специально сломай тип: в тесте передай в <code>toHaveTitle</code> число вместо строки, запусти <code>npm run typecheck</code> и <code>npm test</code> ещё раз и вставь вывод. Что поймал <code>tsc</code> и что сделал Playwright?</p>`,
          rubric: `Обязательно:
- первый прогон: typecheck без ошибок, все тесты passed (3 шт.);
- после поломки tsc выдаёт ошибку типа (TS2345 или похожую: number not assignable to string | RegExp);
- ученик замечает, что Playwright тесты всё равно запускает (транспиляция без проверки типов), и тест падает уже в рантайме по значению, а не по типу;
- вывод, что typecheck нужен отдельным шагом (и в CI).`,
        },
      ],
    },
    {
      kind: 'review',
      title: 'Ревью diff',
      html: `<pre><code class="language-bash">git status
git diff</code></pre>`,
      tasks: [
        {
          id: 'diff',
          title: 'Покажи изменения',
          mono: true,
          inputLabel: 'Вывод git status и git diff',
          prompt: `<p>Перед коммитом вставь <code>git status</code> и <code>git diff</code>. Отметь сам, есть ли там что-то лишнее.</p>`,
          rubric: `Проверь как ревьюер:
- в изменениях есть tsconfig.json, playwright.config.ts, .env.example, изменения .gitignore (.env), package.json (typecheck, новые devDependencies), package-lock.json, tests/login.spec.ts;
- .env НЕ в списке файлов (ни tracked, ни untracked — он должен игнорироваться);
- нет node_modules, test-results, playwright-report;
- в package.json новые пакеты в devDependencies, не в dependencies;
- нет посторонних правок (форматирование всего файла, случайные файлы IDE).
Если вставлен не git diff — failed с объяснением, что нужно.`,
        },
      ],
    },
    {
      kind: 'questions',
      title: 'Вопросы',
      tasks: [
        {
          id: 'q-env',
          title: '1. Почему .env не в git',
          prompt: `<p>Почему <code>.env</code> не коммитим, а <code>.env.example</code> коммитим? Что сломается у нового человека, если <code>.env.example</code> не будет?</p>`,
          rubric: `Обязательно: .env содержит личные значения и секреты (скоро ключ Claude API), попадание в git = утечка навсегда в истории; .env.example документирует, какие переменные нужны, без значений-секретов; без него новичок не знает, какие переменные задать.`,
        },
        {
          id: 'q-nullish',
          title: '2. Пустой BASE_URL',
          prompt: `<p>В <code>.env</code> записано <code>BASE_URL=</code> (пусто). Что получит <code>baseURL</code> при <code>??</code> и при <code>||</code>? Что тогда сделает <code>page.goto('/')</code>? Какой вариант ты выберешь и почему?</p>`,
          rubric: `Обязательно: dotenv задаст пустую строку ''; с ?? baseURL = '' (пустая строка не null/undefined), page.goto('/') без базового адреса упадёт с ошибкой про невалидный URL; с || сработает запасной адрес saucedemo. Выбор аргументирован: || надёжнее для строк из окружения, либо ?? + явная проверка/ошибка на пустое значение. Любой обоснованный выбор ок.`,
        },
        {
          id: 'q-selectors',
          title: '3. Выбор локатора',
          prompt: `<p>Когда ты возьмёшь <code>getByRole</code>, а когда <code>getByTestId</code>? Приведи пример ситуации из saucedemo для каждого.</p>`,
          rubric: `Обязательно: getByRole — когда важно, как элемент видит пользователь/доступность, и текст стабилен; getByTestId — когда текст меняется (i18n, копирайт), элементов с одинаковой ролью много или у элемента нет доступного имени. Примеры: getByRole('button', {name:'Login'}) для кнопки логина в одноязычном проекте; getByTestId для ошибки, элементов списка товаров (add-to-cart-...), полей формы. Пример должен быть из saucedemo.`,
        },
        {
          id: 'q-ci',
          title: '4. Настройки для CI',
          prompt: `<p>Что делают <code>forbidOnly: !!process.env.CI</code>, <code>retries: process.env.CI ? 2 : 0</code> и <code>workers: process.env.CI ? 1 : undefined</code>? Зачем <code>!!</code>?</p>`,
          rubric: `Обязательно: forbidOnly — в CI падать, если в коде забыт test.only (иначе прогонится один тест и CI будет зелёным); retries 2 в CI — повтор упавших, падение после ретрая помечается flaky, trace пишется на первом ретрае (on-first-retry); локально 0, чтобы сразу видеть падения; workers 1 в CI — стабильность на слабых раннерах, undefined локально = по умолчанию (половина ядер); !! превращает строку/undefined в boolean, потому что поле ждёт boolean.`,
        },
        {
          id: 'q-commit',
          title: '5. Что коммитим',
          prompt: `<p>Перечисли файлы, которые войдут в коммит этого урока, и файлы, которые не должны в него попасть.</p>`,
          rubric: `Входят: package.json, package-lock.json, tsconfig.json, playwright.config.ts, .env.example, .gitignore, tests/login.spec.ts, LEARNING_PLAN.md (отметка урока). Не входят: .env, node_modules/, test-results/, playwright-report/. Отсутствие package-lock.json или наличие .env в коммите — failed.`,
        },
      ],
    },
    {
      kind: 'commit',
      title: 'Коммит и тег',
      html: `<pre><code class="language-bash">git add package.json package-lock.json tsconfig.json playwright.config.ts .env.example .gitignore tests/login.spec.ts LEARNING_PLAN.md
git commit -m "Lesson 2: tsconfig, playwright config and dotenv"
git tag lesson-02
git push --follow-tags</code></pre>`,
    },
  ],
});
