/* Оглавление курса. Урок без sections показывается как «готовится».
   Содержимое урока лежит в lessons/lesson-XX.js и подключается через COURSE.define. */
window.COURSE = {
  modules: [
    { id: 'A', title: 'Модуль A. Фундамент (без AI)' },
    { id: 'B', title: 'Модуль B. Архитектура AI-локатора' },
    { id: 'C', title: 'Модуль C. Доводим до проекта' },
  ],
  lessons: [
    { id: 'lesson-00', module: 'A', short: 'Подготовка', title: 'Подготовка: Node, git, npm', goal: 'Node/git, GitHub, npm, package.json и lock-файл.' },
    { id: 'lesson-01', module: 'A', short: 'Скелет проекта', title: 'Скелет проекта и первый тест', goal: 'package.json построчно, зависимости, .gitignore, первый тест.' },
    { id: 'lesson-02', module: 'A', short: 'tsconfig и конфиг', title: 'tsconfig.json, playwright.config.ts и dotenv', goal: 'Настраиваем TypeScript, конфиг Playwright и переменные окружения.' },
    { id: 'lesson-03', module: 'A', short: 'TypeScript', title: 'TypeScript для проекта', goal: 'Типы, классы, свой Error — файл src/ai/types.ts.',
      outline: ['type и interface: когда что', 'union-типы и сужение', 'классы и модификаторы доступа', 'свой класс ошибки с полем причины', '<code>src/ai/types.ts</code> — контракты будущего AI-локатора'] },
    { id: 'lesson-04', module: 'A', short: 'Page Object', title: 'Классический Page Object', goal: 'BasePage, LoginPage и login.spec.ts.',
      outline: ['зачем Page Object и где он мешает', 'BasePage: общая навигация', 'LoginPage: локаторы и действия', 'переписываем login.spec.ts'] },
    { id: 'lesson-05', module: 'B', short: 'Фикстура ai', title: 'Кастомная фикстура ai', goal: 'test.extend и заглушка AiLocatorHelper.',
      outline: ['как устроены фикстуры Playwright', '<code>test.extend</code> и типизация', 'заглушка <code>AiLocatorHelper</code>'] },
    { id: 'lesson-06', module: 'B', short: 'Кэш локаторов', title: 'Кэш локаторов на диске', goal: 'locatorCache.ts: чтение, запись, ключи.',
      outline: ['формат кэша и ключ записи', 'чтение и запись JSON через fs', 'когда кэш протухает'] },
    { id: 'lesson-07', module: 'B', short: 'Движок без AI', title: 'Движок без AI: cache → fallback', goal: 'Цепочка стратегий и гонка с count().',
      outline: ['цепочка cache → fallback', 'почему <code>count()</code> даёт race condition', 'как проверять локатор надёжно'] },
    { id: 'lesson-08', module: 'B', short: 'Снимок DOM', title: 'Снимок DOM', goal: 'domSnapshot.ts и page.evaluate.',
      outline: ['что отдавать модели, а что вырезать', '<code>page.evaluate</code>: код в браузере', 'размер снимка и токены'] },
    { id: 'lesson-09', module: 'B', short: 'Подключаем Claude', title: 'Подключаем Claude', goal: 'Tool use, retry, self-healing.',
      outline: ['Claude API и tool use', 'retry с backoff', 'self-healing: переспросить модель, если локатор сломался'] },
    { id: 'lesson-10', module: 'C', short: 'Сквозной сценарий', title: 'Inventory, Cart, Checkout', goal: 'Сквозной сценарий — самостоятельно.' },
    { id: 'lesson-11', module: 'C', short: 'ESLint + Prettier', title: 'ESLint и Prettier', goal: 'Линтер и форматирование.' },
    { id: 'lesson-12', module: 'C', short: 'CI', title: 'CI на GitHub Actions', goal: 'Тесты на каждый push.' },
    { id: 'lesson-13', module: 'C', short: 'Ревью эталона', title: 'Бонус: ревью эталона', goal: 'Гонка записи в кэш, неиспользуемые strategy и paths.' },
  ],
  define(id, data) {
    const l = this.lessons.find(x => x.id === id);
    if (l) Object.assign(l, data);
  },
};
