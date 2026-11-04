const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  const counts = await p.evaluate(() => ({
    blocks: BLOCKS.filter(b => b && b.name).length,
    recipes: Crafting.recipes.length,
    furnace: Furnace.recipes.length,
    textures: TEXTURES.length,
    wool: BLOCKS[B.WOOL_RED] && BLOCKS[B.WOOL_RED].name,
    ore: BLOCKS[B.DEEPSLATE_DIAMOND] && BLOCKS[B.DEEPSLATE_DIAMOND].name,
    name: itemName(B.CONCRETE_CYAN),
    isBlock: isBlockItem(B.WOOL_RED) && isBlockItem(B.CONCRETE_BLUE),
  }));
  console.log('counts', JSON.stringify(counts));

  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => openInventory('blocks'));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: '/tmp/t/shots/blocks1.png' });
  const n = await p.evaluate(() => document.querySelectorAll('#invGrid .invItem').length);
  await p.evaluate(() => { document.querySelector('#invGrid').scrollTop = 2600; });
  await p.waitForTimeout(400);
  await p.screenshot({ path: '/tmp/t/shots/blocks2.png' });
  // poser une laine rouge au sol
  const placed = await p.evaluate(() => {
    Game.inv.slots[Game.slot] = { id: B.WOOL_RED, n: 64 };
    buildHotbar();
    const x = Math.floor(Player.pos[0]), z = Math.floor(Player.pos[2]) - 2;
    const y = Math.floor(Game.manager.heightAt(x, z));
    Player.pos = [x + 0.5, y + 2.2, z + 1.6];
    Player.pitch = -0.7; Player.yaw = 0;
    Game.manager.setBlock(x, y + 1, z, B.WOOL_BLUE, true);
    return true;
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: '/tmp/t/shots/blocks3.png' });
  console.log('palette items', n, 'placed', placed);
  console.log('errors', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})();
