const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('blocraft.html'));
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 150000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/t/shots/d_menu.png' });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2500);
  console.log('hotbar slot', await p.evaluate(() => Math.round(document.querySelector('#hotbar .slot').getBoundingClientRect().width)));
  await p.evaluate(() => { Player.pitch = 0.12; Game.time = 0.34; });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: '/tmp/t/shots/d_play.png' });
  // commerce
  await p.evaluate(() => {
    const x = Math.floor(Player.pos[0]) + 2, z = Math.floor(Player.pos[2]);
    const y = Game.manager.heightAt(x, z) + 1;
    window.__mob = Mobs.add('villager', x + 0.5, y, z + 0.5);
    Game.inv.add(I.WHEAT, 18); Game.inv.add(I.EMERALDGEM, 4);
    VillagerTrade.open(window.__mob);
  });
  await p.waitForTimeout(1000);
  await p.screenshot({ path: '/tmp/t/shots/d_trade.png' });
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
