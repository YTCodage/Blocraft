// Parcours réel à la souris : E → onglet Établi → clic dans le sac → clic dans la grille → résultat.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('blocraft.html');
const errs = [];

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await page.click('.worldBtn[data-world="flat"]');
  await page.click('#btnPlay'); await page.click('#ngStart');
  await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await page.waitForTimeout(1500);

  // un établi posé à côté + des planches dans le sac
  await page.evaluate(() => {
    Game.manager.setBlock(Math.floor(Player.pos[0]) + 2, FLAT_Y + 1, Math.floor(Player.pos[2]), B.CRAFTING, true);
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(B.PLANKS, 20);
    Game.inv.add(I.STICK, 10);
    HUD.refreshAll();
  });

  // E ouvre l'inventaire
  await page.keyboard.press('KeyE');
  await page.waitForFunction(() => Game.state === 'inventory', null, { timeout: 20000 });
  await page.click('.mcTab[data-tab="craft"]');
  await page.waitForTimeout(900);

  const start = await page.evaluate(() => ({
    n: CraftGrid.n,
    grid: [...document.querySelectorAll('#craftGrid .cbSlot')].length,
    cells: CraftGrid.slots.filter(Boolean).length,
    sticks: Game.inv.count(I.STICK),
    planks: Game.inv.count(B.PLANKS),
  }));

  // clic dans le sac : on prend la pile de planches
  const bagSlot = await page.evaluate(() => {
    /* l'inventaire range les cases 9..35 dans #invMain, puis 0..8 dans #invHotbar */
    const idx = Game.inv.slots.findIndex(s => s && s.id === B.PLANKS);
    const sel = idx >= 9 ? '#craftBag .islot' : '#craftHotbar .islot';
    const n = idx >= 9 ? idx - 9 : idx;
    const el = document.querySelectorAll(sel)[n];
    if (!el) return { has: false, idx, total: document.querySelectorAll(sel).length };
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), has: true, idx };
  });
  await page.mouse.click(bagSlot.x, bagSlot.y);
  await page.waitForTimeout(350);
  const afterBag = await page.evaluate(() => ({
    cursor: cursorStack ? [cursorStack.id, cursorStack.n] : null,
    sticksBag: Game.inv.count(I.STICK),
  }));

  // on pose 2 planches dans la grille (2 clics)
  const cellPos = await page.evaluate(() => [...document.querySelectorAll('#craftGrid .cbSlot')].slice(0, 6).map(e => {
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }));
  await page.mouse.click(cellPos[0].x, cellPos[0].y);
  await page.mouse.click(cellPos[3].x, cellPos[3].y);
  await page.waitForTimeout(400);
  const afterPlace = await page.evaluate(() => ({
    cells: CraftGrid.slots.map(s => s ? s.id + 'x' + s.n : 0),
    result: CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null,
    cursor: cursorStack ? [cursorStack.id, cursorStack.n] : null,
  }));

  // clic sur le résultat → bâtons
  const outPos = await page.evaluate(() => {
    const r = document.getElementById('craftOut').getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  await page.mouse.click(outPos.x, outPos.y);
  await page.waitForTimeout(500);
  const afterCraft = await page.evaluate(() => ({
    sticks: Game.inv.count(I.STICK),
    cells: CraftGrid.slots.filter(Boolean).length,
    result: CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null,
  }));

  // on pose une pioche complète via « Remplir », clic droit sur le résultat = tout fabriquer
  await page.evaluate(() => { CraftGrid.dump(); });
  const fill = await page.evaluate(() => {
    const rec = Crafting.recipes.find(r => r.out[0] === I.WPICK);
    CraftGrid.placeRecipe(rec);
    buildCraftBoard();
    return CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null;
  });
  await page.waitForTimeout(400);
  await page.mouse.click(outPos.x, outPos.y, { button: 'right' });
  await page.waitForTimeout(500);
  const afterRight = await page.evaluate(() => ({ picks: Game.inv.count(I.WPICK) }));

  // Échap rend le contenu de la grille
  await page.evaluate(() => { CraftGrid.slots[0] = { id: B.PLANKS, n: 1 }; buildCraftBoard(); });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const afterClose = await page.evaluate(() => ({
    state: Game.state,
    cells: CraftGrid.slots.filter(Boolean).length,
    planks: Game.inv.count(B.PLANKS),
  }));

  console.log(JSON.stringify({ start, afterBag, afterPlace, afterCraft, fill, afterRight, afterClose, errors: errs.slice(0, 5) }, null, 1));
  await browser.close();
})();
