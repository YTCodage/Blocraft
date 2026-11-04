const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.setDefaultTimeout(180000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1000);
  await p.evaluate(() => { Game.inv.add(B.PLANKS, 8); openInventory('craft'); });
  await p.waitForTimeout(700);
  const before = await p.evaluate(() => {
    CraftGrid.slots[4] = { id: B.PLANKS, n: 1 };
    CraftGrid.slots[0] = { id: B.PLANKS, n: 1 };
    buildCraftBoard();
    return { cells: CraftGrid.slots.filter(Boolean).length, planks: Game.inv.count(B.PLANKS) };
  });
  await p.click('#craftClearBtn');
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({ cells: CraftGrid.slots.filter(Boolean).length, planks: Game.inv.count(B.PLANKS) }));
  const btnColor = await p.evaluate(() => getComputedStyle(document.getElementById('craftClearBtn')).backgroundColor);
  await p.screenshot({ path: '/tmp/t/shots/table33_bar.png' });
  console.log(JSON.stringify({ before, after, btnColor, errs }));
  await b.close();
})();
