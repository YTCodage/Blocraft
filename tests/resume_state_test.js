const assert=require('assert'),fs=require('fs'),vm=require('vm');
const s=fs.readFileSync('blocraft.html','utf8');
const begin=s.indexOf('async function continueGame(');
const source=s.slice(begin,s.indexOf('\n  startPlaying();\n}',begin)+'\n  startPlaying();\n}'.length);
assert(source.includes('Dimensions.go(data.dim'));
const nodes=new Map();function $(id){if(!nodes.has(id))nodes.set(id,{textContent:'',classList:{add(){}}});return nodes.get(id);}
const data={seed:30,time:.68,pos:[12.5,90.5,33.5],overworldPos:[2.5,70.5,3.5],yaw:1.4,pitch:.3,
  dim:'nether',mode:'survival',edits:[[2,75,3,1]],netherEdits:[[12,90,33,2]],inv:[],stats:{health:20}};
const entry={id:'w1',name:'Test',initialWorld:'overworld',data};
const Game={state:'menu',manager:null};const Player={pos:[0,0,0],pitch:0};let loaded=null,arrived=null,starts=0;
const ctx=vm.createContext({Math,Map,Date,Promise,console,setTimeout:(fn)=>{fn();return 1;},
  Game,Player,Saves:{list:[entry],get:()=>entry,read:async e=>e.data,suggestName:()=> 'Test'},
  Net:{reset(){}},Structures:{reset(){}},Furnace:{deserialize(){}},Mobs:{reset(){}},Drops:{clear(){}},Railways:{carts:[],riding:null},
  Dimensions:{go:(dim,opts)=>{arrived={dim,opts};}},HUD:{toastText(){}},End:{spawn:[6,0,8]},END_SEA:61,
  gl:null,isTouch:false,$,showOverlay(){},setProgress(){},buildHotbar(){},buildInventory(){},startPlaying(){starts++;},
  loadWorld:async(seed,saved)=>{loaded={seed,saved};Game.manager={editLog:new Map()};Game.time=saved.time;Player.pos=saved.pos;Player.pitch=saved.pitch;}});
vm.runInContext('let busyLoading=false;'+source+'\nthis.continueGame=continueGame;',ctx);
(async()=>{
  await ctx.continueGame(entry);
  assert.equal(Game.time,.68);assert.equal(starts,1);assert.equal(loaded.seed,30);
  assert.deepEqual(loaded.saved.pos,[2.5,70.5,3.5],'base world loads around its own position');
  assert.deepEqual(arrived.opts,{x:12.5,y:90.5,z:33.5,yaw:1.4,remember:false});
  assert.equal(arrived.dim,'nether');assert.equal(Player.pitch,.3);
  const saveSource=s.slice(s.indexOf('function saveGame(opts) {'),s.indexOf('/* dernière sauvegarde (compatibilité) */'));
  const base={dim:'overworld',editLog:new Map([['0,0',[[1,81,1,7]]]])};
  const nether={dim:'nether',editLog:new Map([['0,0',[[8,91,8,8]]]])};
  const end={dim:'end',editLog:new Map([['0,0',[[9,92,9,9]]]])};let written;
  Object.assign(ctx,{window:{},Troll:{morph:null},isTouch:false,Inventory:function(){},
    OneBlock:{count:0},Chests:{serialize:()=>[]},Archery:{},Firearms:{},Boats:{serialize:()=>[]},
    Circuits:{meta:new Map()},Weather:{kind:'clair',remaining:4},EndVictory:{serialize:()=>({won:false})},
    Herobrine:{serialize:()=>[]},Xp:{serialize:()=>({})},Armor:{serialize:()=>({})},
    Survival:{serialize:()=>({})},Players:{count:1,list:[]},updateContinueButton(){}});
  ctx.Game.manager=nether;ctx.Game.startWorld='overworld';ctx.Game.seed=30;ctx.Game.inv={serialize:()=>[]};ctx.Game.slot=0;
  ctx.Game.time=.68;ctx.Dimensions.current='nether';ctx.Dimensions.pos={overworld:[2,70,3]};
  ctx.Dimensions.saved={};ctx.Dimensions.managers={overworld:base,nether,end};
  ctx.Saves.currentName='Test';ctx.Saves.write=d=>{written=d;return true;};
  ctx.Net.live=false;ctx.Furnace.serialize=()=>[];ctx.Drops.list=[];ctx.Railways.serialize=()=>[];
  vm.runInContext(saveSource+'\nthis.saveGame=saveGame;',ctx);
  assert.equal(ctx.saveGame({silent:true}),true,ctx.window.__lastSaveError);
  assert.deepEqual(written.edits,[[1,81,1,7]],'overworld edits must not be replaced by Nether edits');
  assert.deepEqual(written.netherEdits,[[8,91,8,8]]);assert.deepEqual(written.endEdits,[[9,92,9,9]]);
  assert.equal(written.time,.68);
  console.log('OK : reprise à la même heure, position et orientation ; éditions conservées séparément dans les trois dimensions.');
})().catch(e=>{console.error(e);process.exitCode=1;});
