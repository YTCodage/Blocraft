// npm run test:regressions — no WebGL required.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'blocraft.html'), 'utf8');
const object = name => { const a = html.indexOf(`const ${name} = {`), b = html.indexOf('\n};', a) + 3; assert(a >= 0 && b > a); return html.slice(a,b)+`\nthis.${name}=${name};`; };
const fn = (start,end) => { const a=html.indexOf(start), b=html.indexOf(end,a);assert(a>=0&&b>a);return html.slice(a,b); };
let saves=0, ui=0, messages=[];
const I={DIRT:2}, B={AIR:0,DIRT:2,CHEST:30,BEDROCK:12,BED:88};
const BLOCKS={2:{solid:true},12:{solid:true},30:{solid:true},88:{solid:true}};
const ctx=vm.createContext({Math,Map,Set,Number,TextEncoder,I,B,BLOCKS,ITEMS:{},WH:256,
  Dimensions:{current:'oneblock'},Game:{seed:1,state:'playing',mode:'survival',slot:0,manager:null},
  Player:{pos:[.5,65.05,.5],inWater:false,width:.3,height:1.8},
  Net:{live:false,role:null,remote:{x:.5,y:65,z:.5,dim:'oneblock'},send:m=>messages.push(m)},
  AdminCloud:{active:false,sender:null},Saves:{currentId:'save'},
  HUD:{toast(){},toastText(){},refreshAll(){}},Sfx:{play(){},blockPlace(){}},
  openInventory(){ctx.Game.state='inventory';},saveGame(){saves++;},
  buildInventoryUI(){ui++;},renderCursor(){},itemName(){return 'Terre';},itemStackSize(){return 64;},
  setTimeout(){},
});
vm.runInContext(object('Chests')+fn('function makeCreativeInf(', '\nfunction renderCursor()')+'\nthis.invClick=invClick;',ctx);
const spots=new Map([['0,64,0',B.BEDROCK],['4,64,0',B.CHEST]]);
ctx.Game.manager={dim:'oneblock',getBlock:(x,y,z)=>spots.get(`${x},${y},${z}`)||0,
  setBlock(x,y,z,t){spots.set(`${x},${y},${z}`,t);return true;}};
const inv={slots:new Array(36).fill(null),add(id,n){this.slots[0]={id,n:(this.slots[0]?.n||0)+n};return 0;},remove(){return true;},heldId(){return B.DIRT;}};
ctx.Game.inv=inv;ctx.cursorStack=null;
const loot=Array(27).fill(null);loot[0]={id:B.DIRT,n:3};
ctx.Chests.lootFor=()=>loot.map(i=>i&&{...i});
ctx.Chests.openAt(4,64,0);
ctx.invClick(0,false,0);assert.equal(inv.slots[0].n,3);
ctx.Chests.close();ctx.Game.state='playing';ctx.Chests.openAt(4,64,0);
assert.equal(ctx.Chests.open.items[0],null,'looted chest must stay empty after closing');
const saved=ctx.Chests.serialize();ctx.Chests.load(saved);ctx.Chests.openAt(4,64,0);
assert.equal(ctx.Chests.open.items[0],null,'looted chest must stay empty after save/load');
assert(saves>0);
ctx.Chests.remove(4,64,0);assert(!ctx.Chests.contents.has('oneblock|4|64|0'));
ctx.Chests.openAt(4,64,0);assert.equal(ctx.Chests.open.items[0].n,3,'a new chest may generate fresh loot');
// Host owns shared chest; two sequential claims cannot duplicate the same stack.
ctx.Net.live=true;ctx.Net.role='host';ctx.Chests.openAt(4,64,0);
ctx.Chests.network(['chest-take',4,64,0,0,3]);
ctx.Chests.network(['chest-take',4,64,0,0,3]);
assert.equal(messages.filter(m=>m[0]==='chest-grant').length,1);
assert.equal(ctx.Chests.contents.get('oneblock|4|64|0')[0],null);
// Mono-bloc: the top face overlaps the player's feet, so place laterally.
ctx.Game.state='playing';ctx.Net.live=false;ctx.Chests.close();
ctx.lookDir=()=>[1,-.5,0];ctx.heldItemId=()=>B.DIRT;ctx.isBlockItem=id=>id===B.DIRT;ctx.isReplaceable=t=>!t;
ctx.playerBoxOverlaps=(x,y,z)=>x===0&&y===65&&z===0;
ctx.Beds={place(){}};ctx.Golems={isPumpkin:()=>false};ctx.Fx={puff(){}};ctx.Circuits={placed(){}};ctx.isTouch=true;ctx.WH=256;
vm.runInContext(fn('function placeBlock()','\n/* ======================= Portes et lits'),ctx);
ctx.Game.target={x:0,y:64,z:0,nx:0,ny:1,nz:0,block:B.BEDROCK};
ctx.Game.inv.slots[0]={id:B.DIRT,n:10};
ctx.placeBlock();
assert.equal(spots.get('1,64,0'),B.DIRT,'the first block of a one-block bridge should be placed beside the core');
assert.equal(spots.get('0,65,0'),undefined,'never place inside the player');
const gear=vm.createContext({});vm.runInContext(fn('const I = {','/* ---------------------------------------------------------------------------\n   DURÉE DE VIE'),gear);
for(const [name,slot] of [['BEDROCK_HELM','head'],['BEDROCK_CHEST','chest'],['BEDROCK_LEGS','legs'],['BEDROCK_BOOTS','feet']]){
  const item=vm.runInContext(`ITEMS[I.${name}]`,gear);assert.equal(item.armor.slot,slot);assert(item.dur>0);
}
assert(vm.runInContext('ITEMS[I.BEDROCK_SWORD].damage > ITEMS[I.NETHERITE_SWORD].damage',gear));
assert(html.includes("add('combat', true, I.BEDROCK_SWORD"));
assert(html.includes('id="voiceToggle"')&&html.includes('id="btnShop"')&&html.includes('id="btnFriends"'));
console.log('OK : coffre vidé conservé après fermeture/sauvegarde, nouvelle pose, retrait unique en réseau, premier bloc du pont mono-bloc et équipement bedrock.');
