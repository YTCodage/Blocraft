const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  for (const [name, vp, mobile] of [['desk', { width: 1280, height: 800 }, false], ['land', { width: 844, height: 390 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile });
    const p = await ctx.newPage();
    p.setDefaultTimeout(180000);
    await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
    if (mobile) { await p.tap('#btnPlay'); await p.waitForTimeout(400); await p.tap('#ngStart'); }
    else { await p.click('#btnPlay'); await p.click('#ngStart'); }
    await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await p.waitForTimeout(1200);
    await p.evaluate(() => { Game.inv.add(B.LOG, 4); openInventory('craft'); });
    await p.waitForTimeout(900);
    await p.screenshot({ path: `/tmp/t/shots/craft2_${name}.png` });
    await ctx.close();
  }
  await b.close();
})();
