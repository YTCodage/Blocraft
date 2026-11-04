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
    const el = document.querySelectorAll('#invHotbar .islot')[0];
    const r = el ? el.getBoundingClientRect() : null;
    const mid = r ? [Math.round(r.left + r.width/2), Math.round(r.top + r.height/2)] : null;
    const hit = mid ? document.elementFromPoint(mid[0], mid[1]) : null;
    return {
      rect: r && [r.left, r.top, r.width, r.height].map(Math.round),
      hit: hit ? hit.className + '#' + (hit.id||'') : null,
      state: Game.state,
      overlay: getComputedStyle(document.getElementById('inventory')).display,
      slotCount: document.querySelectorAll('#invHotbar .islot').length,
      cs: getComputedStyle(document.getElementById('cursorStack')).display,
      invState: document.getElementById('tabInv').className,
    };
  })));
  // clic réel
  const pos = await page.evaluate(() => {
    const r = document.querySelectorAll('#invHotbar .islot')[0].getBoundingClientRect();
    return [Math.round(r.left + r.width/2), Math.round(r.top + r.height/2)];
  });
  await page.mouse.move(pos[0], pos[1]);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(300);
  console.log('after click', JSON.stringify(await page.evaluate(() => ({ cursor: cursorStack, slots0: Game.inv.slots[0] }))));
  await browser.close();
})();
