const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });

  // monde par défaut + démarrage
  await p.evaluate(() => { document.querySelector('#seedInput').value = 'bloc'; });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2500);

  const dims = await p.evaluate(() => [...document.querySelectorAll('.worldBtn')].map(b => [b.dataset.world, b.disabled]));
  console.log('worldBtns', JSON.stringify(dims));

  // menu Échap
  await p.evaluate(() => document.querySelector('#cmdBar').classList.remove('on'));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(900);
  const pauseInfo = await p.evaluate(() => ({
    open: !document.querySelector('#pause').classList.contains('hidden'),
    dim: document.querySelector('#ppDim').textContent,
    mode: document.querySelector('#ppMode').textContent,
    seed: document.querySelector('#ppSeed').textContent,
    keys: document.querySelectorAll('#kbList .kbRow').length,
    hasCheats: !!document.querySelector('#btnCheats'),
  }));
  console.log('pause', JSON.stringify(pauseInfo));
  await p.screenshot({ path: '/tmp/t/shots/pause.png' });

  // changer une touche : clic sur "Voler" puis touche G
  await p.evaluate(() => {
    const rows = [...document.querySelectorAll('#kbList .kbRow')];
    const r = rows.find(x => x.textContent.includes('Voler'));
    r.querySelector('.kbKey').click();
  });
  await p.keyboard.press('KeyG');
  await p.waitForTimeout(300);
  const kb = await p.evaluate(() => JSON.parse(localStorage.getItem('blocraft_keys_v1') || '{}'));
  console.log('keybindFly', JSON.stringify(kb.fly));

  // reprise
  await p.evaluate(() => document.querySelector('#btnResume').click());
  await p.waitForTimeout(800);

  // code secret 2026 via barre de commandes
  await p.keyboard.press('KeyT');
  await p.waitForTimeout(300);
  await p.keyboard.type('2026');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(1200);
  const qa = await p.evaluate(() => ({
    on: typeof QA !== 'undefined' && QA.on,
    owner: Admin.owner,
    visible: !document.querySelector('#qa').classList.contains('hidden'),
    tabs: document.querySelectorAll('#qa .qaTab').length,
  }));
  console.log('qa', JSON.stringify(qa));
  await p.screenshot({ path: '/tmp/t/shots/qa.png' });

  // onglet Monde : liste des structures
  await p.evaluate(() => document.querySelector('#qa .qaTab[data-tab="world"]').click());
  await p.waitForTimeout(600);
  const sites = await p.evaluate(() => [...document.querySelectorAll('#qaSiteList .qaSite')].slice(0, 6).map(r => r.textContent));
  console.log('sites', JSON.stringify(sites));
  await p.screenshot({ path: '/tmp/t/shots/qa_world.png' });

  // onglet Voir : X-ray + ESP
  await p.evaluate(() => document.querySelector('#qa .qaTab[data-tab="view"]').click());
  await p.evaluate(() => document.querySelector('.qaTog[data-qa="xray"]').click());
  await p.evaluate(() => document.querySelector('.qaTog[data-qa="esp"]').click());
  await p.evaluate(() => document.querySelector('.qaTog[data-qa="coords"]').click());
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('#qaClose').click());
  await p.waitForTimeout(3500);
  const view = await p.evaluate(() => ({
    state: Game.state,
    xray: QA.xray, esp: QA.esp,
    coords: document.querySelector('#qaCoords').textContent,
    espBoxes: document.querySelectorAll('#qaEsp .espBox').length,
    mobs: Mobs.list.length,
  }));
  console.log('view', JSON.stringify(view));
  await p.screenshot({ path: '/tmp/t/shots/xray.png' });

  // onglet Codes : exécution d'un code
  await p.keyboard.press('F8');
  await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('#qa .qaTab[data-tab="codes"]').click());
  await p.waitForTimeout(400);
  const nCodes = await p.evaluate(() => document.querySelectorAll('#qaCodes .qaCode').length);
  await p.evaluate(() => {
    const bs = [...document.querySelectorAll('#qaCodes .qaCode')];
    const b = bs.find(x => x.textContent.startsWith('diamants'));
    b.click();
  });
  await p.waitForTimeout(600);
  const invD = await p.evaluate(() => Game.inv.count(17));
  console.log('codes', nCodes, 'diamants', invD);
  await p.screenshot({ path: '/tmp/t/shots/qa_codes.png' });

  // TP coords
  await p.evaluate(() => document.querySelector('#qa .qaTab[data-tab="tools"]').click());
  await p.evaluate(() => {
    document.querySelector('#qaTpX').value = '300';
    document.querySelector('#qaTpY').value = '90';
    document.querySelector('#qaTpZ').value = '-200';
    document.querySelector('#qaTpGo').click();
  });
  await p.waitForTimeout(1200);
  const pos = await p.evaluate(() => Player.pos.map(v => Math.round(v)));
  console.log('tp', JSON.stringify(pos), 'state', await p.evaluate(() => Game.state));

  // forteresse garantie ?
  const sh = await p.evaluate(() => {
    const list = nearbySites(0, 0, 600, 'overworld');
    return list.filter(s => s.type === 'stronghold').map(s => [s.x, s.z, s.dist]);
  });
  console.log('strongholds', JSON.stringify(sh));

  // chute : dégâts au-delà de 5 blocs
  const fall = await p.evaluate(async () => {
    Game.mode = 'survival';
    Survival.hp = 20;
    const res = [];
    for (const h of [4, 6]) {
      Survival.hp = 20;
      Player.pos = [300.5, 120, -200.5];
      Player.vel = [0, 0, 0];
      Player.fallDist = 0;
      Player.onGround = false;
      await new Promise(r => setTimeout(r, 40));
      Player.pos = [300.5, 120 - h, -200.5];
      Player.fallDist = h;
      Player.landT = 0;
      await new Promise(r => setTimeout(r, 400));
      res.push([h, Survival.hp]);
    }
    return res;
  });
  console.log('fall', JSON.stringify(fall));

  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
