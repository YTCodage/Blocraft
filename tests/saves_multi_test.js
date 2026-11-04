const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  p.setDefaultTimeout(180000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.evaluate(() => { localStorage.clear(); Saves.load(); Saves.list = []; Saves.currentId = null; updateContinueButton(); });

  // partie A
  await p.click('#btnPlay'); await p.fill('#ngName', 'Alpha'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);
  const a = await p.evaluate(() => { Player.pos = [120.5, 70, -80.5]; Game.inv.add(B.DIAMOND, 7); saveGame(); return { name: Saves.currentName, pos: Player.pos.map(Math.round) }; });

  // pause -> Nouveau monde -> partie B (neuve)
  await p.evaluate(() => openPause());
  await p.waitForTimeout(500);
  await p.click('#btnNew2');
  await p.waitForTimeout(500);
  await p.fill('#ngName', 'Bravo'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);
  const bb = await p.evaluate(() => { Player.pos = [-300.5, 72, 210.5]; Game.inv.add(B.GOLD_INGOT, 3); saveGame(); return { name: Saves.currentName, pos: Player.pos.map(Math.round) }; });

  await p.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnContinue');
  await p.waitForTimeout(600);
  const rows = await p.evaluate(() => [...document.querySelectorAll('#svList .svRow')].map(r => r.querySelector('.svName').textContent));
  // clique la ligne « Alpha »
  await p.evaluate(() => {
    const r = [...document.querySelectorAll('#svList .svRow')].find(x => x.querySelector('.svName').textContent === 'Alpha');
    r.querySelector('.svBtn').click();
  });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  const back = await p.evaluate(() => ({ name: Saves.currentName, pos: Player.pos.map(Math.round), diam: Game.inv.count(B.DIAMOND), gold: Game.inv.count(B.GOLD_INGOT) }));
  console.log(JSON.stringify({ a, bb, rows, back, errs }));
  await b.close();
})();
