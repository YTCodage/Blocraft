const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#seedInput').value = 'nethertest'; });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2500);
  // saut vers le Nether
  const t0 = Date.now();
  await p.evaluate(() => Dimensions.go('nether', { x: 6.5, y: 66.1, z: 15.5 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 120000 });
  await p.waitForTimeout(4000);
  console.log('nether ms', Date.now() - t0);
  const nether = await p.evaluate(() => ({
    dim: Dimensions.current,
    pos: Player.pos.map(v => Math.round(v * 10) / 10),
    mobs: Mobs.list.map(m => m.type),
    floor: Game.manager.getBlock(0, 65, 0),
    ground: Game.manager.getBlock(30, 65, 4),
    lava: Game.manager.getBlock(20, 60, 4),
    portal: Game.manager.getBlock(2, 67, 11),
  }));
  console.log('nether', JSON.stringify(nether));
  await p.screenshot({ path: '/tmp/t/shots/nether.png' });
  // seau : remplir puis vider
  const bucket = await p.evaluate(() => {
    Game.inv.add(I.BUCKET, 1);
    Game.slot = 0; Game.inv.slots[0] = { id: I.BUCKET, n: 1 };
    // eau juste sous nos pieds pour tester le raycast liquide
    const x = Math.floor(Player.pos[0]) + 3, z = Math.floor(Player.pos[2]);
    Game.manager.setBlock(x, 65, z, B.WATER, true);
    Player.pos = [x + 0.5, 66.1, z + 3.5];
    Player.yaw = Math.PI; Player.pitch = -0.6;
    Game.target = { x: x, y: 65, z: z, block: B.WATER, nx: 0, ny: 1, nz: 0, dist: 3 };
    const ok = useBucket();
    return { ok, water: Game.inv.count(I.BUCKET_WATER), bucket: Game.inv.count(I.BUCKET), block: Game.manager.getBlock(x, 65, z) };
  });
  console.log('bucket fill', JSON.stringify(bucket));
  // eau incassable
  const guard = await p.evaluate(() => {
    const x = Math.floor(Player.pos[0]), z = Math.floor(Player.pos[2]);
    Game.manager.setBlock(x + 1, 65, z, B.WATER, true);
    Game.target = { x: x + 1, y: 65, z: z, block: B.WATER, nx: -1, ny: 0, nz: 0, dist: 2 };
    Game.mode = 'survival';
    breakBlock();
    return Game.manager.getBlock(x + 1, 65, z);
  });
  console.log('water unbreakable ->', guard);
  // butin proportionnel
  const loot = await p.evaluate(() => {
    const count = (items) => items.filter(Boolean).length;
    const q = [];
    for (const [tier, d] of [['village', 1], ['dungeon', 3], ['bastion', 5]]) {
      const it = Chests.lootFor(12, 70, 34, tier);
      q.push([tier, d, count(it), it.filter(Boolean).map(x => x.n).reduce((a, b) => a + b, 0)]);
    }
    return q;
  });
  console.log('loot', JSON.stringify(loot));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
