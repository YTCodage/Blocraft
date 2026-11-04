const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.setDefaultTimeout(180000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.waitForTimeout(400);
  await p.fill('#ngName', 'Survie au lac');
  await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  // deuxième partie factice pour la liste
  await p.evaluate(() => {
    const d = JSON.parse(JSON.stringify(Saves.current().data));
    Saves.begin('Maison dans les pins', 'overworld', 'creative');
    Saves.write(d);
    Saves.currentId = Saves.list.find(s => s.name === 'Survie au lac').id;
    Saves.currentName = 'Survie au lac';
  });
  // planches
  await p.evaluate(() => { Game.inv.add(B.LOG, 6); openInventory('craft'); });
  await p.waitForTimeout(900);
  await p.click('#craftPlanksBtn');
  await p.waitForTimeout(700);
  await p.screenshot({ path: '/tmp/t/shots/craft_planks_final.png' });
  const planks = await p.evaluate(() => ({ logs: Game.inv.count(B.LOG), planks: Game.inv.count(B.PLANKS) }));
  await p.evaluate(() => closeInventory());
  // pause
  await p.waitForTimeout(500);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(600);
  await p.screenshot({ path: '/tmp/t/shots/pause_final.png' });
  // menu des parties
  await p.evaluate(() => { Game.state = 'menu'; openSaves(); });
  await p.waitForTimeout(800);
  await p.screenshot({ path: '/tmp/t/shots/saves_final.png' });
  const list = await p.evaluate(() => Saves.list.map(s => s.name + ' | ' + s.world + ' | ' + s.mode + ' | data:' + !!s.data));
  console.log(JSON.stringify({ planks, list, errs }));
  await b.close();
})();
