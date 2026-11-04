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
  console.log(await p.evaluate(() => {
    const data = {};
    const steps = {};
    const t = (k, f) => { try { data[k] = f(); steps[k] = 'ok'; } catch (e) { steps[k] = e.message; } };
    t('inv', () => Game.inv.serialize());
    t('stats', () => Survival.serialize());
    t('armor', () => Armor.serialize());
    t('xp', () => Xp.serialize());
    t('slot', () => Game.slot);
    t('twoPlayers', () => !!(Game.twoPlayers && !isTouch));
    t('players', () => Players.count > 1 ? 'multi' : null);
    t('dim', () => Dimensions.current);
    t('owpos', () => Dimensions.pos.overworld || null);
    t('edits', () => { let n = 0; for (const arr of Game.manager.editLog.values()) n += arr.length; return n; });
    return steps;
  }));
  console.log(await p.evaluate(() => { const r = saveGame(); return { r, has: !!Saves.current(), id: Saves.currentId, n: Saves.list.length }; }));
  await b.close();
})();
