// Vérifie l'interface tactile : contrôles, orientation, plein écran, et jouabilité réelle.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = 'file://' + path.resolve('blocraft.html');
const SHOTS = process.env.SHOTS || '/tmp/t/shots';
fs.mkdirSync(SHOTS, { recursive: true });
const errs = [];

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const out = {};

  const mk = async (w, h, dpr) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: dpr || 1 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
    return { ctx, page };
  };

  // ---------- 1. portrait : menu + écran « tourne le téléphone » ----------
  {
    const { ctx, page } = await mk(390, 844, 2);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 150000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/mob_menu_portrait.png` });
    out.menuPortrait = await page.evaluate(() => {
      const m = document.querySelector('.menu-shell');
      const r = m.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight,
        fits: r.width <= innerWidth + 1 && r.height <= innerHeight + 1,
        cards: [...document.querySelectorAll('.worldBtn')].map(b => b.dataset.world) };
    });
    await page.tap('#btnPlay'); await page.waitForTimeout(500); await page.tap('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(1500);
    out.rotateVisiblePortrait = await page.evaluate(() => getComputedStyle(document.getElementById('rotate')).display !== 'none');
    await page.screenshot({ path: `${SHOTS}/mob_rotate.png` });
    // « jouer comme ça »
    await page.tap('#btnRotateOk');
    await page.waitForTimeout(400);
    out.rotateAfterOk = await page.evaluate(() => getComputedStyle(document.getElementById('rotate')).display);
    await page.screenshot({ path: `${SHOTS}/mob_portrait_play.png` });
    await ctx.close();
  }

  // ---------- 2. paysage : jeu réel ----------
  {
    const { ctx, page } = await mk(844, 390, 1);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 150000 });
    await page.tap('#btnPlay'); await page.waitForTimeout(500); await page.tap('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(2500);

    out.ui = await page.evaluate(() => {
      const vis = (id) => { const e = document.getElementById(id); if (!e) return null;
        const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
        return { shown: cs.display !== 'none' && cs.visibility !== 'hidden', w: Math.round(r.width), h: Math.round(r.height),
          x: Math.round(r.x), y: Math.round(r.y), inView: r.x >= -1 && r.y >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 }; };
      return {
        touch: getComputedStyle(document.getElementById('touch')).display,
        rotate: getComputedStyle(document.getElementById('rotate')).display,
        mobStatus: vis('mobStatus'),
        btns: Object.fromEntries(['tBreak','tPlace','tJump','tInv','tPause','tFly','tUp','tDown'].map(id => [id, vis(id)])),
      };
    });

    // --- déplacement : joystick gauche ---
    const p0 = await page.evaluate(() => Player.pos.slice(0, 3).map(v => +v.toFixed(2)));
    await page.touchscreen.tap(200, 250);
    await page.dispatchEvent('canvas', 'touchstart', {}).catch(() => {});
    // glisser-regarder à droite
    await page.evaluate(() => {
      const c = document.querySelector('canvas');
      const mk = (type, id, x, y) => {
        const t = new Touch({ identifier: id, target: c, clientX: x, clientY: y, pageX: x, pageY: y });
        c.dispatchEvent(new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], changedTouches: [t], bubbles: true, cancelable: true }));
      };
      window.__mk = mk;
      mk('touchstart', 1, 120, 300);          // joystick
      mk('touchstart', 2, 600, 220);          // regard
    });
    const yaw0 = await page.evaluate(() => Player.yaw);
    await page.evaluate(() => { for (let i = 1; i <= 10; i++) window.__mk('touchmove', 2, 600 + i * 12, 220); });
    const yaw1 = await page.evaluate(() => Player.yaw);
    await page.evaluate(() => { for (let i = 1; i <= 12; i++) window.__mk('touchmove', 1, 120, 300 - i * 12); });
    await page.waitForTimeout(900);
    const inp = await page.evaluate(() => ({ f: +Input.f.toFixed(2), sprint: !!Input.sprint, stick: +stick.y.toFixed(2) }));
    await page.waitForTimeout(700);
    const p1 = await page.evaluate(() => Player.pos.slice(0, 3).map(v => +v.toFixed(2)));
    out.inputPushed = inp;
    out.controlers = {
      yawChanged: +Math.abs(yaw1 - yaw0).toFixed(3),
      moved: +Math.hypot(p1[0] - p0[0], p1[2] - p0[2]).toFixed(2),
      stickShown: await page.evaluate(() => getComputedStyle(document.getElementById('stickBase')).display),
    };
    await page.evaluate(() => { window.__mk('touchend', 1, 120, 180); window.__mk('touchend', 2, 720, 220); });
    await page.waitForTimeout(300);
    out.stickAfterRelease = await page.evaluate(() => getComputedStyle(document.getElementById('stickBase')).display);

    // --- saut ---
    const yJump0 = await page.evaluate(() => Player.pos[1]);
    const bj = await page.$('#tJump');
    await bj.dispatchEvent('touchstart', { bubbles: true, cancelable: true });
    await page.waitForTimeout(700);
    const midJump = await page.evaluate(() => ({ jump: Input.jump, vy: +Player.vel[1].toFixed(2), y: Player.pos[1] }));
    await page.waitForTimeout(500);
    const yJump1 = await page.evaluate(() => Player.pos[1]);
    await bj.dispatchEvent('touchend', { bubbles: true, cancelable: true });
    out.jump = { inputJump: midJump.jump, vy: midJump.vy, gain: +(Math.max(yJump1, midJump.y) - yJump0).toFixed(2) };
    await page.waitForTimeout(800);

    // --- minage : on vise un bloc et on maintient ---
    out.mine = await page.evaluate(async () => {
      const p = Player.pos;
      const x = Math.floor(p[0]), z = Math.floor(p[2]);
      let y = Math.floor(p[1]) - 1, b = Game.manager.getBlock(x, y, z), n = 0;
      while (!b && n++ < 8) { y--; b = Game.manager.getBlock(x, y, z); }
      const t0 = { x, y, z };
      Game.target = { ...t0, block: b, nx: 0, ny: 1, nz: 0 };
      const t = Game.target, before = Game.manager.getBlock(t.x, t.y, t.z);
      const btn = document.getElementById('tBreak');
      btn.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
      for (let i = 0; i < 60; i++) { breakBlock(); }
      await new Promise(r => setTimeout(r, 900));
      const after = Game.manager.getBlock(t.x, t.y, t.z);
      const pressedClass = btn.classList.contains('pressed');
      btn.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }));
      return { before, after, broken: before !== after, pressedClass };
    });

    // --- poser ---
    out.place = await page.evaluate(() => {
      Game.inv.slots[Game.slot] = { id: B.DIRT, n: 64 };   // un bloc en main
      HUD.refreshAll();
      const p = Player.pos;
      const x = Math.floor(p[0]) + 2, z = Math.floor(p[2]);
      let y = Math.floor(p[1]) + 2, n = 0;
      while (Game.manager.getBlock(x, y, z) && n++ < 6) y++;
      const t0 = { x, y, z };
      Game.target = { ...t0, block: Game.manager.getBlock(t0.x, t0.y, t0.z), nx: 0, ny: 1, nz: 0 };
      const t = Game.target, before = Game.manager.getBlock(t.x, t.y, t.z);
      const btn = document.getElementById('tPlace');
      btn.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }));
      const after = Game.manager.getBlock(t.x, t.y + 1, t.z);
      return { before, after, changed: before !== after, held: Game.inv.heldId(), dirt: B.DIRT,
        target: t, blockAfter: after };
    });

    // --- inventaire tactile ---
    const inv = await page.$('#tInv');
    await inv.dispatchEvent('touchstart', { bubbles: true, cancelable: true });
    await inv.dispatchEvent('touchend', { bubbles: true, cancelable: true });
    await page.waitForTimeout(800);
    out.inventory = await page.evaluate(() => ({ state: Game.state, shown: !document.getElementById('inventory').classList.contains('hidden'),
      touchHid: document.getElementById('touch').classList.contains('hidden') }));
    await page.screenshot({ path: `${SHOTS}/mob_inventory.png` });
    // déplacer une pile au doigt : tap sur la case 0, puis sur une case vide
    out.invMove = await page.evaluate(async () => {
      Game.inv.slots[0] = { id: B.DIRT, n: 5 };
      buildInventoryUI();
      const slots = [...document.querySelectorAll('#invHotbar .islot')];
      const tap = (el) => {
        el.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      };
      tap(slots[0]);
      const carried = cursorStack ? cursorStack.n : 0;
      tap(slots[3]);
      return { carried, slot0: Game.inv.slots[0] ? Game.inv.slots[0].n : 0,
        slot3: Game.inv.slots[3] ? Game.inv.slots[3].n : 0, moved: !!(Game.inv.slots[3] && Game.inv.slots[3].n === 5) };
    });
    await page.evaluate(() => closeInventory(true));
    await page.waitForTimeout(600);

    // --- pause tactile + réglages ---
    const pa = await page.$('#tPause');
    await pa.dispatchEvent('touchstart', { bubbles: true, cancelable: true });
    await pa.dispatchEvent('touchend', { bubbles: true, cancelable: true });
    await page.waitForTimeout(800);
    out.pause = await page.evaluate(() => ({ state: Game.state, shown: !document.getElementById('pause').classList.contains('hidden') }));
    await page.screenshot({ path: `${SHOTS}/mob_pause.png` });
    await page.evaluate(() => resumeGame());
    await page.waitForTimeout(900);

    // --- vol ---
    out.flyBefore = await page.evaluate(() => ({ mode: Game.mode, flying: Player.flying }));
    await page.evaluate(() => { Game.mode = 'creative'; refreshFlyButtons(); });
    const fl = await page.$('#tFly');
    await fl.dispatchEvent('touchstart', { bubbles: true, cancelable: true });
    await fl.dispatchEvent('touchend', { bubbles: true, cancelable: true });
    await page.waitForTimeout(400);
    out.fly = await page.evaluate(() => ({ flying: Player.flying,
      upShown: !document.getElementById('tUp').classList.contains('hidden'),
      downShown: !document.getElementById('tDown').classList.contains('hidden') }));
    // monter
    const y0 = await page.evaluate(() => Player.pos[1]);
    const up = await page.$('#tUp');
    await up.dispatchEvent('touchstart', { bubbles: true, cancelable: true });
    await page.waitForTimeout(700);
    const y1 = await page.evaluate(() => Player.pos[1]);
    await up.dispatchEvent('touchend', { bubbles: true, cancelable: true });
    out.flyRise = +(y1 - y0).toFixed(2);

    // --- barre d'état mobile ---
    out.status = await page.evaluate(() => ({ fps: document.getElementById('mobFps').textContent,
      pos: document.getElementById('mobPos').textContent }));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SHOTS}/mob_landscape.png` });
    await ctx.close();
  }

  await browser.close();
  out.errors = [...new Set(errs)].slice(0, 12);
  console.log(JSON.stringify(out, null, 1));
  console.log('ERRORS', JSON.stringify(out.errors));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
