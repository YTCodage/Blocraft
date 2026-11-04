// Captures : porte + lit, donjon du mono-bloc, château du mono-bloc.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve('blocraft.html');
const SHOTS = process.env.SHOTS || '/tmp/t/shots';
fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

  // ---------- porte + lit en monde plat ----------
  {
    const page = await (await browser.newContext({ viewport: { width: 1100, height: 660 } })).newPage();
    page.on('pageerror', e => console.log('ERR', e.message));
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
    await page.click('.worldBtn[data-world="flat"]');
    await page.click('.modeBtn[data-mode="creative"]');
    await page.click('#btnPlay'); await page.click('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const y = FLAT_Y;
      const px = Math.floor(Player.pos[0]) + 6, pz = Math.floor(Player.pos[2]);
      window.__H = { px, pz, y };
      for (let dx = -3; dx <= 3; dx++) for (let dz = 0; dz <= 6; dz++) {
        const edge = dx === -3 || dx === 3 || dz === 0 || dz === 6;
        Game.manager.setBlock(px + dx, y, pz + dz, B.PLANKS, false);
        if (!edge) continue;
        for (let k = 1; k <= 4; k++) {
          if (dz === 0 && dx === 0 && k <= 2) continue;      // embrasure
          Game.manager.setBlock(px + dx, y + k, pz + dz, k === 4 ? B.LOG : B.PLANKS, false);
        }
      }
      // encadrement en pierre de la porte
      for (let k = 1; k <= 3; k++) { Game.manager.setBlock(px - 1, y + k, pz, B.STONEBRICK, false); Game.manager.setBlock(px + 1, y + k, pz, B.STONEBRICK, false); }
      for (let dx = -1; dx <= 1; dx++) Game.manager.setBlock(px + dx, y + 3, pz, B.STONEBRICK, false);
      Game.manager.setBlock(px, y + 1, pz + 4, B.BED, false);
      Game.manager.setBlock(px - 2, y + 1, pz + 1, B.CRAFTING, false);
      Game.manager.setBlock(px + 2, y + 1, pz + 1, B.CHEST, false);
      Game.manager.setBlock(px + 2, y + 3, pz + 4, B.TORCH, false);
      Game.manager.setBlock(px - 2, y + 3, pz + 4, B.TORCH, false);
      Game.manager.setBlock(px, y + 1, pz, B.DOOR_CLOSED, false);
      Game.manager.setBlock(px, y + 2, pz, B.DOOR_CLOSED, false);
      Player.pos = [px + 0.5, y + 1.05, pz - 4.5];
      Player.yaw = Math.PI; Player.pitch = -0.05;
    });
    await page.waitForTimeout(7000);
    await page.screenshot({ path: `${SHOTS}/new_house.png` });
    await page.evaluate(() => {
      const H = window.__H;
      Doors.toggle({ x: H.px, y: H.y + 1, z: H.pz });
    });
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${SHOTS}/new_door_open.png` });
    await page.evaluate(() => {
      const H = window.__H;
      Player.pos = [H.px + 2.3, H.y + 1.05, H.pz + 1.2];
      Player.yaw = Math.PI * 0.75; Player.pitch = -0.12;
    });
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${SHOTS}/new_bed.png` });
    await page.context().close();
  }

  // ---------- donjon + château du mono-bloc ----------
  {
    const page = await (await browser.newContext({ viewport: { width: 1200, height: 700 } })).newPage();
    page.on('pageerror', e => console.log('ERR', e.message));
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
    await page.click('.worldBtn[data-world="oneblock"]');
    await page.click('.modeBtn[data-mode="creative"]');
    await page.click('#btnPlay'); await page.click('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const d = OneBlock.dungeonSpecs()[0];
      Player.pos = [d.x + 0.5, 72, d.z + 21.5];
      Player.yaw = 0; Player.pitch = -0.12;
      Player.flying = true;
    });
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${SHOTS}/new_dungeon.png` });
    await page.evaluate(() => {
      const c = OneBlock.castleSpecs()[8];          // grand anneau
      Player.pos = [c.x + 0.5, 92, c.z + 64.5];
      Player.yaw = 0; Player.pitch = -0.30;
      Player.flying = true;
    });
    await page.waitForTimeout(12000);
    await page.screenshot({ path: `${SHOTS}/new_castle.png` });
    await page.context().close();
  }

  await browser.close();
  console.log('shots ok');
})();
