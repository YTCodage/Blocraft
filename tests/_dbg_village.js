const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('blocraft.html');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  p.setDefaultTimeout(120000);
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.waitForTimeout(300);
  await p.fill('#ngName','dbg'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1000);
  console.log(await p.evaluate(() => {
    const d = Structures.descsNear('overworld', Player.pos[0], Player.pos[2], 900).filter(x=>x.type==='village')[0];
    return { dim: Game.manager.dim, dimType: typeof Game.manager.dim, hasDescsNear: typeof Structures.descsNear, d: d && {x:d.x,z:d.z} };
  }));
  console.log(await p.evaluate(async () => {
    const d = Structures.descsNear('overworld', Player.pos[0], Player.pos[2], 900).filter(x=>x.type==='village')[0];
    if (!d) return 'none';
    Player.pos = [d.x+0.5, Game.manager.heightAt(d.x,d.z)+2, d.z+0.5];
    Player.vel = [0,0,0];
    await new Promise(r=>setTimeout(r,3000));
    const m = Game.manager;
    const h = m.heightAt(d.x, d.z);
    const cols = [];
    for (let i=0;i<5;i++){ const x=d.x+i, z=d.z; cols.push([h, m.getBlock(x,h,z), m.getBlock(x,h+1,z), m.getBlock(x,h+2,z)]); }
    const e = Structures.getBuilt(d);
    let beds=0; for (const arr of e.buckets.values()) for (const bb of arr) if (bb[3]===B.BED) beds++;
    return { h, cols, beds, player:[Player.pos[0],Player.pos[1],Player.pos[2]], chunks: m.chunks ? m.chunks.size : -1 };
  }));
  // force populate
  console.log(await p.evaluate(() => {
    const d = Structures.descsNear('overworld', Player.pos[0], Player.pos[2], 60).filter(x=>x.type==='village')[0];
    if (!d) return 'no desc near';
    VillageLife.populate(d);
    return { villagers: Mobs.list.filter(m=>m.type==='villager').length, golems: Mobs.list.filter(m=>m.type==='iron_golem').length };
  }));
  await p.waitForTimeout(3000);
  console.log(await p.evaluate(() => ({ after: Mobs.list.length, v: Mobs.list.filter(m=>m.type==='villager').length, g: Mobs.list.filter(m=>m.type==='iron_golem').length,
    types: [...new Set(Mobs.list.map(m=>m.type))] })));
  await b.close();
})();
