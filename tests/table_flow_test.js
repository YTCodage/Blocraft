// Le parcours exact : 4 cases au départ → 4 planches → établi → posé → 9 cases.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.setDefaultTimeout(180000);
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);

  const grid = () => p.evaluate(() => {
    const g = document.getElementById('craftGrid');
    const cs = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean);
    return { cols: cs.length, cells: g.children.length, n: CraftGrid.n,
      chip: document.getElementById('craftTableState').textContent,
      hint: document.getElementById('craftHint').textContent };
  });

  // 1) sans établi : 4 planches dans le sac, grille de 4 cases
  await p.evaluate(() => { Game.inv.slots = new Array(36).fill(null); Game.inv.add(B.PLANKS, 4); openInventory('craft'); });
  await p.waitForTimeout(800);
  const etape1 = await grid();
  await p.screenshot({ path: '/tmp/t/shots/grille_4.png' });

  // 2) on fabrique l'établi à la main (4 planches en carré)
  await p.evaluate(() => {
    CraftGrid.slots = [{ id: B.PLANKS, n: 1 }, { id: B.PLANKS, n: 1 }, { id: B.PLANKS, n: 1 }, { id: B.PLANKS, n: 1 }];
    buildCraftBoard();
  });
  await p.waitForTimeout(400);
  const avantCraft = await p.evaluate(() => ({ res: CraftGrid.result && itemName(CraftGrid.result.r.out[0]), locked: CraftGrid.result && CraftGrid.result.locked }));
  await p.evaluate(() => CraftGrid.craft(1));
  await p.waitForTimeout(400);
  const apresCraft = await p.evaluate(() => ({ tables: Game.inv.count(B.CRAFTING), planks: Game.inv.count(B.PLANKS) }));

  // 3) on ferme, on pose l'établi par terre
  await p.evaluate(() => closeInventory());
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const x = Math.floor(Player.pos[0]) + 1, z = Math.floor(Player.pos[2]);
    const y = Game.manager.heightAt(x, z) + 1;
    Game.manager.setBlock(x, y, z, B.CRAFTING, true);
  });
  await p.waitForTimeout(400);

  // 4) on rouvre : 9 cases
  await p.evaluate(() => { Game.inv.add(B.PLANKS, 8); openInventory('craft'); });
  await p.waitForTimeout(900);
  const etape2 = await grid();
  await p.screenshot({ path: '/tmp/t/shots/grille_9.png' });

  // 5) une recette d'établi est maintenant débloquée (pioche en bois)
  await p.evaluate(() => { Game.inv.add(I.STICK, 4); });
  const unlocked = await p.evaluate(() => {
    const r = Crafting.recipes.find(x => itemName(x.out[0]) === 'Pioche en bois');
    return { name: itemName(r.out[0]), unlocked: Crafting.unlocked(r), near: Crafting.nearTable };
  });
  const filled = await p.evaluate(() => {
    const r = Crafting.recipes.find(x => itemName(x.out[0]) === 'Pioche en bois');
    const ok = CraftGrid.placeRecipe(r);
    buildCraftBoard();
    return { ok, cells: CraftGrid.slots.filter(Boolean).length, res: CraftGrid.result && itemName(CraftGrid.result.r.out[0]) };
  });
  await p.screenshot({ path: '/tmp/t/shots/grille_9_pick.png' });

  // 6) on éloigne l'établi : retour à 4 cases, grille vidée proprement
  await p.evaluate(() => {
    closeInventory();
    const x = Math.floor(Player.pos[0]) + 1, z = Math.floor(Player.pos[2]);
    const y = Game.manager.heightAt(x, z) + 1;
    Game.manager.setBlock(x, y, z, B.AIR, true);
    Player.pos = [Player.pos[0] + 40, Player.pos[1], Player.pos[2] + 40];
  });
  await p.waitForTimeout(600);
  await p.evaluate(() => openInventory('craft'));
  await p.waitForTimeout(800);
  const etape3 = await grid();

  console.log(JSON.stringify({ etape1, avantCraft, apresCraft, etape2, unlocked, filled, etape3, errs }, null, 1));
  await b.close();
})();
