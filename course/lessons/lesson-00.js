COURSE.define('lesson-00', {
  done: true,
  time: '40 мин',
  tag: 'lesson-00',
  context: 'Нулевой урок: окружение (Node, npm, git, GitHub) и основы npm. Кода проекта ещё нет, эксперименты — в песочнице вне репозитория.',
  sections: [
    {
      kind: 'why',
      title: 'Зачем этот урок',
      html: `
<p>Весь курс держится на npm: он ставит Playwright, TypeScript, SDK Claude. Если не понимать, что лежит в <code>package.json</code>, чем он отличается от lock-файла и почему CI ставит зависимости через <code>npm ci</code>, то первая же «у меня работает, а в CI нет» съест вечер.</p>
<p>После урока ты сможешь объяснить, откуда берётся конкретная версия пакета в <code>node_modules</code> и как сделать так, чтобы у всех она была одинаковой.</p>`,
    },
    {
      kind: 'theory',
      title: 'package.json, lock-файл и semver',
      html: `
<h3>Два файла — две роли</h3>
<div class="table-wrap"><table>
<tr><th></th><th>package.json</th><th>package-lock.json</th></tr>
<tr><td>Кто пишет</td><td>человек (и <code>npm install &lt;pkg&gt;</code>)</td><td>только npm</td></tr>
<tr><td>Что хранит</td><td>диапазоны: «хочу Playwright 1.x не ниже 1.63»</td><td>точное дерево: какая версия каждого пакета, откуда скачана, хэш</td></tr>
<tr><td>В git</td><td>да</td><td>да, обязательно</td></tr>
</table></div>

<h3>Semver: MAJOR.MINOR.PATCH</h3>
<ul>
<li><code>^1.63.0</code> — любая <code>1.x.y</code> не ниже 1.63.0. MAJOR зафиксирован.</li>
<li><code>~1.63.0</code> — только патчи: <code>1.63.x</code>.</li>
<li><code>1.63.0</code> — ровно эта версия.</li>
<li>Для <code>0.x</code> правила строже: <code>^0.4.2</code> — это <code>&gt;=0.4.2 &lt;0.5.0</code>, потому что до 1.0 MINOR считается ломающим.</li>
</ul>

<h3>npm install и npm ci</h3>
<ul>
<li><code>npm install</code> читает <code>package.json</code>, подбирает версии в рамках диапазонов, при необходимости <strong>обновляет</strong> lock-файл.</li>
<li><code>npm ci</code> удаляет <code>node_modules</code> и ставит строго по lock-файлу. Если lock и <code>package.json</code> расходятся — падает с ошибкой. Поэтому его используют в CI.</li>
</ul>

<h3>node_modules/.bin и npx</h3>
<p>У пакетов с CLI (например, <code>@playwright/test</code>) исполняемые файлы попадают в <code>node_modules/.bin</code>. Скрипты из <code>"scripts"</code> в <code>package.json</code> запускаются с этой папкой в <code>PATH</code>, поэтому <code>"test": "playwright test"</code> работает без глобальной установки. <code>npx playwright</code> делает то же самое из терминала.</p>`,
    },
    {
      kind: 'code',
      title: 'Проверяем окружение',
      html: `
<p>Набери в терминале и убедись, что всё отвечает:</p>
<pre><code class="language-bash">node -v
npm -v
git --version
git remote -v</code></pre>
<p>На момент урока было: Node v22.17.0, npm 11.19.1, git 2.50, remote <code>origin</code> указывает на <code>github.com/hkeper/ai-locator-playwright</code>.</p>`,
    },
    {
      kind: 'task',
      title: 'Задание',
      tasks: [
        {
          id: 'semver',
          title: 'Разбери диапазоны версий',
          prompt: `<p>Для каждого диапазона напиши, какие из версий <code>1.62.9</code>, <code>1.63.0</code>, <code>1.63.4</code>, <code>1.70.0</code>, <code>2.0.0</code> он допускает:</p>
<ol><li><code>^1.63.0</code></li><li><code>~1.63.0</code></li><li><code>1.63.0</code></li></ol>
<p>И отдельно: что допускает <code>^0.4.2</code> и почему не так, как <code>^1.4.2</code>?</p>`,
          rubric: `1) ^1.63.0 допускает 1.63.0, 1.63.4, 1.70.0; не допускает 1.62.9 и 2.0.0.
2) ~1.63.0 допускает 1.63.0 и 1.63.4; остальные нет.
3) 1.63.0 — только 1.63.0.
4) ^0.4.2 = >=0.4.2 <0.5.0; объяснение: для версий 0.x MINOR считается ломающим изменением, поэтому каретка фиксирует и MINOR.
Все четыре пункта обязательны для passed.`,
          reference: `^1.63.0 → 1.63.0, 1.63.4, 1.70.0
~1.63.0 → 1.63.0, 1.63.4
1.63.0  → только 1.63.0
^0.4.2  → >=0.4.2 <0.5.0: до 1.0 любой MINOR может ломать API, поэтому ^ фиксирует первую ненулевую цифру.`,
          hints: ['Каретка фиксирует самую левую ненулевую цифру версии.'],
        },
        {
          id: 'ci-vs-install',
          title: 'npm ci или npm install',
          prompt: `<p>Коллега жалуется: «локально тесты зелёные, в CI падают, а у тебя тоже зелёные». В CI стоит <code>npm install</code>. Объясни, как это может быть связано с установкой зависимостей и что ты поменяешь в CI. Упомяни, какой файл тут главный.</p>`,
          rubric: `Обязательно: npm install может подобрать другие версии в пределах диапазонов package.json (и переписать lock), поэтому в CI может оказаться не то дерево, что у разработчиков; решение — npm ci, который ставит строго по package-lock.json и падает при рассинхроне; lock-файл должен быть в git.
Плюсом: npm ci удаляет node_modules перед установкой; воспроизводимость сборки.`,
          reference: `npm install в CI волен подобрать более свежие версии в рамках ^/~ и обновить lock, так что в CI оказывается другое дерево зависимостей. Меняю на npm ci: он ставит ровно то, что записано в package-lock.json (lock закоммичен), начинает с чистого node_modules и падает, если lock и package.json разошлись.`,
        },
      ],
    },
    {
      kind: 'questions',
      title: 'Вопросы на понимание',
      tasks: [
        {
          id: 'npx',
          title: 'Откуда берётся команда playwright',
          prompt: `<p>Playwright не установлен глобально, но <code>npm test</code> со скриптом <code>"test": "playwright test"</code> работает. Почему? И что изменится, если запустить просто <code>playwright test</code> в терминале?</p>`,
          rubric: `Обязательно: CLI пакета лежит в node_modules/.bin; npm run добавляет эту папку в PATH на время скрипта; из обычного терминала команды нет в PATH (command not found), нужен npx или npm test.`,
          reference: `Бинарник лежит в node_modules/.bin/playwright. npm при запуске скрипта кладёт node_modules/.bin в PATH, поэтому команда находится. В голом терминале этой папки в PATH нет — будет «command not found»; запускать через npx playwright test или npm test.`,
        },
      ],
    },
    {
      kind: 'commit',
      title: 'Коммит и тег',
      html: `<pre><code class="language-bash">git add AGENTS.md LEARNING_PLAN.md
git commit -m "Lesson 0: environment setup and npm basics"
git tag lesson-00
git push --follow-tags</code></pre>`,
    },
  ],
});
