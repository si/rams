#!/usr/bin/env node
// Match cover art: diagonal split in each club's spot colour, crests in white
// circles, score in the middle, club names underneath in a collegiate font.
//
// Usage: node tools/cover_image.js <out.jpg|png> "<Home team>" "<Away team>" "<score>"
//          [--home-colour "#hex"] [--away-colour "#hex"]
// e.g.   node tools/cover_image.js hero.jpg "Southampton" "Derby County" "2 - 0"
//
// Crests: tools/crests/<team-slug>.svg if present, else <team-slug>.png.
// Colours: tools/club_colours.json, overridable with the flags above.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const dataUri = f => {
  const mime = f.endsWith('.svg') ? 'image/svg+xml' : f.endsWith('.woff2') ? 'font/woff2' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;
};
const crest = team => {
  for (const ext of ['svg', 'png']) {
    const f = path.join(DIR, 'crests', `${slug(team)}.${ext}`);
    if (fs.existsSync(f)) return dataUri(f);
  }
  throw new Error(`No crest for ${team} in tools/crests/`);
};

const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i < 0 ? null : args.splice(i, 2)[1]; };
const homeColour = flag('--home-colour'), awayColour = flag('--away-colour');
const [out, home, away, score] = args;
if (!score) { console.error('Usage: node tools/cover_image.js out.jpg "Home" "Away" "2 - 0"'); process.exit(1); }

const colours = JSON.parse(fs.readFileSync(path.join(DIR, 'club_colours.json')));
const colour = (team, override) => {
  const c = override || colours[team];
  if (!c) throw new Error(`No colour for ${team}: add it to tools/club_colours.json or pass a flag`);
  return c;
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const side = (team, x) => `
  <div class="badge" style="left:${x - 128}px"><img src="${crest(team)}"></div>
  <div class="name" style="left:${x - 360}px">${esc(team)}</div>`;

const html = `<!doctype html><html><head><style>
@font-face { font-family: Graduate; src: url(${dataUri(path.join(DIR, 'fonts', 'graduate.woff2'))}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1920px; height: 1080px; position: relative; overflow: hidden;
       background: ${colour(away, awayColour)}; font-family: Graduate; color: #fff; }
.home { position: absolute; inset: 0; background: ${colour(home, homeColour)};
        clip-path: polygon(0 0, 1110px 0, 790px 1080px, 0 1080px); }
.badge { position: absolute; top: 257px; width: 256px; height: 256px; border-radius: 50%;
         background: #fff; display: flex; align-items: center; justify-content: center; }
.badge img { width: 72%; height: 72%; object-fit: contain; }
.score { position: absolute; left: 660px; width: 600px; top: 385px; transform: translateY(-50%);
         text-align: center; font-size: 150px; letter-spacing: 6px;
         -webkit-text-stroke: 10px #000; paint-order: stroke fill; }
.name { position: absolute; width: 720px; top: 700px; transform: translateY(-50%);
        text-align: center; font-size: 128px; line-height: 132px; text-transform: uppercase;
        -webkit-text-stroke: 8px #000; paint-order: stroke fill; }
</style></head><body>
<div class="home"></div>
${side(home, 533)}${side(away, 1385)}
<div class="score">${esc(score)}</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  // Shrink any name that still overflows its 720px column
  await page.evaluate(() => document.querySelectorAll('.name').forEach(el => {
    let s = 128;
    while ((el.scrollWidth > el.clientWidth || el.offsetHeight > 280) && s > 60) {
      s -= 4; el.style.fontSize = s + 'px'; el.style.lineHeight = (s + 4) + 'px';
    }
  }));
  const type = out.endsWith('.png') ? 'png' : 'jpeg';
  await page.screenshot({ path: out, type, ...(type === 'jpeg' ? { quality: 92 } : {}) });
  await browser.close();
  console.log(`${out}: ${home} ${score} ${away}`);
})();
