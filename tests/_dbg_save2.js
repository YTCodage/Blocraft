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
  await p.evaluate(() => {
    window.__log = [];
    const w = Saves.write.bind(Saves);
    Saves.write = (d, o) => { window.__log.push(['write', !!d, d && !!d.inv, Saves.currentId]); return w(d, o); };
    const bg = Saves.begin.bind(Saves);
    Saves.begin = (n, wo, mo) => { window.__log.push(['begin', n, wo, mo]); return bg(n, wo, mo); };
    const sg = window.saveGame;
    window.saveGame = (o) => { window.__log.push(['saveGame', JSON.stringify(o||{})]); return sg(o); };
  });
  await p.click('#btnPlay'); await p.waitForTimeout(300);
  await p.fill('#ngName','Dbg2'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2000);
  console.log(JSON.stringify(await p.evaluate(() => ({
    log: window.__log,
    id: Saves.currentId, name: Saves.currentName,
    entryHasData: !!(Saves.current() && Saves.current().data),
  })), null, 1));
  await b.close();
})();
