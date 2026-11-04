const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/pointer/i.test(m.text())) errs.push(m.text()); });

  // simule un iframe sandboxé : le pointer lock est refusé
  await p.addInitScript(() => {
    HTMLElement.prototype.requestPointerLock = function () {
      const e = new Event('pointerlockerror');
      document.dispatchEvent(e);
      return Promise.reject(new Error('locked by sandbox'));
    };
  });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  const out = {};
  out.lockFailed = await p.evaluate(() => !!Game.lockFailed);

  // --- regard : glissé de 400 px vers la droite, deux fois ---
  const yaw0 = await p.evaluate(() => Player.yaw);
  await p.mouse.move(640, 400);
  await p.mouse.down();
  for (let i = 1; i <= 20; i++) await p.mouse.move(640 + i * 20, 400);
  await p.mouse.up();
  const yaw1 = await p.evaluate(() => Player.yaw);

  await p.mouse.move(200, 400);
  await p.mouse.down();
  for (let i = 1; i <= 20; i++) await p.mouse.move(200 + i * 20, 400);
  await p.mouse.up();
  const yaw2 = await p.evaluate(() => Player.yaw);
  out.yaw = [yaw0, yaw1, yaw2].map(v => Math.round(v * 100) / 100);
  out.totalTurnDeg = Math.round((yaw0 - yaw2) * 180 / Math.PI);

  // --- guidage au bord : la caméra continue de tourner toute seule ---
  await p.mouse.move(600, 400);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(600 + i * 30, 400);
  await p.mouse.move(1276, 400);
  const yawEdge0 = await p.evaluate(() => Player.yaw);
  await p.waitForTimeout(700);
  const yawEdge1 = await p.evaluate(() => Player.yaw);
  await p.mouse.up();
  out.edgeSpinDeg = Math.round((yawEdge0 - yawEdge1) * 180 / Math.PI);

  // --- clic bref = casser un bloc (mode souris libre) ---
  await p.evaluate(() => {
    Game.mode = 'creative';
    window._breaks = 0;
    const orig = window.breakBlock;
    window.breakBlock = function () { window._breaks++; return orig.apply(this, arguments); };
  });
  await p.mouse.move(640, 400);
  await p.mouse.down();
  await p.waitForTimeout(60);
  await p.mouse.up();
  await p.waitForTimeout(250);
  out.clickBreak = await p.evaluate(() => window._breaks);

  // --- maintien sans bouger = minage continu ---
  await p.evaluate(() => { window._breaks = 0; });
  await p.mouse.down();
  await p.waitForTimeout(900);
  const midHold = await p.evaluate(() => window._breaks);
  await p.mouse.up();
  out.holdMine = midHold;

  // --- glissé pendant le maintien = on regarde, sans casser ---
  await p.evaluate(() => { window._breaks = 0; });
  await p.mouse.move(500, 400);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(500 + i * 25, 400);
  await p.waitForTimeout(400);
  await p.mouse.up();
  out.dragBreaks = await p.evaluate(() => window._breaks);

  // --- clic droit : pas de menu du navigateur, ni sur le jeu ni dans l'inventaire ---
  out.ctx = await p.evaluate(() => {
    const res = {};
    const fire = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return 'ABSENT';
      const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      el.dispatchEvent(ev);
      return ev.defaultPrevented;
    };
    res.canvas = fire('#game');
    openInventory();
    res.inventory = fire('#inventory');
    res.slot = fire('#invMain > *');
    res.slot2 = document.querySelectorAll('#invMain > *').length;
    closeInventory(true);
    res.input = fire('#cmdInput');
    return res;
  });

  out.errors = errs;
  console.log(JSON.stringify(out));
  await p.screenshot({ path: '/tmp/t/shots/cam.png' });
  await b.close();
})();
