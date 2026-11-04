const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.evaluate(() => openInventory());
  await p.waitForTimeout(600);
  await p.screenshot({ path: '/tmp/t/shots/inv3.png' });
  const tabs = await p.evaluate(() => { const out = {}; for (const t of ['inv','craft','furnace','blocks']) { document.querySelector(`.mcTab[data-tab="${t}"]`).click(); out[t] = { title: document.querySelector('#invTitle').textContent, visible: !document.querySelector('#tab' + t.charAt(0).toUpperCase() + t.slice(1)).classList.contains('hidden') }; } return out; });
  console.log('tabs', JSON.stringify(tabs));
  await p.evaluate(() => closeInventory(true));
  await p.waitForTimeout(400);
  // QA rapide
  await p.evaluate(() => { QA.unlock(true); });
  await p.waitForTimeout(800);
  const qa = await p.evaluate(() => ({ on: QA.on, owner: Admin.owner, panel: !document.querySelector('#qa').classList.contains('hidden') }));
  await p.evaluate(() => { QA.xray = true; QA.refreshXray(); QA.close(); });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/t/shots/xray2.png' });
  console.log('qa', JSON.stringify(qa), 'state', await p.evaluate(() => Game.state));
  // test de chute réel : 4 blocs puis 8 blocs
  const falls = await p.evaluate(async () => {
    Game.mode = 'survival';
    const res = [];
    for (const h of [4, 8]) {
      Survival.health = 20; Survival.hunger = 20;
      const x = Math.floor(Player.pos[0]), z = Math.floor(Player.pos[2]);
      const y0 = Game.manager.heightAt(x, z) + h + 1;
      for (let yy = y0; yy < y0 + 6; yy++) Game.manager.setBlock(x, yy, z, B.AIR, true);
      Player.pos = [x + 0.5, y0, z + 0.5];
      Player.vel = [0, 0, 0]; Player.fallDist = 0; Player.onGround = false;
      await new Promise(r => setTimeout(r, 1600));
      res.push([h, Math.round(Survival.health * 10) / 10]);
    }
    Survival.health = 20;
    return res;
  });
  console.log('falls', JSON.stringify(falls));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
