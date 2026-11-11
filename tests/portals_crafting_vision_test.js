// Deterministic world and bulk-crafting regressions; no browser or WebGL required.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'blocraft.html'), 'utf8');
const part = (a, b) => { const start = html.indexOf(a), end = html.indexOf(b, start); assert(start >= 0 && end > start, a); return html.slice(start, end); };
const object = name => part(`const ${name} = {`, '\n};') + `\n};\nthis.${name}=${name};`;
assert(!html.includes("vision: ['KeyX']"));
assert(!html.includes("Keys.has('vision', e.code)"));
assert(!html.includes('data-qa="xray"'));
assert(html.includes("if(['vision','xray'].includes(cmd))"));

const B = {AIR:0, PORTAL:37, END_PORTAL:93, END_FRAME:97, OBSIDIAN:19, CHEST:30,
  NETHERRACK:32, MAGMA:55, SOUL_SAND:33, GOLD:16, TORCH:28,
  STONEBRICK:26, CRACKED:109, MOSSY:31, BOOKSHELF:71, SEA_LANTERN:78, GLOWSTONE:8,
  DIRT:2, GRASS:1, LOG:5, PLANKS:7};
const I = {STICK:100};
const world = vm.createContext({Math, Map, Set, B, Game:{seed:37}, SEA:62, WH:128, SNOW_LINE:96,
  WorldGen:{heightAt:()=>70, desertAt:()=>0, forestAt:()=>0},
  hashString: text => [...text].reduce((h,c)=>Math.imul(h,31)+c.charCodeAt(0)|0,7),
  mulberry32: seed => () => { seed = Math.imul(1664525,seed)+1013904223|0; return (seed>>>0)/4294967296; },
});
vm.runInContext(part('const STRUCT_DEFS = {','/* Butin par type de coffre') + part('function blockList() {','const Structures = {') + object('Structures'), world);
const sites = [];
for (let rx=-4; rx<=4; rx++) for (let rz=-4; rz<=4; rz++) {
  for(const type of ['ruined_portal','stronghold']) {
    const site=world.Structures.cellDesc(type,rx,rz);
    if(site)sites.push(site);
  }
}
assert.equal(sites.filter(s=>s.type==='ruined_portal').length,5);
assert.equal(sites.filter(s=>s.type==='stronghold').length,1);
const again=world.Structures.cellDesc('stronghold',0,0);
assert.equal(sites.find(s=>s.type==='stronghold').x,again.x);
for(const site of sites) {
  const built=world.Structures.getBuilt(site), blocks=[...built.buckets.values()].flat();
  if(site.type==='ruined_portal') {
    assert.equal(blocks.filter(b=>b[3]===B.PORTAL).length,6,'natural Nether gate must be lit and traversable');
    assert.equal(blocks.filter(b=>b[3]===B.OBSIDIAN && b[1]>=71 && b[1]<=75).length,14);
  } else {
    assert.equal(blocks.filter(b=>b[3]===B.END_FRAME).length,12,'one End frame ring');
  }
}
world.WorldGen.heightAt=()=>55;
world.Structures.cache.clear();
const oceanBlocks=[...world.Structures.getBuilt(sites.find(s=>s.type==='ruined_portal')).buckets.values()].flat();
assert(oceanBlocks.filter(b=>b[3]===B.PORTAL).every(b=>b[1]>62),'gates over water must stay above sea level');

const goods = new Map([[B.LOG,3],[B.PLANKS,10]]);
const inv = {count:id=>goods.get(id)||0, remove(id,n){assert(this.count(id)>=n);goods.set(id,this.count(id)-n);return true;}, add(id,n){goods.set(id,this.count(id)+n);return 0;}};
const crafting = vm.createContext({Math, Map, B, I, Game:{inv}, Player:{pos:[0,70,0]},
  PixelUI:{tab:'craft',stow(){}}, cursorStack:null, Crafting:{recipes:[],atTable:()=>false,scanTable(){},unlocked:()=>true},
  performance:{now:()=>1000},itemStackSize:()=>64,itemName:id=>String(id),
  HUD:{toast(){},toastText(){},refreshAll(){}},Sfx:{play(){}},
  Drops:{add(){throw Error('Unexpected excess output');}},renderCursor(){},buildInventoryUI(){},buildHotbar(){},
});
vm.runInContext(object('CraftGrid'),crafting);
const grid=crafting.CraftGrid;grid.reset(2);
const planks={out:[B.PLANKS,4],in:[[B.LOG,1]],shape:{rows:['L'],keys:{L:B.LOG}}};
crafting.Crafting.recipes=[planks];
assert(grid.placeRecipe(planks));
assert.equal(grid.slots.filter(Boolean)[0].n,3,'book must stack repeated batches');
grid.result=grid.find();
assert.equal(grid.craft('all'),3);
assert.equal(inv.count(B.PLANKS),22);
const sticks={out:[I.STICK,4],in:[[B.PLANKS,2]],shape:{rows:['P','P'],keys:{P:B.PLANKS}}};
crafting.Crafting.recipes=[sticks];
assert(grid.placeRecipe(sticks));
assert.equal(grid.slots.filter(Boolean).length,2);
assert.equal(grid.slots.filter(Boolean)[0].n,11);
grid.result=grid.find();
assert.equal(grid.craft(1),1);
assert.equal(grid.craft('all'),10);
assert.equal(inv.count(I.STICK),44);
assert.equal(inv.count(B.PLANKS),0);
console.log('OK : vision X par commande seulement, 5 portails Nether actifs + 1 anneau End par graine, planches et bâtons en série.');
