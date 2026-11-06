const fs=require('fs'),path=require('path'),assert=require('assert'),{chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
let html=fs.readFileSync(path.join(__dirname,'..','blocraft.html'),'utf8').replace('  newWorld(null, false);','  Game.state="menu";showOverlay("menu");').replace('  requestAnimationFrame(frame);\n}', '}');
await page.route('**/blocraft.html',r=>r.fulfill({contentType:'text/html',body:html}));
await page.goto(new URL('blocraft.html',process.env.SITE_URL||'http://127.0.0.1:8000/').href,{timeout:90000});await page.evaluate(()=>document.fonts.ready);
await page.evaluate(()=>{
Game.state='playing';Game.mode='survival';Game.inv=new Inventory();Game.inv.add(B.LOG,8);Game.inv.add(I.IRONRAW,3);Game.inv.add(I.COAL,2);Game.inv.slots[9]={id:I.IRON_HELM,n:1,d:7};Player.pos=[.5,4,.5];
window.cells=new Map([['1,4,0',B.CRAFTING],['2,4,0',B.FURNACE]]);Game.manager={dim:'flat',chunks:new Map([['0,0',{}]]),getBlock:(x,y,z)=>cells.get([x,y,z].join(','))||0};openInventory('inv');
});
assert.equal(await page.locator('#craftGrid .cbSlot').count(),4);assert.equal(await page.locator('#invMain .islot').count(),27);assert.equal(await page.locator('#invHotbar .islot').count(),9);
await page.screenshot({path:'/tmp/blocraft-inventory.png'});
await page.locator('#invMain .islot').first().click();await page.locator('.armorSlot[data-slot=head]').click();assert(await page.evaluate(()=>Armor.slots.head===I.IRON_HELM&&Armor.dmg.head===7));
await page.locator('.armorSlot[data-slot=head]').click();assert(await page.evaluate(()=>cursorStack.id===I.IRON_HELM&&cursorStack.d===7));await page.locator('#invMain .islot').first().click();
await page.locator('#tabInv .recipeBookBtn').click();assert(await page.locator('#recipeBook').isVisible());assert(!await page.locator('#craftList').textContent().then(s=>/Épée|Casque|Pioche/.test(s)));
await page.locator('#craftCats [data-cat=divers]').click();assert.equal(await page.evaluate(()=>Crafting.cat),'divers');await page.locator('#recipeSearch').fill('planche');await page.locator('#craftList button').first().click();assert(await page.evaluate(()=>CraftGrid.result&&CraftGrid.result.r.out[0]===B.PLANKS));await page.locator('#craftOut').click();assert.equal(await page.evaluate(()=>Game.inv.count(B.PLANKS)),4);
await page.evaluate(()=>{closeInventory();Crafting.forceTable=true;Crafting.tablePos=[1,4,0];openInventory('craft');});assert.equal(await page.locator('#craftGrid .cbSlot').count(),9);await page.screenshot({path:'/tmp/blocraft-workbench.png'});
await page.evaluate(()=>{closeInventory();Furnace.openAt(2,4,0);});assert(await page.locator('#furnaceInput').isVisible());await page.screenshot({path:'/tmp/blocraft-furnace.png'});
await page.locator('#tabFurnace .recipeBookBtn').click();await page.locator('#recipeSearch').fill('fer');await page.locator('#furnaceList button').first().click();
await page.evaluate(()=>{for(let i=0;i<32;i++)Furnace.tick(.1);});assert(await page.evaluate(()=>Furnace.state().slots[2].id===I.IRON_INGOT));
await page.locator('#furnaceOutput').click();assert(await page.evaluate(()=>cursorStack.id===I.IRON_INGOT));
await page.evaluate(()=>{closeInventory();const saved=Furnace.serialize();Furnace.deserialize(saved);Furnace.openAt(2,4,0);});assert(await page.evaluate(()=>Furnace.state().burn>0));
await page.evaluate(()=>{closeInventory();Game.mode='creative';openInventory('blocks');});assert(await page.locator('#invGrid .invItem').count()>0);await page.locator('.creativeCat[data-cat=tools]').click();await page.locator('#invGrid .invItem').first().click();assert(await page.evaluate(()=>Game.inv.slots[Game.slot].inf));await page.screenshot({path:'/tmp/blocraft-creative.png'});
for(const width of [390,320]){await page.setViewportSize({width,height:844});for(const tab of ['inv','blocks','furnace']){await page.evaluate(t=>setInvTab(t),tab);assert(await page.evaluate(()=>document.querySelector('#inventory .mcPanel').getBoundingClientRect().right<=innerWidth));}}
await page.evaluate(()=>{
  closeInventory();Game.mode='survival';Game.inv.slots=Array.from({length:36},()=>({id:B.DIRT,n:64}));cursorStack={id:I.IRON_HELM,n:1,d:9};const before=Drops.list.length;PixelUI.stow(cursorStack);cursorStack=null;if(Drops.list.length!==before+1||Drops.list.at(-1).d!==9)throw new Error('Full inventory lost equipment');
  Furnace.position=['flat',2,4,0];Furnace.stations.clear();const s=Furnace.state();s.slots=[{id:I.IRONRAW,n:8},{id:I.COAL,n:1},null];for(let i=0;i<241;i++)Furnace.tick(.1);if(s.slots[2].n!==8)throw new Error('Coal did not smelt eight ingredients');
  cells.delete('2,4,0');const count=Drops.list.length;Furnace.tick(.1);if(Furnace.stations.size||Drops.list.length<=count)throw new Error('Breaking furnace lost contents');
});
assert.deepEqual(errors,[]);console.log('OK : inventaire 2×2, équipement/usure, livre/recherche/remplissage/craft, établi 3×3, four réel/combustible/résultat/persistance, créatif, mobile 320/390.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
