// Vérifie la table de craft 3×3 : formes, grille 2×2 sans établi, fabrication réelle.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve('blocraft.html');
const SHOTS = process.env.SHOTS || '/tmp/t/shots';
fs.mkdirSync(SHOTS, { recursive: true });
const errs = [];
const out = {};

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 720 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await page.click('.worldBtn[data-world="flat"]');
  await page.click('.modeBtn[data-mode="creative"]');
  await page.click('#btnPlay'); await page.click('#ngStart');
  await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await page.waitForTimeout(1200);

  // ---------- 1. cohérence des formes ----------
  out.shapes = await page.evaluate(() => {
    const bad = [], noShape = [];
    for (const r of Crafting.recipes) {
      if (!r.shape) { noShape.push(itemName(r.out[0])); continue; }
      const counts = new Map();
      for (const row of r.shape.rows) for (const ch of row) {
        if (ch === ' ' || ch === '.') continue;
        const id = r.shape.keys[ch];
        counts.set(id, (counts.get(id) || 0) + 1);
      }
      const want = new Map(r.in.map(([id, n]) => [id, n]));
      const diff = counts.size !== want.size ||
        [...counts].some(([k, v]) => want.get(k) !== v) ||
        new Set(r.shape.rows.map(x => x.length)).size > 1;
      if (diff) bad.push(itemName(r.out[0]));
    }
    /* recettes sans forme qui partagent les mêmes ingrédients : ambiguïté */
    const sig = ins => ins.map(([id, n]) => id + 'x' + n).sort().join(',');
    const g = new Map();
    for (const r of Crafting.recipes) {
      if (r.shape) continue;
      const k = sig(r.in);
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(itemName(r.out[0]));
    }
    const amb = [...g.values()].filter(v => v.length > 1).map(v => v.join(' / '));
    return { total: Crafting.recipes.length, withShape: Crafting.recipes.filter(r => r.shape).length,
      bad, amb, noShape: noShape.length, needTable: Crafting.recipes.filter(r => r.table).length };
  });

  // ---------- 2. sans établi : grille 2×2, on fabrique l'établi ----------
  await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.PLANKS, 12);
    Game.inv.add(B.LOG, 1);
    openInventory('craft');
  });
  await page.waitForTimeout(600);
  out.noTable = await page.evaluate(() => {
    const rec = Crafting.recipes.find(r => r.out[0] === B.CRAFTING);
    const placed = CraftGrid.placeRecipe(rec);
    const res = CraftGrid.result;
    return { n: CraftGrid.n, cells: CraftGrid.slots.filter(Boolean).length, placed,
      result: res ? itemName(res.r.out[0]) : null, locked: res ? res.locked : null };
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/craft_2x2.png` });

  const made = await page.evaluate(() => {
    const before = Game.inv.count(B.CRAFTING);
    const n = CraftGrid.craft(1);
    return { n, before, after: Game.inv.count(B.CRAFTING), planks: Game.inv.count(B.PLANKS),
      cellsLeft: CraftGrid.slots.filter(Boolean).length };
  });
  out.craftTable = made;

  // ---------- 3. on pose l'établi : la grille passe en 3×3 ----------
  out.withTable = await page.evaluate(() => {
    const px = Math.floor(Player.pos[0]) + 2, py = FLAT_Y + 1, pz = Math.floor(Player.pos[2]);
    Game.manager.setBlock(px, py, pz, B.CRAFTING, true);
    Crafting.scanTable();
    buildCraftBoard();
    return { n: CraftGrid.n, near: Crafting.nearTable, chip: document.getElementById('craftTableState').textContent };
  });

  // ---------- 4. pioche en bois : la forme compte ----------
  out.pick = await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.PLANKS, 20); Game.inv.add(I.STICK, 8);
    const rec = Crafting.recipes.find(r => r.out[0] === I.WPICK);
    CraftGrid.placeRecipe(rec);
    const res = CraftGrid.result;
    const shapeCells = CraftGrid.slots.map(s => s ? s.id : 0);
    const got = CraftGrid.craft(1);
    return { shapeCells, result: res ? itemName(res.r.out[0]) : null, got,
      picks: Game.inv.count(I.WPICK), planks: Game.inv.count(B.PLANKS), sticks: Game.inv.count(I.STICK) };
  });

  // ---------- 5. mauvaise disposition = pas de pioche ----------
  out.wrong = await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.PLANKS, 8); Game.inv.add(I.STICK, 8);
    CraftGrid.slots = new Array(9).fill(null);
    // 3 planches en haut + 2 bâtons ailleurs mais pas en forme de pioche
    CraftGrid.slots[0] = { id: B.PLANKS, n: 1 };
    CraftGrid.slots[1] = { id: B.PLANKS, n: 1 };
    CraftGrid.slots[2] = { id: B.PLANKS, n: 1 };
    CraftGrid.slots[6] = { id: I.STICK, n: 1 };
    CraftGrid.slots[8] = { id: I.STICK, n: 1 };
    const res = CraftGrid.find();
    return { result: res ? itemName(res.r.out[0]) : null };
  });

  // ---------- 6. axe en pierre (même ingrédients que la pioche !) ----------
  out.axe = await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.COBBLE, 12); Game.inv.add(I.STICK, 8);
    const rec = Crafting.recipes.find(r => r.out[0] === I.SAXE);
    CraftGrid.placeRecipe(rec);
    const res = CraftGrid.result;
    const got = CraftGrid.craft(1);
    return { result: res ? itemName(res.r.out[0]) : null, got, axes: Game.inv.count(I.SAXE), picks: Game.inv.count(I.SPICK) };
  });

  // ---------- 6 bis. deux recettes aux mêmes ingrédients : le guide décide ----------
  out.ambiguous = await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.STONEBRICK, 16); Game.inv.add(I.COAL, 4);
    const smooth = Crafting.recipes.find(r => r.out[0] === B.SMOOTH_STONE);
    const cracked = Crafting.recipes.find(r => r.out[0] === B.CRACKED);
    CraftGrid.placeRecipe(cracked);
    const a = CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null;
    CraftGrid.placeRecipe(smooth);
    const b = CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null;
    return { cracked: a, smooth: b };
  });

  // ---------- 7. lit et porte ----------
  out.furniture = await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.WOOL_WHITE, 6); Game.inv.add(B.PLANKS, 12); Game.inv.add(I.COAL, 4); Game.inv.add(I.STICK, 4);
    const bed = Crafting.recipes.find(r => r.out[0] === B.BED);
    CraftGrid.placeRecipe(bed);
    const bedRes = CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null;
    const bedMade = CraftGrid.craft(1);
    const door = Crafting.recipes.find(r => r.out[0] === B.DOOR_CLOSED);
    CraftGrid.placeRecipe(door);
    const doorRes = CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null;
    const doorMade = CraftGrid.craft(1);
    return { bedRes, bedMade, beds: Game.inv.count(B.BED), doorRes, doorMade, doors: Game.inv.count(B.DOOR_CLOSED) };
  });

  // ---------- 8. « tout fabriquer » ----------
  out.all = await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.LOG, 8);
    const rec = Crafting.recipes.find(r => r.out[0] === B.PLANKS);
    CraftGrid.placeRecipe(rec);
    const n = CraftGrid.craft('all');
    return { n, planks: Game.inv.count(B.PLANKS), logs: Game.inv.count(B.LOG) };
  });

  // capture avec une grille pleine
  await page.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(I.DIAMONDGEM, 9); Game.inv.add(I.STICK, 6); Game.inv.add(B.PLANKS, 12); Game.inv.add(B.WOOL_WHITE, 3);
    const rec = Crafting.recipes.find(r => r.out[0] === I.DIAMOND_PICK);
    CraftGrid.placeRecipe(rec);
    buildCraftBoard();
    buildInventoryUI();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${SHOTS}/craft_3x3.png` });

  // ---------- 9. fermeture : la grille se vide dans le sac ----------
  out.closeDump = await page.evaluate(() => {
    const before = Game.inv.count(I.DIAMONDGEM) + Game.inv.count(I.STICK);
    closeInventory();
    const after = Game.inv.count(I.DIAMONDGEM) + Game.inv.count(I.STICK);
    return { before, after, cells: CraftGrid.slots.filter(Boolean).length };
  });

  out.errors = errs.slice(0, 6);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
