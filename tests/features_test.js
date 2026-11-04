// Vérifie : sons (pas d'exception), durée de vie, objets qui tombent,
// blocs infinis en créatif, œil de l'End dirigé, Vision X.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('blocraft.html');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 780 } });
  p.setDefaultTimeout(180000);
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 200)); });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  const out = {};

  // ---------- 1. sons ----------
  out.sounds = await p.evaluate(() => {
    try {
      Sfx.init();
      const t0 = performance.now();
      Sfx.blockBreak(B.STONE); Sfx.blockBreak(B.LOG); Sfx.blockBreak(B.DIRT);
      Sfx.blockBreak(B.GLASS || B.ICE || B.LEAVES);
      Sfx.blockPlace(B.PLANKS);
      Sfx.explosion(1, 1.3);
      Sfx.toolBreak();
      return { ok: true, ms: Math.round(performance.now() - t0), mat: {
        stone: Sfx.materialOf(B.STONE), wood: Sfx.materialOf(B.LOG),
        dirt: Sfx.materialOf(B.DIRT), leaves: Sfx.materialOf(B.LEAVES),
        planks: Sfx.materialOf(B.PLANKS), iron: Sfx.materialOf(B.IRON_BLOCK) } };
    } catch (e) { return { ok: false, err: String(e) }; }
  });

  // ---------- 2. durée de vie ----------
  out.dur = await p.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(I.SPICK, 1);
    Game.slot = 0;
    const slot = Game.inv.slots[0];
    const base = { id: slot.id, d: slot.d || 0, max: itemMaxDur(slot.id) };
    // on casse 3 blocs juste devant
    const t = { x: Math.floor(Player.pos[0]) + 1, y: Math.floor(Player.pos[1]) + 3, z: Math.floor(Player.pos[2]) };
    Game.mode = 'survival';
    for (let i = 0; i < 3; i++) { Game.target = { x: t.x, y: t.y + i, z: t.z, block: B.STONE, nx: 0, ny: 0, nz: 1, dist: 1 }; finishBreak(Game.target); }
    const after = Game.inv.slots[0] ? (Game.inv.slots[0].d || 0) : -1;
    // casse forcée
    Game.inv.slots[0].d = itemMaxDur(I.SPICK) - 1;
    Game.target = { x: t.x, y: t.y + 5, z: t.z, block: B.STONE, nx: 0, ny: 0, nz: 1, dist: 1 };
    finishBreak(Game.target);
    const broke = { slot: Game.inv.slots[0], bars: document.querySelectorAll('#hotbar .durb').length };
    return { base, after, broke };
  });

  // ---------- 3. objets qui tombent au-delà de 5 blocs ----------
  out.drops = await p.evaluate(async () => {
    Game.inv.slots = new Array(36).fill(null);
    Game.slot = 0;
    Drops.clear();
    const px = Math.floor(Player.pos[0]), py = Math.floor(Player.pos[1]), pz = Math.floor(Player.pos[2]);
    // un bloc à 8 blocs : trop loin -> il tombe
    const far = { x: px + 8, y: py + 2, z: pz, nx: 0, ny: 0, nz: 1, dist: 8, block: B.DIRT };
    const placedFar = Game.manager.setBlock(far.x, far.y, far.z, B.DIRT, true);
    Game.target = far;
    finishBreak(far);
    const farState = { placed: placedFar, drops: Drops.list.length, inv: Game.inv.count(B.DIRT) };
    // un bloc juste devant : direct dans le sac
    const near = { x: px + 2, y: py + 2, z: pz, nx: 0, ny: 0, nz: 1, dist: 2, block: B.DIRT };
    Game.manager.setBlock(near.x, near.y, near.z, B.DIRT, true);
    Game.target = near;
    finishBreak(near);
    const nearState = { drops: Drops.list.length, inv: Game.inv.count(B.DIRT) };
    // le joueur va vers l'objet tombé
    const d0 = Drops.list[0];
    if (!d0) return { farState, nearState, afterPickup: null, spins: false };
    const yaw0 = d0.yaw;
    Player.pos = [d0.pos[0] + 0.6, d0.pos[1] + 0.2, d0.pos[2] + 0.6];
    Player.vel = [0, 0, 0];
    for (let i = 0; i < 120; i++) { Drops.update(1 / 60); await new Promise(r => setTimeout(r, 8)); }
    return { farState, nearState, afterPickup: { drops: Drops.list.length, inv: Game.inv.count(B.DIRT) }, spins: d0.yaw !== yaw0 };
  });

  // ---------- 4. créatif : blocs infinis ----------
  out.creative = await p.evaluate(async () => {
    setGameMode('creative');
    Game.slot = 2;
    openInventory('blocks');
    await new Promise(r => setTimeout(r, 400));
    const first = document.querySelector('#invGrid .invItem');
    first.click();
    const slot = Game.inv.slots[2];
    const cnt = document.querySelectorAll('#hotbar .slot')[2].querySelector('.cnt');
    // on choisit un autre bloc : la case est remplacée automatiquement
    const items = document.querySelectorAll('#invGrid .invItem');
    items[5].click();
    const slot2 = Game.inv.slots[2];
    const before = slot2.n;
    closeInventory();
    // pose : ne consomme rien
    Game.target = { x: Math.floor(Player.pos[0]) + 2, y: Math.floor(Player.pos[1]), z: Math.floor(Player.pos[2]), nx: 0, ny: 0, nz: 1, block: B.STONE, dist: 2 };
    return { first: slot && { id: slot.id, inf: !!slot.inf, n: slot.n }, shown: cnt ? cnt.textContent : null,
      replaced: slot2 && { id: slot2.id, inf: !!slot2.inf, sameAsFirst: slot && slot.id === slot2.id }, before };
  });

  // ---------- 5. œil de l'End ----------
  out.eye = await p.evaluate(async () => {
    setGameMode('survival');
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(I.ENDER_EYE, 3);
    Game.slot = 0;
    const target = EnderEye.portalTarget();
    const ok = EnderEye.throwEye();
    const live = EnderEye.live && { vel: EnderEye.live.vel.map(v => Math.round(v)), life: EnderEye.live.life };
    for (let i = 0; i < 60 && EnderEye.live; i++) EnderEye.update(0.05);
    await new Promise(r => setTimeout(r, 300));
    return { target: target && { x: Math.round(target.x), z: Math.round(target.z), dist: Math.round(target.dist) }, ok, live,
      after: { live: !!EnderEye.live, eyes: Game.inv.count(I.ENDER_EYE) } };
  });

  // ---------- 6. Vision X ----------
  out.vision = await p.evaluate(async () => {
    Vision.toggle(true);
    await new Promise(r => setTimeout(r, 1500));
    const b = document.getElementById('visBanner');
    return { on: Vision.on, banner: !b.classList.contains('hidden'), text: document.getElementById('visText').textContent,
      sites: Vision.sites.length, first: Vision.sites[0] && Math.round(Vision.sites[0].dist),
      blocks: [...Vision.blocks()].length };
  });
  await p.keyboard.press('x');
  await p.waitForTimeout(800);
  out.visionKey = await p.evaluate(() => ({ on: Vision.on }));
  await p.screenshot({ path: '/tmp/t/shots/vision_x.png' });

  out.errors = errs.slice(0, 8);
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
