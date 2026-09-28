// Сборка для обычного хостинга (Cloudflare Pages и т.п.): кладёт сайт в dist/
// и оборачивает index.html в полный HTML-документ. На claude.ai эту обёртку
// добавляет сама платформа, поэтому исходный index.html остаётся без неё.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const out = 'dist';
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const dir of ['assets', 'lessons']) cpSync(dir, `${out}/${dir}`, { recursive: true });

const body = readFileSync('index.html', 'utf8');
const title = (body.match(/<title>[\s\S]*?<\/title>/) || ['<title>AI-локатор на Playwright</title>'])[0];
const rest = body.replace(title, '').trim();
const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Практический курс: собираем AI-локатор для Playwright с Claude, урок за уроком, с автопроверкой заданий.">
${title}
</head>
<body>
${rest}
</body>
</html>
`;
writeFileSync(`${out}/index.html`, html);
console.log('dist/ готов');
