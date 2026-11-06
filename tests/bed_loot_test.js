const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'..','blocraft.html'),'utf8');
const object=name=>{const a=html.indexOf(`const ${name} = {`),b=html.indexOf('\n};',a)+3;return html.slice(a,b)+`\nthis.${name}=${name};`;};
const I={},B={},ITEMS={},BLOCKS={};let id=1;
for(const key of ['DIAMONDGEM','GOLDRAW','GOLD_INGOT','EMERALDGEM','NETHERITE_SCRAP','NETHERITE_INGOT','IRONRAW','IRON_INGOT','BREAD','ENDER_EYE','ENDER_PEARL']){I[key]=id;ITEMS[id++]={};}
for(const key of ['DIAMOND_BLOCK','GOLD_BLOCK','EMERALD_BLOCK','NETHERITE_BLOCK','IRON_BLOCK','BED']){B[key]=id;BLOCKS[id++]={};}
let timers=[],sent=[],notices=[];
const pool=[[I.DIAMONDGEM,2,5],[I.GOLDRAW,2,5],[I.IRON_INGOT,1,3],[I.BREAD,1,4]];
const ctx=vm.createContext({Math,Array,Number,Map,Set,ITEMS,BLOCKS,I,B,
  Game:{seed:42,time:.9,spawn:[10,10,10],manager:{getBlock:()=>B.BED}},Player:{pos:[.5,1,.5],vel:[1,1,1]},Mobs:{list:[]},
  Net:{live:false,role:null,send:p=>sent.push(p),remotePos:()=>[.5,1,.5]},
  HUD:{toastText:t=>notices.push(t),refreshAll(){}},GameChat:{add(){}},
  isNightTime:()=>ctx.Game.time<.24||ctx.Game.time>.76,
  $:()=>({classList:{add(){},remove(){}}}),setTimeout:fn=>{timers.push(fn);return timers.length;},
  hashString:t=>{let n=0;for(const c of t)n=(n*31+c.charCodeAt(0))|0;return n;},
  mulberry32:seed=>()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;},
  lootPool:()=>pool,lootDifficulty:()=>4,LOOT_BONUS:{},itemStackSize:()=>64,
});
vm.runInContext(object('Beds')+object('Chests'),ctx);
const bed={x:0,y:1,z:0};
ctx.Beds.sleep(bed);assert(ctx.Beds.sleeping);timers.shift()();assert.equal(ctx.Game.time,.27);assert.equal(ctx.Game.spawn[0],.5);timers=[];
ctx.Beds.sleep(bed);assert(!ctx.Beds.sleeping);assert(notices.at(-1).includes('nuit'));
ctx.Game.time=.9;ctx.Mobs.list=[{def:{hostile:true},pos:[1,1,1]}];ctx.Beds.sleep(bed);assert(!ctx.Beds.sleeping);assert(notices.at(-1).includes('monstres'));ctx.Mobs.list=[];
ctx.Net.live=true;ctx.Net.role='guest';ctx.Beds.sleep(bed);assert.equal(sent.at(-1)[0],'sleep');assert.equal(ctx.Game.time,.9);
ctx.Net.role='host';const oldSpawn=ctx.Game.spawn;ctx.Beds.sleep(bed,true);timers.shift()();assert.equal(ctx.Game.time,.27);assert.equal(ctx.Game.spawn,oldSpawn);assert.equal(sent.at(-1)[0],'sleep-ok');
ctx.Beds.wake(sent.at(-1)[1]);assert.equal(ctx.Game.spawn[0],.5);timers=[];
// Guaranteed quantities never exceed caps, even if all rare rolls succeed.
const balanced=ctx.Chests.balance([{id:I.DIAMONDGEM,n:50},{id:I.DIAMONDGEM,n:50},{id:I.DIAMONDGEM,n:50},{id:I.GOLDRAW,n:30}],()=>0,4);
assert.equal(balanced.filter(Boolean).filter(s=>s.id===I.DIAMONDGEM).reduce((a,s)=>a+s.n,0),2);
assert.equal(balanced[3].n,2);
const sum=slots=>slots.filter(Boolean).filter(s=>s.id===I.DIAMONDGEM||s.id===I.GOLDRAW).reduce((n,s)=>n+s.n,0);
let reduced=0,original=0;
const balance=ctx.Chests.balance;
for(let n=0;n<200;n++){
  const a=ctx.Chests.lootFor(n,50,2,'test'),b=ctx.Chests.lootFor(n,50,2,'test');assert.equal(JSON.stringify(a),JSON.stringify(b));reduced+=sum(a);
  ctx.Chests.balance=items=>items;original+=sum(ctx.Chests.lootFor(n,50,2,'test'));ctx.Chests.balance=balance;
  assert(a.filter(s=>s&&s.id===I.DIAMONDGEM).reduce((n,s)=>n+s.n,0)<=2);
}
assert(reduced<original*.25,`${reduced} vs ${original}`);
assert(html.includes("drops: [[B.WOOL_WHITE, 1, 2]"));assert(!html.includes("B.WOOL_WHITE, 1, [[I.STRING, 4]]"));
console.log(`OK : lit jour/nuit, sécurité, sommeil réseau, recettes laine/mouton, butin déterministe réduit (${reduced}/${original} unités précieuses).`);
