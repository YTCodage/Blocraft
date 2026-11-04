const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const out = {};
  const run = async (name, vp, mobile) => {
    const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const p = await ctx.newPage();
    p.setDefaultTimeout(180000);
    await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
    if (mobile) { await p.tap('#btnPlay'); await p.waitForTimeout(400); await p.tap('#ngStart'); }
    else { await p.click('#btnPlay'); await p.click('#ngStart'); }
    await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await p.waitForTimeout(1000);
    await p.evaluate(() => { Game.inv.add(B.PLANKS, 9); Game.inv.add(B.LOG, 3); openInventory('craft'); });
    await p.waitForTimeout(1000);
    out[name] = await p.evaluate(() => {
      const g = document.getElementById('craftGrid');
      const r = g.getBoundingClientRect();
      const cols = getComputedStyle(g).gridTemplateColumns.split(' ').length;
      const cells = g.children.length;
      const board = document.querySelector('.cbBoard').getBoundingClientRect();
      return { cols, cells, gridW: Math.round(r.width), gridH: Math.round(r.height), cs: getComputedStyle(g).getPropertyValue('--cs'),
        overflow: board.bottom > innerHeight + 1 || board.right > innerWidth + 1,
        hint: document.getElementById('craftHint').textContent, chip: document.getElementById('craftTableState').textContent };
    });
    await p.screenshot({ path: `/tmp/t/shots/table33_${name}.png` });
    await ctx.close();
  };
  await run('desk', { width: 1280, height: 800 }, false);
  await run('land', { width: 844, height: 390 }, true);
  await run('port', { width: 390, height: 844 }, true);
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
