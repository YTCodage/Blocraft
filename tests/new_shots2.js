const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 780 } });
  p.setDefaultTimeout(180000);
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  // objets au sol devant la caméra
  await p.evaluate(() => {
    const px = Player.pos[0], py = Player.pos[1], pz = Player.pos[2];
    const dir = lookDir();
    Drops.clear();
    const ids = [B.COBBLE, B.LOG, B.PLANKS, B.DIAMOND_ORE || B.STONE, B.GOLD_BLOCK, B.PUMPKIN];
    ids.forEach((id, i) => {
      const d = 2.4 + i * 0.4;
      Drops.add(id, 1, px + dir[0] * d + (i - 2.5) * 0.6, py + 1.2, pz + dir[2] * d);
    });
  });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/t/shots/drops_ground.png' });

  // barres de durée de vie dans la barre rapide
  await p.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.slots[0] = { id: I.SPICK, n: 1 };
    Game.inv.slots[1] = { id: I.SPICK, n: 1, d: 70 };
    Game.inv.slots[2] = { id: I.SPICK, n: 1, d: 120 };
    Game.inv.slots[3] = { id: I.IRON_PICK, n: 1, d: 200 };
    Game.inv.slots[4] = { id: I.DIAMOND_AXE, n: 1, d: 1400 };
    Game.inv.slots[5] = { id: B.STONE, n: 64 };
    buildHotbar();
    HUD.refreshAll();
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: '/tmp/t/shots/durability.png' });

  // vision X
  await p.evaluate(() => {
    Player.pos[1] = Player.pos[1] + 2;
    Vision.toggle(true);
  });
  await p.waitForTimeout(9000);
  await p.screenshot({ path: '/tmp/t/shots/vision_x2.png' });
  console.log('ok');
  await b.close();
})();
