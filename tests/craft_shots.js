// Captures propres de la table de craft (bureau, portrait, paysage).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve('blocraft.html');
const SHOTS = process.env.SHOTS || '/tmp/t/shots';
fs.mkdirSync(SHOTS, { recursive: true });

const SETUP = () => {
  Game.manager.setBlock(Math.floor(Player.pos[0]) + 2, FLAT_Y + 1, Math.floor(Player.pos[2]), B.CRAFTING, true);
  Game.inv.slots = new Array(36).fill(null);
  Game.inv.add(B.PLANKS, 24); Game.inv.add(I.STICK, 12); Game.inv.add(B.COBBLE, 16);
  Game.inv.add(I.IRON_INGOT, 9); Game.inv.add(B.LOG, 5); Game.inv.add(I.COAL, 8);
  openInventory('craft');
  Crafting.scanTable();
  const rec = Crafting.recipes.find(r => r.out[0] === I.IRON_PICK);
  CraftGrid.placeRecipe(rec);
  buildInventoryUI();
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, w, h, touch] of [['desk', 1280, 800, false], ['port', 390, 844, true], ['land', 844, 390, true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
    await page.click('.worldBtn[data-world="flat"]');
    await page.click('#btnPlay'); await page.click('#ngStart');
    await page.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
    await page.waitForTimeout(1300);
    await page.evaluate(SETUP);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/craft_${name}.png` });
    const info = await page.evaluate(() => {
      const body = document.querySelector('#inventory .mcBody');
      const r = document.querySelector('.cbBoard').getBoundingClientRect();
      const bag = document.querySelector('#craftBag').getBoundingClientRect();
      const first = document.querySelector('#craftBag .islot').getBoundingClientRect();
      return {
        board: [Math.round(r.top), Math.round(r.width)],
        bagTop: Math.round(bag.top), bagW: Math.round(bag.width),
        slot: Math.round(first.width),
        scroll: body.scrollHeight, view: body.clientHeight,
        result: CraftGrid.result ? itemName(CraftGrid.result.r.out[0]) : null,
      };
    });
    console.log(name, JSON.stringify(info));
    await ctx.close();
  }
  await browser.close();
})();
