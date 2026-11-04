const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('.modeBtn[data-mode="creative"]').click(); });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.evaluate(() => { Game.mode = 'survival'; });
  await p.evaluate(() => {
    Game.inv = new Inventory();
    const g = [[B.LOG,24],[B.COBBLE,64],[I.IRON_INGOT,32],[I.DIAMONDGEM,20],[I.STICK,32],[B.SAND,32],[I.COAL,32],[I.MEAT,4],[I.IRONRAW,8],[B.CLAY,8],[I.WHEAT,9]];
    for (const [id,n] of g) Game.inv.add(id,n);
  });
  await p.evaluate(() => openInventory());
  await p.waitForTimeout(700);
  console.log('inv open', await p.evaluate(() => document.querySelector('#invTitle').textContent));
  await p.screenshot({ path: '/tmp/t/shots/inv.png' });
  await p.evaluate(() => document.querySelector('.mcTab[data-tab="craft"]').click());
  await p.waitForTimeout(600);
  const craft = await p.evaluate(() => ({
    title: document.querySelector('#invTitle').textContent,
    rows: document.querySelectorAll('#craftList .craftRow').length,
    cats: [...document.querySelectorAll('.mcCat')].map(c => c.textContent),
    first: document.querySelector('#craftList .craftRow') ? document.querySelector('#craftList .craftRow').textContent : '',
    locked: document.querySelectorAll('#craftList .craftRow.locked').length,
  }));
  console.log('craft', JSON.stringify(craft));
  await p.screenshot({ path: '/tmp/t/shots/craft.png' });
  // fabriquer un bâton
  const craftRes = await p.evaluate(() => {
    const before = Game.inv.count(I.STICK);
    const rows = [...document.querySelectorAll('#craftList .craftRow')];
    const r = rows.find(x => x.textContent.includes('Bâton'));
    r.querySelector('button').click();
    return [before, Game.inv.count(I.STICK)];
  });
  console.log('sticks', JSON.stringify(craftRes));
  // four
  await p.evaluate(() => document.querySelector('.mcTab[data-tab="furnace"]').click());
  await p.waitForTimeout(500);
  console.log('furnace', JSON.stringify(await p.evaluate(() => ({
    rows: document.querySelectorAll('#furnaceList .craftRow').length,
    fuel: document.querySelector('#furnaceFuel').textContent,
  }))));
  const smelt = await p.evaluate(() => {
    const rows = [...document.querySelectorAll('#furnaceList .craftRow')];
    const r = rows.find(x => x.textContent.includes('Fer brut'));
    const before = Game.inv.count(I.IRON_INGOT), coal = Game.inv.count(I.COAL);
    r.querySelector('button').click();
    return [before, Game.inv.count(I.IRON_INGOT), coal, Game.inv.count(I.COAL)];
  });
  console.log('smelt iron', JSON.stringify(smelt));
  await p.screenshot({ path: '/tmp/t/shots/furnace.png' });
  // tout doit être craftable : vérif
  const craftable = await p.evaluate(() => {
    const items = Object.keys(ITEMS).map(Number).filter(id => ITEMS[id] && ITEMS[id].name);
    const have = new Set(Crafting.recipes.map(r => r.out[0]));
    const missing = items.filter(id => !have.has(id));
    const blocks = Object.keys(BLOCKS).map(Number).filter(id => BLOCKS[id] && BLOCKS[id].name && !BLOCKS[id].level);
    const bhave = new Set(Crafting.recipes.filter(r => r.out[0] < 100).map(r => r.out[0]));
    const bmissing = blocks.filter(id => !bhave.has(id));
    return { nItems: items.length, missingItems: missing.map(id => ITEMS[id].name), nBlocks: blocks.length, missingBlocks: bmissing.map(id => BLOCKS[id].name) };
  });
  console.log('craftable', JSON.stringify(craftable));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
