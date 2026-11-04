const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.setDefaultTimeout(180000);
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.evaluate(() => {
    Saves.begin('Survie au lac', 'overworld', 'survival');
    Saves.write({ seed: 1234, dim: 'overworld', mode: 'survival', pos: [5, 70, 5], inv: [], stats: {}, armor: {}, xp: 0, slot: 0 });
    Saves.begin('Maison dans les pins', 'overworld', 'creative');
    Saves.write({ seed: 777, dim: 'overworld', mode: 'creative', pos: [1, 70, 1], inv: [], stats: {}, armor: {}, xp: 0, slot: 0 });
    updateContinueButton();
    renderSaves();
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: '/tmp/t/shots/menu_with_saves.png' });
  await b.close();
})();
