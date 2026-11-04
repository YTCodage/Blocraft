// Vérifie : riposte des golems, châteaux/donjons du mono-bloc, portes et lit.
const { chromium } = require('playwright');
const path = require('path');

const URL = 'file://' + path.resolve('blocraft.html');
const errs = [];
const out = {};

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 640 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });

  // ---------- monde plat en créatif ----------
  await page.click('.worldBtn[data-world="flat"]');
  await page.click('.modeBtn[data-mode="creative"]');
  await page.click('#btnPlay'); await page.click('#ngStart');
  await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await page.waitForTimeout(1500);

  out.blocks = await page.evaluate(() => ({
    door: B.DOOR_CLOSED, doorOpen: B.DOOR_OPEN, bed: B.BED,
    names: [BLOCKS[B.DOOR_CLOSED].name, BLOCKS[B.DOOR_OPEN].name, BLOCKS[B.BED].name],
    texOk: [B.DOOR_CLOSED, B.DOOR_OPEN, B.BED].every(id => BLOCKS[id].tex && BLOCKS[id].tex.every(t => typeof t === 'number')),
  }));

  // ---------- pose d'une porte (2 blocs) + ouverture ----------
  out.door = await page.evaluate(() => {
    const px = Math.floor(Player.pos[0]) + 4, pz = Math.floor(Player.pos[2]);
    const y = FLAT_Y;
    Game.inv.slots[Game.slot] = { id: B.DOOR_CLOSED, n: 64 };
    Game.target = { x: px, y, z: pz, nx: 0, ny: 1, nz: 0, block: B.STONE, dist: 1 };
    placeBlock();
    const lo = Game.manager.getBlock(px, y + 1, pz), up = Game.manager.getBlock(px, y + 2, pz);
    Doors.toggle({ x: px, y: y + 1, z: pz });
    const lo2 = Game.manager.getBlock(px, y + 1, pz), up2 = Game.manager.getBlock(px, y + 2, pz);
    Doors.toggle({ x: px, y: y + 2, z: pz });   // referme depuis la moitié haute
    const lo3 = Game.manager.getBlock(px, y + 1, pz);
    return {
      placed: [lo === B.DOOR_CLOSED, up === B.DOOR_CLOSED],
      opened: [lo2 === B.DOOR_OPEN, up2 === B.DOOR_OPEN],
      closedAgain: lo3 === B.DOOR_CLOSED,
      solidOpen: BLOCKS[B.DOOR_OPEN].solid, solidClosed: BLOCKS[B.DOOR_CLOSED].solid,
    };
  });

  // ---------- lit : refus le jour, sommeil la nuit ----------
  out.bedDay = await page.evaluate(() => {
    const px = Math.floor(Player.pos[0]) - 4, pz = Math.floor(Player.pos[2]);
    Game.manager.setBlock(px, FLAT_Y + 1, pz, B.BED, true);
    Game.time = 0.5;
    Beds.sleep({ x: px, y: FLAT_Y + 1, z: pz });
    return { time: Game.time };
  });
  await page.waitForTimeout(700);
  out.bedDay.timeAfter = await page.evaluate(() => Game.time);

  const bedNight = await page.evaluate(() => {
    const px = Math.floor(Player.pos[0]) - 4, pz = Math.floor(Player.pos[2]);
    Game.time = 0.92;
    Beds.sleep({ x: px, y: FLAT_Y + 1, z: pz });
    return { time: Game.time, spawn: Game.spawn.slice() };
  });
  await page.waitForTimeout(1500);
  out.bedNight = Object.assign(bedNight, await page.evaluate(() => ({
    timeAfter: +Game.time.toFixed(3),
    spawnAfter: Game.spawn.slice(),
    fadeOff: !document.getElementById('fade').classList.contains('on'),
  })));

  // ---------- golems : frapper un villageois rend le golem furieux ----------
  out.golem = await page.evaluate(async () => {
    const p = Player.pos;
    Game.mode = 'survival';
    Survival.health = 20;
    const v = Mobs.add('villager', p[0] + 2.2, p[1], p[2]);
    const g = Mobs.add('iron_golem', p[0] + 3.5, p[1], p[2] + 2.2);
    const before = { angry: !!g.angry, hp: Survival.health };
    Mobs.hurt(v, 2, [0, 0, 1], true);
    const right = { angry: !!g.angry, hate: g.hate, timer: Math.round(g.angryT || 0) };
    const d0 = Math.hypot(g.pos[0] - p[0], g.pos[2] - p[2]);
    await new Promise(r => setTimeout(r, 2600));
    const d1 = Math.hypot(g.pos[0] - Player.pos[0], g.pos[2] - Player.pos[2]);
    return { before, right, d0: +d0.toFixed(2), d1: +d1.toFixed(2), hpAfter: Survival.health,
      mobTargets: Mobs.list.length, cause: 'ok' };
  });
  out.golemHits = out.golem.hpAfter < 20 || out.golem.d1 < out.golem.d0 - 0.4;

  // le golem oublie au bout de ~34 s
  out.golemCalm = await page.evaluate(() => {
    const g = Mobs.list.find(m => m.def.guardian && !m.def.snowman);
    if (!g) return null;
    g.angryT = 0.01;
    return new Promise(r => setTimeout(() => r({ angryAfter: !!g.angry }), 600));
  });

  console.log('PHASE1 ' + JSON.stringify(out));
  // ---------- mono-bloc : châteaux + donjons ----------
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await page.click('.worldBtn[data-world="oneblock"]');
  await page.click('.modeBtn[data-mode="creative"]');
  await page.click('#btnPlay'); await page.click('#ngStart');
  await page.waitForFunction(() => Game.state === 'playing' && Game.manager.dim === 'oneblock', null, { timeout: 180000 });
  await page.waitForTimeout(1200);

  out.oneblock = await page.evaluate(() => {
    const specs = OneBlock.allSpecs();
    const castles = OneBlock.castleSpecs();
    const dungeons = OneBlock.dungeonSpecs();
    const siteCount = OneBlock.sites().length;
    // un donjon et un château : on compte les blocs produits
    const dSpec = dungeons[0];
    const dcx = Math.floor(dSpec.x / 16), dcz = Math.floor(dSpec.z / 16);
    const dBlocks = OneBlock.blocksForChunk(dcx, dcz);
    const cSpec = castles[8];                 // grand anneau
    const ccx = Math.floor(cSpec.x / 16), ccz = Math.floor(cSpec.z / 16);
    const cBlocks = OneBlock.blocksForChunk(ccx, ccz);
    const types = new Set(dBlocks.map(b => b[3]));
    return {
      specs: specs.length, castles: castles.length, dungeons: dungeons.length, sites: siteCount,
      dungeonBlocks: dBlocks.length, dungeonTypes: types.size,
      dungeonHasChest: types.has(B.CHEST), dungeonTop: Math.max(...dBlocks.map(b => b[1])),
      castleBlocks: cBlocks.length,
      farChunkBlocks: OneBlock.blocksForChunk(200, 200).length,
    };
  });

  out.errors = errs.slice(0, 6);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
