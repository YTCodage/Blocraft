const assert=require('assert');
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('blocraft.html','utf8');
const chunkSource=html.slice(html.indexOf('class Chunk {'),html.indexOf('/* ----------------------- upload WebGL',html.indexOf('class Chunk {')));
const B={AIR:0,STONE:1};
const world=vm.createContext({Math,Map,Set,Uint16Array,Float32Array,console,B,BLOCKS:[{},{solid:true}],SEA:62,
  WorldGenFlat:{generateChunk(){const data=new Uint16Array(16*128*16),heights=new Float32Array(256);heights.fill(60);data[1+16*(2+16*60)]=1;return {data,HEIGHTS:heights,trees:[]};}},
  WorldGen:{},WorldGenNether:{},WorldGenEnd:{},WorldGenOneBlock:{}});
vm.runInContext('const CHUNK=16,GEN_HEIGHT=128,WH=365;'+chunkSource+'\nthis.ChunkManager=ChunkManager;',world);
const mgr=new world.ChunkManager('flat');mgr.buildMesh=()=>{};
let c=mgr.ensureChunk(0,0);assert.equal(c.data.length,16*128*16,'empty upper world does not triple RAM');
assert.equal(mgr.getBlock(1,60,2),B.STONE);
assert(mgr.setBlock(1,364,2,B.STONE,true));assert.equal(mgr.getBlock(1,364,2),B.STONE);
assert.equal(mgr.setBlock(1,365,2,B.STONE,true),false,'Y=365 is forbidden');
assert.equal(c.topY,364);assert.equal(c.upper.size,1);assert.equal(mgr.heightAt(1,2),364);
mgr.chunks.clear();c=mgr.ensureChunk(0,0);
assert.equal(mgr.getBlock(1,364,2),B.STONE,'high edit replayed after chunk eviction');
assert(mgr.setBlock(1,364,2,B.AIR,true));assert.equal(c.topY,127,'upper mesh range contracts after deletion');

const local=new Map();const disk=new Map();
function indexedDB(){return {open(){const req={};setTimeout(()=>{req.result={createObjectStore(){},transaction(){const tx={objectStore(){return {put(value,key){disk.set(key,structuredClone(value));setTimeout(()=>tx.oncomplete?.(),0);},get(key){const r={};setTimeout(()=>{r.result=structuredClone(disk.get(key));r.onsuccess?.();},0);return r;},delete(key){disk.delete(key);}};}};return tx;}};req.onupgradeneeded?.();req.onsuccess?.();},0);return req;}};}
local.set('blocraft.saves.v2',JSON.stringify([{id:'legacy',name:'Old',world:'flat',mode:'creative',data:{seed:37,time:.76,pos:[5,64,2]}}]));
const saveSource=html.slice(html.indexOf('const SAVE_KEY ='),html.indexOf('function fmtSaveDate('));
function context(){const ctx=vm.createContext({localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)},indexedDB:indexedDB(),
  setTimeout,clearTimeout,Date,Map,Set,JSON,Math,structuredClone,console,Game:{seed:11},HUD:{toastText(){}},updateContinueButton(){}});
  vm.runInContext(saveSource+'\nthis.Saves=Saves;',ctx);return ctx;
}
(async()=>{
  let ctx=context(),s=ctx.Saves;await s.ready;assert(disk.has('legacy'),'legacy world moved to indexedDB');assert(!local.has('blocraft.saves.v2'),'old key removed only after migration');
  assert.equal(JSON.parse(local.get('blocraft.saves.v3'))[0].data,undefined,'metadata does not duplicate world payload');
  const one=s.begin('First','flat','creative');assert(one);assert(s.write({seed:11,time:.23,pos:[8,80,9]}));assert(await s.flush());
  const admin=s.adminSession('flat','Admin · flat',{seed:8});assert(admin);assert(s.write({seed:8,adminRealm:true}));assert.equal(s.list.length,2,'Admin session is not another local save');
  s.sessionEntry=null;s.currentId=null;
  for(let i=s.list.length;i<500;i++)assert(s.begin('Partie '+i,'overworld','survival'));
  assert.equal(s.list.length,500);assert.equal(s.begin('Too many','flat','creative'),null,'no silent deletion at 500');
  ctx=context();s=ctx.Saves;await s.ready;
  const old=s.get('legacy'),fresh=s.get(one.id);assert(old.hasData&&fresh.hasData);
  assert.equal((await s.read(old)).time,.76);assert.equal((await s.read(fresh)).pos[0],8);
  assert.equal(s.list.length,500);
  console.log('OK : hauteur Y=364 et chunks supérieurs légers, relecture de blocs élevés, migration IDB, 500 sauvegardes et monde Admin unique.');
})().catch(e=>{console.error(e);process.exitCode=1;});
