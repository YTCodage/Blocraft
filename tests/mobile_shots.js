// Captures de l'interface mobile (portrait + paysage) pour contrôle visuel.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve('blocraft.html');
const SHOTS = '/tmp/t/shots';
fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const errs = [];
  const mk = async (w, h, dpr) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: dpr });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(e.message));
    return { ctx, page };
  };

  // portrait
  {
    const { ctx, page } = await mk(390, 844, 2);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 150000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/m2_menu_portrait.png` });
    await page.tap('#btnPlay'); await page.waitForTimeout(500); await page.tap('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SHOTS}/m2_rotate.png` });
    await page.tap('#btnRotateOk');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/m2_portrait_play.png` });
    await ctx.close();
  }

  // paysage
  {
    const { ctx, page } = await mk(844, 390, 2);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 150000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/m2_menu_landscape.png` });
    await page.tap('#btnPlay'); await page.waitForTimeout(500); await page.tap('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(2000);
    // caméra cadrée sur l'horizon, créatif pour voir vol + boutons
    await page.evaluate(() => {
      Game.mode = 'creative'; Game.slot = 0;
      Game.inv.slots[0] = { id: B.DIRT, n: 64 };
      Player.pitch = 0.14; Game.time = 0.32;
      HUD.drawStats(); buildHotbar(); refreshFlyButtons();
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SHOTS}/m2_landscape.png` });
    // inventaire
    await page.evaluate(() => openInventory('inv'));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/m2_inventory.png` });
    await page.evaluate(() => setInvTab('craft'));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${SHOTS}/m2_craft.png` });
    await page.evaluate(() => setInvTab('blocks'));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${SHOTS}/m2_blocks.png` });
    await page.evaluate(() => closeInventory(true));
    await page.waitForTimeout(600);
    // commerce avec un villageois
    await page.evaluate(() => {
      const x = Math.floor(Player.pos[0]) + 2, z = Math.floor(Player.pos[2]);
      const y = Game.manager.heightAt(x, z) + 1;
      window.__mob = Mobs.add('villager', x + 0.5, y, z + 0.5);
      Game.inv.add(I.WHEAT, 24);
      Game.inv.add(I.EMERALDGEM, 5);
      VillagerTrade.open(window.__mob);
    });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/m2_trade.png` });
    await page.evaluate(() => VillagerTrade.close());
    await page.waitForTimeout(600);
    // pause
    await page.evaluate(() => openPause());
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${SHOTS}/m2_pause.png` });
    await ctx.close();
  }

  await browser.close();
  console.log('ERRORS', JSON.stringify([...new Set(errs)]));
})();
