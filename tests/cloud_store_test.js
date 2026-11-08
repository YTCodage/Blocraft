const assert=require('assert');
(async()=>{
const {RoomStore}=await import('../src/cloud-store.mjs');const cells=new Map();let queue=Promise.resolve(),now=100000;
const clone=v=>v===undefined?null:structuredClone(v);
const db={get:async key=>clone(cells.get(key)),transaction:fn=>{const operation=queue.then(async()=>{const writes=[];const result=await fn({get:db.get,set:(key,value)=>writes.push([key,clone(value)])});for(const [k,v]of writes)cells.set(k,v);return result;});queue=operation.catch(()=>{});return operation;}};
const make=(id)=>new RoomStore(db,{uid:id,session:id+'-session',peerId:id+'-peer',nickname:id,now:()=>now});
const a=make('a'),b=make('b'),c=make('c');
const results=await Promise.all([a.open('flat'),b.open('flat'),c.open('flat')]);assert.deepEqual(results.map(r=>r.host),[true,false,false]);assert(results.every(r=>r.peerId==='a-peer'));
assert((await b.open('oneblock')).host);assert((await c.open('overworld')).host);assert.equal(await a.load('flat'),null);
const data={adminRealm:true,adminRealmType:'flat',dim:'flat',seed:42,edits:Array.from({length:30000},(_,i)=>[i,61,0,420])};await a.save('flat',data);assert.deepEqual(await b.load('flat'),data);assert([...cells].filter(([k])=>k.startsWith('adminWorlds/flat/state/')).length>2);
await assert.rejects(()=>b.save('flat',data),/bail/);now+=46000;await assert.rejects(()=>a.renew('flat'),/bail/);assert((await b.open('flat')).host);await assert.rejects(()=>a.save('flat',data),/bail/);assert.equal((await b.load('flat')).seed,42);
const next={...data,seed:99,edits:[]};await b.save('flat',next);assert.deepEqual(await b.load('flat'),next);await b.release('flat');assert((await c.open('flat')).host);await assert.rejects(()=>c.open('other'),/inconnu/);
await assert.rejects(()=>c.save('flat',{...data,huge:'é'.repeat(5*1024*1024)}),/volumineux/);
const unicode={adminRealm:true,adminRealmType:'flat',payload:''},marker='\"payload\":\"',prefix=JSON.stringify(unicode).indexOf(marker)+marker.length;unicode.payload='x'.repeat(179999-prefix)+'🚀'+'fin';await c.save('flat',unicode);assert.deepEqual(await c.load('flat'),unicode);assert([...cells.values()].filter(v=>v.payload).every(v=>Buffer.from(v.payload).toString('utf8')===v.payload));
console.log('OK : une élection concurrente par type, 3 mondes canoniques, bail/expiration/reprise, sauvegarde segmentée atomique, restauration, ancien hôte refusé, limite 8 Mio.');
})().catch(e=>{console.error(e);process.exitCode=1;});
