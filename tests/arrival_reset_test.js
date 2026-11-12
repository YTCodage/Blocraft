const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const html=fs.readFileSync('blocraft.html','utf8');
const source=html.slice(html.indexOf('const ArrivalReset = {'),html.indexOf('\nasync function continueGame('));
assert(source.startsWith('const ArrivalReset = {'),'arrival reset source found');
for(const id of ['arrivalWorld','arrivalMode','btnResetWorld','btnResetMode'])assert(html.includes('id="'+id+'"'),'button '+id+' exists');
const nodes=new Map();function $(id){if(!nodes.has(id))nodes.set(id,{textContent:'',classList:{add(){},remove(){}}});return nodes.get(id);}
const entries=[{id:'first',name:'Partie 1',world:'flat',mode:'survival',initialWorld:'flat',initialMode:'survival',data:{edits:[[1,2,3,4]]}},{id:'other',data:{edits:[[3,4,5,6]]}}];
const game={state:'playing',manager:{dim:'nether',chunks:new Map(),meshQueue:new Map(),decorations:new Map()},seed:4294967295,mode:'creative',inv:{item:'unchanged'},slot:2};
const saves={currentId:'first',currentName:'Partie 1',current(){return entries[0];}};
let setMode=0,loaded=null;const ctx={Date,Promise,setTimeout,clearTimeout,console,$,Game:game,Saves:saves,Net:{live:false},busyLoading:false,
  setGameMode(m){setMode++;game.mode=m;},clearKeys(){},document:{exitPointerLock(){}},showOverlay(){},
  Dimensions:{managers:{nether:game.manager,flat:{chunks:new Map(),meshQueue:new Map(),decorations:new Map()}},saved:{},pos:{}},
  releaseChunkBuffers(){},End:{built:true},Nether:{built:true},OneBlock:{count:22},Portals:{},Troll:{},
  newWorld:async(seed,play)=>{loaded=[seed,play,game.startWorld,game.mode];},HUD:{toastText(){}}};
vm.createContext(ctx);vm.runInContext(source+'\nthis.ArrivalReset=ArrivalReset;',ctx);
const reset=ctx.ArrivalReset;
assert(reset.resetMode());assert.equal(setMode,1);assert.equal(game.mode,'survival');assert.deepEqual(game.inv,{item:'unchanged'});assert.deepEqual(entries[0].data.edits,[[1,2,3,4]]);
ctx.Net.live=true;assert.equal(reset.askWorld(),false,'network game cannot be erased');ctx.Net.live=false;
assert(reset.askWorld());assert.equal(loaded,null,'first click only warns');
(async()=>{assert(await reset.askWorld());assert.deepEqual(loaded,['4294967295',true,'flat','survival']);
 assert.equal(game.manager,null);assert.equal(ctx.Dimensions.current,'flat');assert.equal(ctx.OneBlock.count,0);
 assert.deepEqual(entries[1].data.edits,[[3,4,5,6]],'other save untouched');
 assert.deepEqual(entries[0].data.edits,[[1,2,3,4]],'old persisted data retained until new world saves');
 console.log('OK : bouton dès l’arrivée, confirmation, mode conservant le monde, graine/type conservés, sauvegardes isolées.');
})().catch(e=>{console.error(e);process.exitCode=1;});
