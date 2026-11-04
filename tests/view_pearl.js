const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });

  // le menu ne doit plus proposer Nether / End
  const menu = await p.evaluate(() => [...document.querySelectorAll('.worldBtn')].map(b => b.dataset.world));
  console.log('menu', JSON.stringify(menu));

  // monde plat : parfait pour juger la portée
  await p.evaluate(() => document.querySelector('.worldBtn[data-world="flat"]').click());
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2500);

  // --- portée infinie
  const before = await p.evaluate(() => ({ dist: SETTINGS.dist, chunks: Game.manager.chunks.size, radius: View.radius }));
  await p.evaluate(() => { const s = document.querySelector('#setDist'); s.value = '0'; s.dispatchEvent(new Event('change')); });
  await p.waitForTimeout(9000);
  const after = await p.evaluate(() => ({
    dist: SETTINGS.dist, radio: View.radius, draw: View.draw, infinite: View.infinite,
    chunks: Game.manager.chunks.size, fps: Math.round(fpsAvg),
  }));
  console.log('portee', JSON.stringify(before), '->', JSON.stringify(after));
  await p.evaluate(() => { Player.pitch = 0.02; Player.yaw = 0.9; });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: '/tmp/t/shots/infinite1.png' });

  // retour en portée normale
  await p.evaluate(() => { const s = document.querySelector('#setDist'); s.value = '6'; s.dispatchEvent(new Event('change')); });
  await p.waitForTimeout(600);
  const back = await p.evaluate(() => ({ draw: View.draw, infinite: View.infinite }));
  console.log('retour', JSON.stringify(back));

  // --- perle de l'End : lancer, voler, se téléporter
  const pearl = await p.evaluate(async () => {
    Game.mode = 'survival';
    Survival.health = 20; Survival.dead = false; Survival.invuln = 0;
    Game.inv.slots[Game.slot] = { id: I.ENDER_PEARL, n: 4 };
    buildHotbar();
    Player.pos = [0.5, 65.05, 0.5];
    Player.yaw = Math.PI / 2; Player.pitch = -0.12;
    Player.vel = [0, 0, 0];
    const p0 = Player.pos.slice();
    const ok = EnderPearl.throwPearl();
    const mid = { live: !!EnderPearl.live, n: Game.inv.count(I.ENDER_PEARL) };
    await new Promise(r => setTimeout(r, 1400));
    return {
      threw: ok, mid,
      p0: p0.map(v => Math.round(v * 10) / 10),
      p1: Player.pos.map(v => Math.round(v * 10) / 10),
      hp: Math.round(Survival.health * 10) / 10,
      left: Game.inv.count(I.ENDER_PEARL),
      flying: !!EnderPearl.live,
    };
  });
  console.log('perle', JSON.stringify(pearl));

  // perle dans un mur (vers le bas, doit atterrir au sol devant)
  const pearl2 = await p.evaluate(async () => {
    Game.inv.slots[Game.slot] = { id: I.ENDER_PEARL, n: 2 };
    Player.pos = [0.5, 65.05, 0.5];
    Player.yaw = 0; Player.pitch = -1.4;
    EnderPearl.throwPearl();
    await new Promise(r => setTimeout(r, 1000));
    return { pos: Player.pos.map(v => Math.round(v * 10) / 10), hp: Math.round(Survival.health * 10) / 10 };
  });
  console.log('perle2', JSON.stringify(pearl2));
  await p.screenshot({ path: '/tmp/t/shots/pearl.png' });

  console.log('errors', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();
