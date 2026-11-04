// Régression rapide après les ajouts (sons, durées de vie, drops, créatif, œil, vision)
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('blocraft.html');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.setDefaultTimeout(180000);
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)); });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  const out = {};
  out.base = await p.evaluate(() => ({
    blocks: BLOCKS.filter(x => x && x.name).length,
    recipes: Crafting.recipes.length,
    keyVision: Keys.primary('vision'),
    order: Keys.ORDER.length,
    durs: [I.SPICK, I.DIAMOND_PICK, I.IRON_SWORD, I.WOOD_PICK].map(i => itemMaxDur(i)),
  }));

  // inventaire + établi
  await p.evaluate(() => { Game.inv.add(B.PLANKS, 8); openInventory('craft'); });
  await p.waitForTimeout(700);
  out.craft = await p.evaluate(() => {
    const before = CraftGrid.n;
    const r = Crafting.recipes.find(x => itemName(x.out[0]) === 'Bâton');
    const ok = CraftGrid.placeRecipe(r);
    buildCraftBoard();
    return { n: before, ok, cells: CraftGrid.slots.filter(Boolean).length, res: CraftGrid.result && itemName(CraftGrid.result.r.out[0]) };
  });
  await p.evaluate(() => closeInventory());
  await p.waitForTimeout(400);

  // armure qui s'use
  out.armor = await p.evaluate(() => {
    Game.inv.add(I.IRON_HELM, 1);
    Armor.slots.head = I.IRON_HELM;
    Armor.dmg.head = 0;
    const max = itemMaxDur(I.IRON_HELM);
    Survival.invuln = 0;
    Survival.hurt(3, 'test');
    const d1 = Armor.dmg.head;
    Armor.dmg.head = max - 1;
    Survival.invuln = 0;
    Survival.hurt(3, 'test');
    return { max, after: d1, broken: Armor.slots.head, score: Armor.points() };
  });

  // sauvegarde / reprise : l'usure doit survivre
  out.save = await p.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.slots[0] = { id: I.IRON_PICK, n: 1, d: 120 };
    saveGame();
    const raw = JSON.parse(localStorage.getItem('blocraft.saves.v2'))[0].data.inv[0];
    return { name: Saves.currentName, slot: raw };
  });

  // pas d'erreur de son en jeu réel (casse + pose)
  out.sfx = await p.evaluate(() => {
    try {
      Sfx.init();
      for (const t of [B.GRASS, B.STONE, B.LOG, B.LEAVES, B.PLANKS, B.SAND, B.GLASS]) { Sfx.blockBreak(t); Sfx.blockPlace(t); }
      Sfx.explosion(1, 1);
      return 'ok';
    } catch (e) { return String(e); }
  });

  out.errors = errs.slice(0, 6);
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
