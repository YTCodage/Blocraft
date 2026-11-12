// Gameplay regressions: powered rails, ammo and projectiles, ruined portals.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','blocraft.html'),'utf8');
const object=name=>{const a=html.search(new RegExp(`const ${name}\\s*=\\s*\\{`));assert(a>=0,name);const b=html.indexOf('\n};',a);assert(b>a,name);return html.slice(a,b+3)+`\nthis.${name}=${name};`;};
const B={AIR:0,OBSIDIAN:19,PORTAL:37,POWERED_RAIL:3,END_PORTAL:93,END_FRAME:97};
const I={BULLET:314,ROCKET_AMMO:315,MACHINE_GUN:316,ROCKET_LAUNCHER:317,MINECART:300};
const cells=new Map(),at=(x,y,z)=>cells.get(`${x},${y},${z}`)||0;
for(let x=0;x<10;x++)cells.set(`${x},1,0`,B.POWERED_RAIL);
const mgr={dim:'overworld',getBlock:at,setBlock(x,y,z,t){cells.set(`${x},${y},${z}`,t);return true;}};
const cartctx=vm.createContext({Math,B,I,Game:{manager:mgr,mode:'survival',inv:{remove:()=>true}},
 BLOCKS:{0:{},3:{rail:true}},Circuits:{powerAt:()=>0},Mobs:{list:[]},HUD:{toastText(){},refreshAll(){}},Player:{pos:[.5,1,.5],vel:[0,0,0]},
 heldItemId:()=>I.MINECART,lookDir:()=>[1,0,0],TEX:{planks:4,iron_block:5,powered_rail:6},Net:{live:false},Fx:{puff(){}}});
vm.runInContext(object('Railways'),cartctx);
const cart=cartctx.Railways.create({x:0,y:1,z:0});assert.equal(cart.speed,6);
cartctx.Railways.update(.25);assert(cart.speed>9,'powered rail accelerates without redstone');
const quads=[];cartctx.Railways.mesh({quad(...args){quads.push(args[0][5]);}},0,1,0,0,0,mgr,.8);
assert(quads.includes(6),'powered rail is orange/red in actual 3D mesh');
assert.match(html,/vehicle: \['KeyM'\]/);assert.match(html,/music: \['KeyN'\]/);
assert.match(html,/Keys\.has\('vehicle', e\.code\)/);

let now=1000,held=I.MACHINE_GUN,damage=[],blasts=0;
const stock=new Map([[I.BULLET,2],[I.ROCKET_AMMO,1]]);
const inv={remove(id,n){if((stock.get(id)||0)<n)return false;stock.set(id,stock.get(id)-n);return true;}};
const mobs=[{id:1,pos:[2.5,4,.5],def:{w:.8,h:2},hp:20},{id:2,pos:[3.5,4,.5],def:{w:.8,h:2},hp:20}];
const guns=vm.createContext({Math,B,I,Game:{manager:{dim:'overworld',getBlock:()=>0},mode:'survival',inv},
 BLOCKS:{0:{}},Mobs:{list:mobs,hurt(m,n){damage.push([m.id,n]);m.hp-=n;}},
 Player:{pos:[.5,4,.5]},Net:{live:false},performance:{now:()=>now},heldItemId:()=>held,
 eyePos:()=>[.5,5,.5],lookDir:()=>[1,0,0],Fx:{puff(){}},TEX:{glow:1,iron_block:2},
 Sfx:{play(){},explosion(){blasts++;}},HUD:{toastText(){},refreshAll(){}}});
vm.runInContext(object('Firearms'),guns);
assert(guns.Firearms.shoot());guns.Firearms.update(.1);
assert.equal(stock.get(I.BULLET),1);assert.deepEqual(damage,[[1,3]],'bullet strikes first mob only');
assert(guns.Firearms.shoot());assert.equal(stock.get(I.BULLET),1,'rate limit');
now+=140;assert(guns.Firearms.shoot());assert.equal(stock.get(I.BULLET),0);
now+=140;assert(guns.Firearms.shoot());assert.equal(stock.get(I.BULLET),0,'no free bullets in survival');
held=I.ROCKET_LAUNCHER;now+=400;assert(guns.Firearms.shoot());guns.Firearms.update(.12);
assert.equal(stock.get(I.ROCKET_AMMO),0);assert(blasts>0);assert(damage.some(([id])=>id===2),'rocket has area damage');
assert(!guns.Firearms.launch([0,0,0],[Infinity,0,0],held),'reject invalid network direction');

const arrivals=[];
const portal=vm.createContext({Math,B,Game:{state:'playing',manager:mgr,inv:{}},Player:{pos:[1.5,2,.5],yaw:0},Dimensions:{busy:false,current:'overworld',pos:{},go(...args){arrivals.push(args);}},
 HUD:{toastText(){}},Sfx:{play(){}},BLOCKS:{},END_SEA:64});
vm.runInContext(object('Portals'),portal);
// 4x5 frame with precisely two gaps; it cannot light until repaired.
cells.clear();for(let dy=0;dy<=4;dy++)for(let dx=0;dx<=3;dx++)if((dy===0||dy===4||dx===0||dx===3)&&!(dx===0&&dy===2)&&!(dx===2&&dy===4))cells.set(`${dx},${dy},0`,B.OBSIDIAN);
assert.equal(portal.Portals.ignite(0,1,0),false);
cells.set('0,2,0',B.OBSIDIAN);assert.equal(portal.Portals.ignite(0,1,0),false);
cells.set('2,4,0',B.OBSIDIAN);assert.equal(portal.Portals.ignite(0,1,0),true);
assert.equal([...cells.values()].filter(t=>t===B.PORTAL).length,6);
portal.Portals.cooldown=0;portal.Portals.timer=1.1;
portal.Player.pos=[1.5,2,.5];cells.set('1,2,0',B.END_PORTAL);
portal.Portals.update(.1);
assert.equal(arrivals[0][0],'end','a player-built End portal leads to the End, not the Nether');
assert.match(html,/this\.announce\(dim\)/);
console.log('OK : M pour wagon, rail propulseur autonome et coloré, tirs avec munitions, roquette, portail à réparer et entrée End.');
