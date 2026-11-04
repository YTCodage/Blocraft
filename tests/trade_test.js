// Commerce avec les villageois + minerai de diamant sous le sol
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('blocraft.html');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1200, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });

  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 150000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  // ---------- diamants sous le sol ----------
  const ore = await p.evaluate(() => {
    // comptage direct dans le générateur : aucun chargement GPU
    let diamond = 0, deepDiamond = 0, deepslate = 0, total = 0;
    for (let cz = 0; cz < 3; cz++) {
      for (let cx = 0; cx < 3; cx++) {
        const { data } = WorldGen.generateChunk(cx + 40, cz + 40);
        for (let i = 0; i < data.length; i++) {
          const t = data[i];
          if (t === B.DIAMOND) diamond++;
          else if (t === B.DEEPSLATE_DIAMOND) deepDiamond++;
          if (t === B.DEEPSLATE) deepslate++;
        }
        total++;
      }
    }
    return { diamond, deepDiamond, deepslate, chunks: total,
      deepVar: Object.keys(DEEP_ORE_VARIANT).length,
      blocksResolved: [B.COAL, B.IRON, B.GOLD, B.DIAMOND, B.DEEPSLATE_DIAMOND].every(v => typeof v === 'number') };
  });

  // ---------- commerce ----------
  const trade = await p.evaluate(() => {
    const x = Math.floor(Player.pos[0]) + 2, z = Math.floor(Player.pos[2]);
    const y = Game.manager.heightAt(x, z) + 1;
    const mob = Mobs.add('villager', x + 0.5, y, z + 0.5);
    Mobs.target = { mob };
    VillagerTrade.open(mob);
    const rows = [...document.querySelectorAll('#trList .trRow')];
    return {
      state: Game.state,
      shown: !document.getElementById('trade').classList.contains('hidden'),
      prof: VillagerTrade.prof.id, profName: document.getElementById('trName').textContent,
      rows: rows.length,
      icons: rows[0] ? rows[0].querySelectorAll('.trIco canvas').length : 0,
      firstGive: VillagerTrade.prof.offers[0].slice(0, 2),
    };
  });

  const first = await p.evaluate(() => {
    const o = VillagerTrade.prof.offers[0];
    Game.inv.slots.fill(null);
    Game.inv.add(o[0], o[1]);                 // pile suffisante pour l'offre 0
    HUD.refreshAll();
    VillagerTrade.build();
    const before = { have: Game.inv.count(o[0]), emerald: Game.inv.count(I.EMERALDGEM) };
    const r = document.querySelector('#trList .trRow').getBoundingClientRect();
    return { before, at: { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }, give: itemName(o[0]), get: itemName(o[2]) };
  });
  await p.mouse.click(first.at.x, first.at.y);
  await p.waitForTimeout(400);
  Object.assign(first, await p.evaluate(() => {
    const o = VillagerTrade.prof.offers[0];
    return { after: { have: Game.inv.count(o[0]), emerald: Game.inv.count(I.EMERALDGEM) },
      msg: document.getElementById('trMsg').textContent,
      uses: VillagerTrade.used(0) };
  }));

  // offre sans les ingrédients : refusée, rien ne change
  await p.evaluate(() => { Game.inv.slots.fill(null); VillagerTrade.build(); });
  const refuseAt = await p.evaluate(() => {
    const r = document.querySelector('#trList .trRow').getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  });
  await p.mouse.click(refuseAt.x, refuseAt.y);
  await p.waitForTimeout(300);
  const refused = await p.evaluate(() => ({
    empty: Game.inv.slots.filter(Boolean).length === 0,
    msg: document.getElementById('trMsg').textContent,
  }));

  const closed = await p.evaluate(() => {
    VillagerTrade.close();
    return { state: Game.state, hidden: document.getElementById('trade').classList.contains('hidden') };
  });

  // ---------- le clic droit sur un villageois ouvre le commerce ----------
  const viaUse = await p.evaluate(() => {
    const x = Math.floor(Player.pos[0]) + 2, z = Math.floor(Player.pos[2]);
    const y = Game.manager.heightAt(x, z) + 1;
    const mob = Mobs.add('villager', x + 0.5, y, z + 0.5);
    Mobs.target = { mob };
    Game.target = { x, y: y - 1, z, block: Game.manager.getBlock(x, y - 1, z), nx: 0, ny: 1, nz: 0 };
    useAction();
    const st = Game.state;
    VillagerTrade.close();
    return { state: st };
  });

  await b.close();
  console.log(JSON.stringify({ ore, trade, first, refused, closed, viaUse }, null, 1));
  console.log('ERRORS', JSON.stringify([...new Set(errs)].slice(0, 8)));
})();
