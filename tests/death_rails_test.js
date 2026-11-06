// Tests de logique sans navigateur : node tests/death_rails_test.js
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'blocraft.html'), 'utf8');
function object(name) {
  const start = html.indexOf(`const ${name} = {`);
  const end = html.indexOf('\n};', start) + 3;
  return html.slice(start, end) + `\nthis.${name} = ${name};`;
}
const ctx = vm.createContext({ Math, console, Set, BLOCKS: {0:{solid:false},1:{solid:true},2:{rail:true},3:{rail:true}}, B:{POWERED_RAIL:3}, I:{MINECART:300},
  Game:{state:'playing',mode:'survival',manager:{dim:'overworld',getBlock:(x,y,z)=>y===0?1:0},inv:{slots:[{id:5,n:64},{id:101,n:1,d:12}],add(){return 0;} }},
  Player:{pos:[0,1,0],vel:[0,0,0]},Players:{active:0},
  Armor:{slots:{head:122},dmg:{head:7},reset(){this.slots={};}}, ARMOR_SLOTS:['head'],
  TouchActions:{reset(){}}, GameChat:{death(){}},
  cursorStack:{id:7,n:3}, CraftGrid:{slots:[{id:5,n:2}],reset(){this.slots=[];}},
  HUD:{refreshAll(){},toast(){},toastText(){}}, Sfx:{play(){}},
  $:()=>({classList:{remove(){}},textContent:''}),document:{exitPointerLock(){}}, heldItemId:()=>300,
});
vm.runInContext(object('Railways') + object('Drops') + object('Survival'), ctx);
ctx.Survival.die('Test');
assert(ctx.Game.inv.slots.every(x=>x===null));
assert.equal(Object.keys(ctx.Armor.slots).length,0);
assert.equal(ctx.Drops.list.length,5);
assert.equal(ctx.Drops.list.find(x=>x.id===101).d,12);
assert.equal(ctx.Drops.list.find(x=>x.id===122).d,7);
ctx.Survival.die('Encore'); assert.equal(ctx.Drops.list.length,5);
assert(ctx.Drops.list.every(d=>d.death && d.dim==='overworld'));
ctx.Game.state='playing';ctx.Survival.dead=false;
const drop=ctx.Drops.list[0], yaw=drop.yaw;
ctx.Drops.update(.1); assert(drop.yaw>yaw); assert.equal(ctx.Drops.list.length,5);
ctx.Game.manager.dim='nether';const t=drop.t;ctx.Drops.update(.1);assert.equal(drop.t,t);
ctx.Game.manager.dim='overworld';
ctx.Game.manager.getBlock=(x,y,z)=>y===1&&z===0&&x>=0&&x<6?3:0;
ctx.Game.inv.remove=()=>true;
ctx.Railways.use({x:0,y:1,z:0});assert.equal(ctx.Railways.carts.length,1);
const cart=ctx.Railways.carts[0];const x=cart.pos[0];ctx.Railways.update(.1);
assert(cart.pos[0]>x);assert(cart.speed>2);
assert.equal(ctx.Railways.visuals().length,5);
const extras=html.slice(html.indexOf('const EXTRA_BLOCKS'),html.indexOf('EXTRA_BLOCKS.forEach'));
const count=(extras.match(/^  \['/gm)||[]).length;
assert(163+count-1<256,'Les identifiants des blocs doivent tenir sur un octet');
console.log('OK : mort, inventaire et armure vidés, usure, rotation, dimensions, rails propulseurs, wagonnet, identifiants.');
