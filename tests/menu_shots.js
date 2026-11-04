const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('blocraft.html');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  for (const [w, h, name] of [[844, 390, 'land'], [390, 844, 'port']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 150000 });
    await p.waitForTimeout(1400);
    await p.screenshot({ path: `/tmp/t/shots/menu_${name}.png` });
    console.log(name, await p.evaluate(() => {
      const sh = document.querySelector('.menu-shell');
      const play = document.getElementById('btnPlay').getBoundingClientRect();
      return { scrollH: sh.scrollHeight, clientH: sh.clientHeight, playBottom: Math.round(play.bottom), vh: innerHeight, playVisible: play.bottom <= innerHeight + 1 };
    }));
    await ctx.close();
  }
  await b.close();
})();
