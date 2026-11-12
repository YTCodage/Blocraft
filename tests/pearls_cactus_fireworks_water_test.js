// Gameplay regressions without WebGL or a browser.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','blocraft.html'),'utf8');
function slice(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i,a);return html.slice(i,j);}
function object(n){return slice(`const ${n} = {`,'\n};')+`\n};this.${n}=${n};`;}
const B={AIR:0,STONE:3,WATER:11,WATER1:47,LAVA:36,CACTUS:21},I={ENDER_PEARL:151,BUCKET:155,BUCKET_WATER:156,BUCKET_LAVA:157,FIREWORK:313};
const game={state:'playing',mode:'survival',manager:null,inv:null,placeHeld:true};
const player={pos:[0.5,4,0.5],vel:[0,0,0],eye:1.6,width:.3,height:1.8,onGround:true,fallDist:0,headInWater:false};
const dim={current:'overworld',busy:false};
let dir=[1,0,0],teleports=[],spent=0,spark=0;
const items=new Map([[I.ENDER_PEARL,3],[I.FIREWORK,2],[I.BUCKET,1]]);
const inv={count:id=>items.get(id)||0,remove(id,n){if(this.count(id)<n)return false;items.set(id,this.count(id)-n);return true;},add(id,n){items.set(id,this.count(id)+n);return 0;}};
game.inv=inv;
const get=(x,y,z)=> x>=8 ? B.STONE : z>=2 ? B.STONE : B.AIR;
game.manager={getBlock:get};
const base={Math,Map,Set,B,I,BLOCKS:{0:{},3:{solid:true},11:{water:true},47:{water:true},36:{},21:{solid:true}},
  Game:game,Player:player,Dimensions:dim,Survival:{dead:false,invuln:0,hurt(n){spent+=n;teleports.push(player.pos.slice());}},
  Sfx:{play(){}},HUD:{refreshAll(){},toastText(){},toast(){},drawStats(){}},Fx:{puff(){spark++;}},TEX:{enderman_face:1,glow:2},
  heldItemId:()=>I.ENDER_PEARL,lookDir:()=>dir,eyePos:()=>[.5,5,.5],setTimeout(){},refreshFlyButtons(){},
};
const ctx=vm.createContext(base);
vm.runInContext(object('EnderPearl'),ctx);
ctx.EnderEye={portalTarget:()=>null};
ctx.EnderPearl.safeSpot=(x,y,z)=>[x,y,z];
assert(ctx.EnderPearl.throwPearl());
dir=[0,0,1];assert(ctx.EnderPearl.throwPearl());
assert.equal(ctx.EnderPearl.live.length,2);
assert.equal(ctx.EnderPearl.throwPearl(),false,'third pearl must not replace an in-flight pearl');
assert.equal(items.get(I.ENDER_PEARL),1);
ctx.EnderPearl.update(.1);
assert.equal(teleports.length,1,'nearer second pearl must land first');
assert(teleports[0][2]>2);
assert.equal(ctx.EnderPearl.live.length,1);
ctx.EnderPearl.update(.5);
assert.equal(teleports.length,2);
assert(teleports[1][0]>=8,'farther first pearl must teleport second');
assert.equal(spent,10,'each impact costs 5 HP');
assert.equal(ctx.EnderPearl.live.length,0);
// Even when both collide during one frame, sub-step time wins over throw order.
const sameFrame=[];
ctx.EnderPearl.impact=(x,y,z)=>sameFrame.push([x,y,z]);
ctx.EnderPearl.live=[
  {pos:[7,4.5,.5],vel:[8,0,0],life:1,trail:1,manager:game.manager,dim:dim.current,id:1},
  {pos:[.5,4.5,1.92],vel:[0,0,8],life:1,trail:1,manager:game.manager,dim:dim.current,id:2},
];
ctx.EnderPearl.update(.2);
assert.equal(sameFrame.length,2);
assert(sameFrame[0][2]>=2 && sameFrame[1][0]>=8,'later-thrown projectile reaches wall first within same frame');
// A replacement world cannot receive an impact from a previous world.
assert(ctx.EnderPearl.throwPearl());game.manager={getBlock:get};ctx.EnderPearl.update(.1);
assert.equal(ctx.EnderPearl.live.length,0);

const cactus=vm.createContext({B,Math,Game:{mode:'survival',state:'playing',manager:{getBlock:(x,y,z)=>x===1&&y===1&&z===0?B.CACTUS:B.AIR}},
 Player:{pos:[.65,1,.5],vel:[0,0,0],width:.3,height:1.8,sprint:false,flying:false,headInWater:false},
 Armor:{reduction:()=>0,points:()=>0},Admin:{god:false},MorphPowers:{active:()=>false,immune:()=>false},
 HUD:{drawStats(){}},Sfx:{play(){}},damageFlash(){},wearArmor(){},clamp:(n,a,b)=>Math.max(a,Math.min(b,n))});
vm.runInContext(slice('function touchesCactus(', '\nconst Survival = {')+object('Survival'),cactus);
assert(cactus.touchesCactus(cactus.Game.manager,cactus.Player.pos,.3,1.8));
cactus.Survival.update(.1);assert.equal(cactus.Survival.health,19);
cactus.Survival.update(.1);assert.equal(cactus.Survival.health,19,'invulnerability prevents per-frame damage');
cactus.Player.pos=[-.2,1,.5];cactus.Survival.update(.6);assert.equal(cactus.Survival.health,19,'distant cactus must not hurt');
cactus.Player.pos=[.65,1,.5];cactus.Survival.update(.6);assert.equal(cactus.Survival.health,18);

const rocket=vm.createContext({...base,Game:{...game,manager:{getBlock:get}},Player:{...player,vel:[0,0,0],flying:false},
 Survival:{dead:false},Fx:{puff(){spark++;}},refreshFlyButtons(){},});
vm.runInContext(object('Fireworks'),rocket);
assert(rocket.Fireworks.use());assert(rocket.Player.flying);assert.equal(rocket.Player.vel[1],7);
rocket.Fireworks.update(1);
assert(rocket.Fireworks.use());assert(rocket.Fireworks.flight().remaining>5);
rocket.Fireworks.update(6.1);assert(!rocket.Player.flying);assert.equal(items.get(I.FIREWORK),0);
assert(!rocket.Fireworks.use(),'no rocket means no flight');
items.set(I.FIREWORK,1);rocket.Players={active:1};
assert(rocket.Fireworks.use());rocket.Players.active=0;
assert(!rocket.Fireworks.active(),'a second local player must not inherit the rocket');
rocket.Fireworks.update(4);rocket.Players.active=1;
assert(rocket.Fireworks.active(),'the original player retains their own flight timer');
rocket.Fireworks.cancel();

const waterGrid=new Map([['1,1,0',B.WATER1],['2,1,0',B.WATER],['3,1,0',B.STONE]]);
const mgr={getBlock:(x,y,z)=>waterGrid.get(`${x},${y},${z}`)||0,setBlock(x,y,z,t){waterGrid.set(`${x},${y},${z}`,t);return true;}};
const water=vm.createContext({Math,B,I,BLOCKS:{0:{},3:{solid:true},11:{water:true},47:{water:true},36:{}},
 Game:{state:'playing',manager:mgr,inv,placeHeld:true},Player:{pos:[.5,0,.5]},
 heldItemId:()=>items.get(I.BUCKET)>0?I.BUCKET:I.BUCKET_WATER,
 eyePos:()=>[.5,1.5,.5],lookDir:()=>[1,0,0],
 Fluids:{isWater:t=>t===B.WATER||t===B.WATER1},
 isReplaceable:t=>t===B.AIR||t===B.WATER1,
 playerBoxOverlaps:()=>false,HUD:{toastText(){},refreshAll(){}},Sfx:{play(){}}});
vm.runInContext(slice('function raycastVoxel(', '/* Shared fluid surface:')+slice('function useBucket()', '\nfunction placeBlock()')+'\nthis.useBucket=useBucket;',water);
assert(water.useBucket());assert.equal(mgr.getBlock(2,1,0),B.AIR,'source behind flowing water picked up');
assert.equal(items.get(I.BUCKET_WATER),1);assert.equal(items.get(I.BUCKET),0);
assert.equal(water.Game.placeHeld,false,'bucket must not repeat automatically');
waterGrid.set('1,1,0',B.AIR);water.Game.placeHeld=true;
assert(water.useBucket());assert.equal(mgr.getBlock(2,1,0),B.WATER,'water bucket pours a retrievable source');
assert.equal(items.get(I.BUCKET),1);
// The furnace front is only on +Z; the other sides retain their masonry.
const tex=vm.createContext({B:{FURNACE:72},TEX:{furnace_front:91,furnace_side:92},BLOCKS:{72:{tex:[90,91,92]}}});
vm.runInContext(slice('function texOf(', '\n/* -------------------- Génération des textures')+'\nthis.texOf=texOf;',tex);
assert.equal(tex.texOf(72,1,4),91);
assert.equal(tex.texOf(72,1,0),92);
assert.equal(tex.texOf(72,0,2),90);
assert.match(html,/add\('divers', false, I\.FIREWORK, 3, \[\[I\.GUNPOWDER/);
assert.match(html,/put\(I\.FIREWORK, \[\[I\.GUNPOWDER/);
console.log('OK : deux perles indépendantes par ordre d’impact, cactus avec délai, fusée consommée et vol temporaire, eau versée puis récupérée, façade du four.');
