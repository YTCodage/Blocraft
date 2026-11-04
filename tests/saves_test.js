// Vérifie : nom de partie, liste des sauvegardes, bascule créatif/survie,
// bouton « Faire des planches » et villages habités avec des lits.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve('blocraft.html');
const SHOTS = process.env.SHOTS || '/tmp/t/shots';
fs.mkdirSync(SHOTS, { recursive: true });
const out = {};
const errs = [];

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(120000);
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });

  // ---------- 1. le dialogue de nom s'ouvre ----------
  await page.click('#btnPlay');
  await page.waitForTimeout(500);
  out.dialog = await page.evaluate(() => ({
    shown: !document.getElementById('newgame').classList.contains('hidden'),
    name: document.getElementById('ngName').value,
    world: document.getElementById('ngWorld').textContent,
    mode: document.getElementById('ngMode').textContent,
    menuHidden: document.getElementById('menu').classList.contains('hidden'),
  }));
  await page.screenshot({ path: `${SHOTS}/menu_newgame.png` });

  // ---------- 2. on choisit un nom et on joue ----------
  await page.fill('#ngName', 'Ma survie');
  await page.click('#ngStart');
  await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await page.waitForTimeout(1500);
  out.started = await page.evaluate(() => ({
    name: Saves.currentName,
    count: Saves.list.length,
    stored: JSON.parse(localStorage.getItem('blocraft.saves.v2') || '[]').map(s => s.name),
    hasData: !!(Saves.current() && Saves.current().data),
  }));

  // ---------- 3. bascule créatif <-> survie ----------
  out.mode = await page.evaluate(() => {
    const before = { mode: Game.mode, flying: Player.flying, badge: document.getElementById('modeBadge').textContent };
    setGameMode('creative');
    const creative = { mode: Game.mode, stats: getComputedStyle(document.getElementById('statsCanvas')).display,
      xp: document.getElementById('xpWrap').classList.contains('hidden'), badge: document.getElementById('modeBadge').textContent };
    Player.flying = true;
    setGameMode('survival');
    const survival = { mode: Game.mode, flying: Player.flying, stats: getComputedStyle(document.getElementById('statsCanvas')).display,
      xp: document.getElementById('xpWrap').classList.contains('hidden'), badge: document.getElementById('modeBadge').textContent };
    return { before, creative, survival };
  });

  // ouvrir la pause : le bouton doit proposer le bon mode
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  out.pause = await page.evaluate(() => ({
    state: Game.state,
    label: document.getElementById('btnModeLbl').textContent,
    ppDim: document.getElementById('ppDim').textContent,
  }));
  // clic sur « Passer en créatif »
  await page.click('#btnMode');
  await page.waitForTimeout(400);
  out.pauseClick = await page.evaluate(() => ({ mode: Game.mode, label: document.getElementById('btnModeLbl').textContent }));
  await page.screenshot({ path: `${SHOTS}/pause_mode.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // ---------- 4. bouton « Faire des planches » ----------
  await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.LOG, 5);
    openInventory('craft');
  });
  await page.waitForTimeout(700);
  await page.click('#craftPlanksBtn');
  await page.waitForTimeout(600);
  out.planks = await page.evaluate(() => ({
    logs: Game.inv.count(B.LOG),
    planks: Game.inv.count(B.PLANKS),
    cells: CraftGrid.slots.filter(Boolean).length,
  }));
  await page.screenshot({ path: `${SHOTS}/craft_planks.png` });
  await page.evaluate(() => closeInventory());

  // ---------- 5. village habité + lits ----------
  out.village = await page.evaluate(() => {
    const d = Structures.descsNear('overworld', Player.pos[0], Player.pos[2], 900).filter(x => x.type === 'village')[0];
    if (!d) return { none: true };
    Player.pos = [d.x + 0.5, Game.manager.heightAt(d.x, d.z) + 1.2, d.z + 0.5];
    Player.vel = [0, 0, 0];
    for (let i = 0; i < 12; i++) streamChunks(120, 120);
    VillageLife.t = 0;
    VillageLife.checked.clear();
    return { x: d.x, z: d.z };
  });
  await page.waitForTimeout(6000);
  out.villagePop = await page.evaluate(() => {
    const v = Mobs.list.filter(m => m.type === 'villager').length;
    const g = Mobs.list.filter(m => m.type === 'iron_golem').length;
    return { villagers: v, golems: g };
  });
  await page.waitForTimeout(4000);
  out.villagePop2 = await page.evaluate(() => ({
    villagers: Mobs.list.filter(m => m.type === 'villager').length,
    golems: Mobs.list.filter(m => m.type === 'iron_golem').length,
  }));
  out.beds = await page.evaluate(() => {
    const d = Structures.descsNear('overworld', Player.pos[0], Player.pos[2], 400).filter(x => x.type === 'village')[0];
    if (!d) return { none: true };
    const e = Structures.getBuilt(d);
    let beds = 0;
    for (const arr of e.buckets.values()) for (const b of arr) if (b[3] === B.BED) beds++;
    return { beds, chunks: e.buckets.size };
  });
  await page.screenshot({ path: `${SHOTS}/village_beds.png` });

  // ---------- 6. sauvegarde + liste des parties ----------
  out.saved = await page.evaluate(() => {
    const ok = saveGame();
    return { ok, name: Saves.currentName, entries: Saves.list.map(s => ({ name: s.name, world: s.world, mode: s.mode, hasData: !!s.data })) };
  });
  // retour au menu via « Nouveau monde » impossible ici : on recharge la page
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  out.afterReload = await page.evaluate(() => ({
    count: Saves.list.length,
    names: Saves.list.map(s => s.name),
    continueShown: !document.getElementById('btnContinue').classList.contains('hidden'),
    continueLabel: document.getElementById('btnContinue').textContent,
  }));
  await page.click('#btnContinue');
  await page.waitForTimeout(600);
  out.savesPanel = await page.evaluate(() => ({
    shown: !document.getElementById('saves').classList.contains('hidden'),
    rows: document.querySelectorAll('#svList .svRow').length,
    first: document.querySelector('#svList .svName') ? document.querySelector('#svList .svName').textContent : null,
    meta: document.querySelector('#svList .svMeta') ? document.querySelector('#svList .svMeta').textContent : null,
  }));
  await page.screenshot({ path: `${SHOTS}/menu_saves.png` });

  // reprise réelle
  await page.click('#svList .svRow .svBtn');
  await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await page.waitForTimeout(1200);
  out.resumed = await page.evaluate(() => ({
    state: Game.state, name: Saves.currentName, mode: Game.mode,
    planks: Game.inv.count(B.PLANKS),
  }));

  out.errors = errs.slice(0, 8);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
