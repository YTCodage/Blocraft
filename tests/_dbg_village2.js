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
    Player.pos = [d.x+0.5, Game.manager.heightAt(d.x,d.z)+2, d.z+0.5];
    Player.vel=[0,0,0];
    const m = Game.manager;
    const info = {};
    info.chunkAtCenter = m.hasChunk(d.x>>4, d.z>>4);
    for (let i=0;i<12;i++){ streamChunks(80,80); }
    info.afterStream = m.hasChunk(d.x>>4, d.z>>4);
    info.chunks = m.chunks.size;
    const h = m.heightAt(d.x,d.z);
    info.h = h;
    info.col = [m.getBlock(d.x,h,d.z), m.getBlock(d.x,h+1,d.z), m.getBlock(d.x,h+2,d.z), m.getBlock(d.x,h+3,d.z)];
    const e = Structures.getBuilt(d);
    let beds=[]; for (const arr of e.buckets.values()) for (const bb of arr) if (bb[3]===B.BED) beds.push([bb[0],bb[1],bb[2]]);
    info.beds = beds.slice(0,4);
    info.bedBlocks = beds.slice(0,3).map(b2 => m.getBlock(b2[0],b2[1],b2[2]));
    info.built = !!e;
    return info;
  }));
  console.log(await p.evaluate(() => {
    const d = Structures.descsNear('overworld', Player.pos[0], Player.pos[2], 60).filter(x=>x.type==='village')[0];
    VillageLife.checked.clear();
    VillageLife.populate(d);
    return { v: Mobs.list.filter(m=>m.type==='villager').length, g: Mobs.list.filter(m=>m.type==='iron_golem').length };
  }));
  await b.close();
})();
