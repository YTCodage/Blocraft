// La table de craft sur téléphone (portrait + paysage) : tout doit tenir.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve('blocraft.html');
const SHOTS = process.env.SHOTS || '/tmp/t/shots';
fs.mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const out = {};
  for (const [name, w, h] of [['land', 844, 390], ['port', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
    await page.click('.worldBtn[data-world="flat"]');
    await page.click('#btnPlay'); await page.click('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      Game.manager.setBlock(Math.floor(Player.pos[0]) + 2, FLAT_Y + 1, Math.floor(Player.pos[2]), B.CRAFTING, true);
      Game.inv.slots = new Array(36).fill(null);
      Game.inv.add(B.PLANKS, 24); Game.inv.add(I.STICK, 12); Game.inv.add(B.COBBLE, 16);
      openInventory('craft');
      Crafting.scanTable();
      const rec = Crafting.recipes.find(r => r.out[0] === I.SPICK);
      CraftGrid.placeRecipe(rec);
      buildInventoryUI();
    });
    await page.waitForTimeout(1500);
    out[name] = await page.evaluate(() => {
      const g = document.getElementById('craftGrid').getBoundingClientRect();
      const o = document.getElementById('craftOut').getBoundingClientRect();
      const board = document.querySelector('.cbBoard').getBoundingClientRect();
      const panel = document.querySelector('.mcPanel').getBoundingClientRect();
      const slots = [...document.querySelectorAll('#craftGrid .cbSlot')].map(e => e.getBoundingClientRect());
      return {
        n: CraftGrid.n,
        gridW: Math.round(g.width), gridH: Math.round(g.height),
        boardIn: board.left >= panel.left - 1 && board.right <= panel.right + 1,
        boardTopVisible: board.top >= panel.top - 1,
        outVisible: o.left >= panel.left - 1 && o.right <= panel.right + 1,
        slotSize: Math.round(slots[0].width),
        cellSize: Math.round(slots[0].height),
        result: CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null,
      };
    });
    await page.screenshot({ path: `${SHOTS}/craft_m_${name}.png` });
    // fabrication au doigt
    out[name].tap = await page.evaluate(() => {
      const out = document.getElementById('craftOut');
      const r = out.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    });
    await page.touchscreen.tap(out[name].tap.x, out[name].tap.y);
    await page.waitForTimeout(700);
    out[name].afterTap = await page.evaluate(() => ({ picks: Game.inv.count(I.SPICK), result: CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null }));
    out[name].errors = errs.slice(0, 3);
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
