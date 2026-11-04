const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('/home/user/blocraft.html');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await page.click('.worldBtn[data-world="flat"]');
  await page.click('#btnPlay');
  await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    Game.manager.setBlock(Math.floor(Player.pos[0]) + 2, FLAT_Y + 1, Math.floor(Player.pos[2]), B.CRAFTING, true);
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.PLANKS, 20);
    HUD.refreshAll();
  });
  await page.keyboard.press('KeyE');
  await page.waitForFunction(() => Game.state === 'inventory');
  await page.click('.mcTab[data-tab="craft"]');
  await page.waitForTimeout(800);
  console.log(JSON.stringify(await page.evaluate(() => {
    const el = document.querySelectorAll('#craftBag .islot')[0];
    const r = el.getBoundingClientRect();
    const mid = [Math.round(r.left + r.width/2), Math.round(r.top + r.height/2)];
    const hit = document.elementFromPoint(mid[0], mid[1]);
    const body = document.querySelector('#inventory .mcBody').getBoundingClientRect();
    return { rect: [r.left, r.top, r.width, r.height].map(Math.round), mid, hit: hit ? hit.className + '|' + (hit.tagName) : null,
      body: [body.top, body.bottom].map(Math.round), vh: innerHeight,
      scroll: document.querySelector('#inventory .mcBody').scrollTop };
  })));
  await browser.close();
})();
