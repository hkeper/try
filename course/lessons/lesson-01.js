COURSE.define('lesson-01', {
  done: true,
  time: '1,5 часа',
  tag: 'lesson-01',
  context: 'Урок 1: package.json с @playwright/test, .gitignore, первые два теста на saucedemo.com без конфига. Обсуждались web-first assertions, воркеры и выбор локаторов (CSS/id, getByRole, data-test).',
  sections: [
    {
      kind: 'why',
      title: 'Зачем этот урок',
      html: `
<p>Нужен минимальный проект, который запускается одной командой и падает понятным образом. На нём будем наращивать всё остальное, поэтому каждую строку в нём надо понимать.</p>`,
    },
    {
      kind: 'theory',
      title: 'Что внутри',
      html: `
<h3>@playwright/test и его зависимости</h3>
<p>Ставим один пакет <code>@playwright/test</code>, а в <code>node_modules</code> появляются ещё <code>playwright</code> и <code>playwright-core</code>. Это транзитивные зависимости: раннер тестов тянет библиотеку автоматизации, а та — ядро с протоколом браузеров. Браузеры ставятся отдельно: <code>npx playwright install chromium</code>.</p>

<h3>Web-first assertions</h3>
<p><code>await expect(locator).toBeVisible()</code> не проверяет один раз. Он повторяет проверку: сразу, потом с паузами 20, 50, 100, 100, 500 мс, дальше каждые 500 мс, пока не истечёт <code>expect.timeout</code> (по умолчанию 5 с). Поэтому явные <code>waitForTimeout</code> не нужны.</p>

<h3>Воркеры</h3>
<p>Файлы с тестами раскладываются по воркерам и идут параллельно. Тесты внутри одного файла по умолчанию выполняются последовательно в одном воркере.</p>

<h3>Как искать элемент</h3>
<div class="table-wrap"><table>
<tr><th>Способ</th><th>Плюс</th><th>Минус</th></tr>
<tr><td><code>#id</code>, CSS</td><td>коротко, быстро</td><td>ломается от рефакторинга вёрстки</td></tr>
<tr><td><code>getByRole</code></td><td>как видит пользователь и скринридер</td><td>зависит от текста — ломается при смене языка (i18n)</td></tr>
<tr><td><code>data-test</code></td><td>стабилен, не зависит от языка</td><td>нужна договорённость с разработчиками</td></tr>
</table></div>
<p>На saucedemo есть атрибут <code>data-test</code>. В уроке 2 научим Playwright считать его test id.</p>`,
    },
    {
      kind: 'code',
      title: 'Код по частям',
      html: `
<p class="code-file">.gitignore</p>
<pre><code class="language-bash"># Dependencies
node_modules/

# Playwright artifacts
test-results/
playwright-report/</code></pre>
<p class="code-file">tests/login.spec.ts</p>
<pre><code class="language-typescript">import {test, expect} from '@playwright/test';

test('login page opens', async ({page}) =&gt; {
  await page.goto('https://www.saucedemo.com/');
  await expect(page).toHaveTitle('Swag Labs');
});

test('login page has username field and login button', async ({page}) =&gt; {
  await page.goto('https://www.saucedemo.com/');
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});</code></pre>`,
    },
    {
      kind: 'task',
      title: 'Самостоятельное задание',
      tasks: [
        {
          id: 'password-test',
          title: 'Третий тест: поле пароля',
          mono: true,
          inputLabel: 'Код теста',
          placeholder: "test('...', async ({page}) => {\n  ...\n});",
          prompt: `<p>Допиши в <code>tests/login.spec.ts</code> тест, который проверяет, что на странице логина есть поле пароля и оно имеет тип <code>password</code> (символы скрыты). Без конфига, адрес пока пишем полностью.</p>`,
          rubric: `Обязательно: test() с async ({page}); page.goto на https://www.saucedemo.com/; локатор поля пароля (getByPlaceholder('Password') или getByTestId/locator по data-test/id — любой рабочий); web-first проверка видимости и проверка атрибута type=password через await expect(...).toHaveAttribute('type', 'password'). Все expect с await.
Ошибка: проверка через getAttribute без expect или без await; waitForTimeout.`,
          reference: `test('login page has hidden password field', async ({page}) => {
  await page.goto('https://www.saucedemo.com/');
  const password = page.getByPlaceholder('Password');
  await expect(password).toBeVisible();
  await expect(password).toHaveAttribute('type', 'password');
});`,
          hints: ['Для атрибутов есть web-first матчер, он тоже ретраит.'],
        },
      ],
    },
    {
      kind: 'checkpoint',
      title: 'Чекпоинт',
      html: `<pre><code class="language-bash">npx playwright test</code></pre>`,
      tasks: [
        {
          id: 'run-output',
          title: 'Вывод прогона',
          mono: true,
          inputLabel: 'Вставь вывод терминала',
          prompt: `<p>Запусти тесты и вставь вывод целиком. Отдельной строкой ответь: сколько воркеров использовалось и почему именно столько?</p>`,
          rubric: `Обязательно: вывод показывает 3 passed (или столько тестов, сколько в файле, все зелёные); ученик верно объясняет число воркеров: все тесты в одном файле, файлы параллелятся, а тесты внутри файла по умолчанию идут последовательно — поэтому фактически занят 1 воркер (Playwright может написать «using 1 worker» или больше, но работа одного файла идёт в одном воркере).
Если тесты упали — status failed, помоги разобрать ошибку по выводу.`,
        },
      ],
    },
    {
      kind: 'questions',
      title: 'Вопросы',
      tasks: [
        {
          id: 'retry-timing',
          title: 'Сколько ждёт expect',
          prompt: `<p>Кнопка появляется на странице через 1,2 секунды после загрузки. Сколько примерно проверок сделает <code>await expect(button).toBeVisible()</code>, прежде чем пройдёт? А если кнопка не появится вовсе — через сколько тест упадёт и с чем?</p>`,
          rubric: `Обязательно: объяснение ретраев с backoff (сразу, 20, 50, 100, 100, 500, затем по 500 мс) — к 1,2 с набирается порядка 6–7 проверок (точное число неважно, важна логика накопления пауз); если элемента нет — падение по expect.timeout 5 с с ошибкой вида «Timed out 5000ms waiting for expect(locator).toBeVisible()».`,
          reference: `Паузы: 0 → 20 → 50 → 100 → 100 → 500 → 500… Накопленное время ≈ 0; 0,02; 0,07; 0,17; 0,27; 0,77; 1,27 с — пройдёт примерно на 7-й проверке. Если кнопки нет — через expect.timeout (5 с) ошибка «Timed out 5000ms waiting for expect(locator).toBeVisible()».`,
        },
      ],
    },
    {
      kind: 'commit',
      title: 'Коммит и тег',
      html: `<pre><code class="language-bash">git add .gitignore package.json package-lock.json tests/login.spec.ts LEARNING_PLAN.md
git commit -m "Lesson 1: project skeleton and first test"
git tag lesson-01
git push --follow-tags</code></pre>`,
    },
  ],
});
