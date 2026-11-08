// Real PeerJS/WebRTC; deterministic cloud-store adapter, not a live Firebase-project test.
const {spawn}=require('child_process'),{chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const {RoomStore}=await import('../src/cloud-store.mjs');const docs=new Map();let serial=Promise.resolve();
 const clone=v=>v===undefined?null:structuredClone(v),db={get:async p=>clone(docs.get(p)),transaction:fn=>{const op=serial.then(async()=>{const writes=[],r=await fn({get:db.get,set:(p,v)=>writes.push([p,clone(v)])});for(const [p,v]of writes)docs.set(p,v);return r;});serial=op.catch(()=>{});return op;}};
 const signaling=spawn(process.execPath,['-e',"require('peer').PeerServer({host:'127.0.0.1',port:0,path:'/rooms'},s=>process.send({port:s.address().port}));"],{cwd:path.join(__dirname,'..'),stdio:['ignore','ignore','inherit','ipc']});
 const {port}=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Signaling timeout')),5000);signaling.once('message',v=>{clearTimeout(t);resolve(v);});});let browser;const pages=[],errors=[];
 try{
 browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const html=fs.readFileSync(path.join(__dirname,'..','blocraft.html'),'utf8').replace('  initGL();','').replace('  initSelection();','').replace("  try { Fx.init(); } catch (e) { console.error('Fx', e); }",'').replace('  newWorld(null, false);','  Game.state="menu";showOverlay("menu");').replace('  requestAnimationFrame(frame);\n}','}');
 const make=async(name)=>{
 const page=await browser.newPage({viewport:{width:390,height:844}});pages.push(page);page.on('pageerror',e=>errors.push(e.message));let store;const uid='browser-'+pages.length;
 await page.exposeFunction('cloudCall',async(op,args)=>{if(op==='init'){store=new RoomStore(db,{...args,uid});return;}if(op==='watch')return db.get('adminWorlds/'+args);return store[op](...(Array.isArray(args)?args:[args]));});
 await page.addInitScript(()=>{window.BlocraftCloud={connect:async options=>{await cloudCall('init',options);return {open:t=>cloudCall('open',t),renew:t=>cloudCall('renew',t),release:t=>cloudCall('release',t),load:t=>cloudCall('load',t),save:(t,d)=>cloudCall('save',[t,d]),watch:(t,callback,error)=>{const timer=setInterval(()=>cloudCall('watch',t).then(callback,error),100);return ()=>clearInterval(timer);}};}};localStorage.setItem('blocraft.profile.v1',JSON.stringify({role:'player'}));});
 await page.route('**/blocraft.html',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto(new URL('blocraft.html',process.env.SITE_URL||'http://127.0.0.1:8000/').href);await page.addScriptTag({path:path.join(__dirname,'..','assets/vendor/peerjs.min.js')});
 await page.evaluate(({port,name})=>{
  const NativePeer=window.Peer;window.Peer=function(id,options){return new NativePeer(id,{...options,host:'127.0.0.1',port,path:'/rooms',secure:false,config:{iceServers:[]}});};
  window.starts=0;window.messages=[];const raw=AdminCloud.rawMessage;AdminCloud.rawMessage=text=>{messages.push(JSON.parse(text));return raw(text);};
  RoleGate.nickname=name;Admin.me=name;Net.playerName=name;RoleGate.commit('creator');Game.inv=new Inventory();Player.pos=[.5,61,.5];
  window.world=(dim,edits=[])=>{window.cells=new Map(edits.map(e=>[e.slice(0,3).join(','),e[3]]));Game.manager={dim,chunks:new Map([[0,{}]]),editLog:new Map([['fixture',edits.slice()]]),heightAt:()=>60,getBlock:(x,y,z)=>cells.get([x,y,z].join(','))||0,setBlock(x,y,z,t){cells.set([x,y,z].join(','),t);this.editLog.get('fixture').push([x,y,z,t]);return true;},markDirty(){},ensureChunk(){}};Dimensions.current=dim;};
  newWorld=async(seed,flat,options={})=>{window.loadedWorld={seed,options};Game.seed=Number(seed)||123;OneBlock.count=options.oneblock?.count||0;world(options.dim||Game.startWorld,options.edits||[]);Game.adminRealm=true;Game.adminRealmType=options.adminRealmType||Game.adminRealmType;};
  saveGame=()=>{const e=Saves.current();if(e)e.data={seed:Game.seed,oneblock:{count:OneBlock.count},mode:'creative',adminRealm:true,adminRealmType:Game.adminRealmType,dim:Dimensions.current,edits:Game.manager?Game.manager.editLog.get('fixture'):[]};return true;};
  continueGame=async(entry,keep)=>{if(!keep)Net.reset();window.restored=entry;Game.seed=entry.data.seed;OneBlock.count=entry.data.oneblock?.count||0;Game.adminRealm=true;Game.adminRealmType=entry.data.adminRealmType;world(entry.data.dim,entry.data.edits);};
  startPlaying=()=>{starts++;Game.state='playing';hideOverlays();};AdminRealm.open();
 },{port,name});return page;
 };
 const host=await make('Admin hôte'),a=await make('Admin A'),b=await make('Admin B');
 await host.locator('#realmPlay').click();await host.locator('[data-realm-type="flat"]').click();await host.waitForFunction(()=>AdminCloud.ready&&Net.role==='host',null,{timeout:20000});
 await host.evaluate(()=>Game.manager.setBlock(2,61,2,B.DIAMOND,true));
 await a.locator('#realmPlay').click();await a.locator('[data-realm-type="flat"]').click();await a.waitForFunction(()=>AdminCloud.ready&&Net.role==='guest',null,{timeout:20000});
 assert(await a.evaluate(()=>loadedWorld.options.adminRealm&&loadedWorld.options.adminRealmType==='flat'&&loadedWorld.options.edits.some(e=>e[0]===2)&&Admin.isAdmin()));
 await b.evaluate(()=>AdminRealm.connect('flat'));await b.waitForFunction(()=>AdminCloud.ready&&Net.role==='guest',null,{timeout:20000});assert.equal(await host.evaluate(()=>AdminCloud.records.size),2);assert.equal(await a.evaluate(()=>starts),1,'joining a third Admin must not reload the first guest');
 // Both guests appear to each other and have unique vehicle ownership/targeted deductions.
 await a.evaluate(()=>Net.send(['p',1,61,3,0,0,20,Admin.me,'flat',null,false]));await b.evaluate(()=>Net.send(['p',4,61,5,0,0,20,Admin.me,'flat',null,false]));await b.waitForFunction(()=>[...AdminCloud.records.values()].some(r=>r.name==='Admin A'&&r.x===1));await a.waitForFunction(()=>[...AdminCloud.records.values()].some(r=>r.name==='Admin B'&&r.x===4));
 assert.equal(await host.evaluate(()=>CommandHub.players().length),3);assert.equal(await b.evaluate(()=>CommandHub.players().length),3);
 await a.evaluate(()=>{Net.send(['b',8,61,8,B.DRAGON_HEAD]);});await b.waitForFunction(()=>Game.manager.getBlock(8,61,8)===B.DRAGON_HEAD);assert(await host.evaluate(()=>Game.manager.getBlock(8,61,8)===B.DRAGON_HEAD));
 await host.evaluate(()=>{Game.inv.slots[0]={id:I.MINECART,n:3};});await a.evaluate(()=>{Game.inv.slots[0]={id:I.MINECART,n:3};Game.mode='survival';});await b.evaluate(()=>{Game.inv.slots[0]={id:I.MINECART,n:3};Game.mode='survival';});
 const idA=await a.evaluate(()=>AdminCloud.selfId);await host.evaluate(id=>Net.send(['vehicle-consumed',I.MINECART],id),idA);await a.waitForFunction(()=>Game.inv.count(I.MINECART)===2);assert.equal(await b.evaluate(()=>Game.inv.count(I.MINECART)),3);
 // Two different guests can board different carts; exiting one must not eject the other.
 await host.evaluate(()=>{Game.manager.setBlock(1,61,3,B.RAIL,true);Game.manager.setBlock(4,61,5,B.RAIL,true);});
 await a.evaluate(()=>Transport.request('cart',{x:1,y:61,z:3,block:B.RAIL}));await a.waitForFunction(()=>Railways.carts.length===1);
 await b.evaluate(()=>Transport.request('cart',{x:4,y:61,z:5,block:B.RAIL}));await b.waitForFunction(()=>Railways.carts.length===2);
 await a.waitForTimeout(250);await a.evaluate(()=>Transport.request('cart',{x:1,y:61,z:3,block:B.RAIL}));await b.evaluate(()=>Transport.request('cart',{x:4,y:61,z:5,block:B.RAIL}));await a.waitForFunction(()=>!!Railways.riding);await b.waitForFunction(()=>!!Railways.riding);
 assert.equal(await host.evaluate(()=>new Set(Railways.carts.map(c=>c.driver)).size),2);
 await a.waitForTimeout(250);await a.evaluate(()=>Transport.request('exit',null));await a.waitForFunction(()=>!Railways.riding);assert(await b.evaluate(()=>!!Railways.riding));
 const normal=await make('Admin normal'),mono=await make('Admin mono');await normal.evaluate(()=>AdminRealm.connect('overworld'));await mono.evaluate(()=>AdminRealm.connect('oneblock'));await normal.waitForFunction(()=>AdminCloud.ready);await mono.waitForFunction(()=>AdminCloud.ready);assert.equal(docs.size>3,true);assert.equal(await normal.evaluate(()=>Dimensions.current),'overworld');assert.equal(await mono.evaluate(()=>Dimensions.current),'oneblock');
 // An individual member can leave without closing the host or the other member.
 await a.evaluate(async()=>{await AdminCloud.shutdown();Net.reset();});await host.waitForFunction(()=>AdminCloud.records.size===1);assert(await b.evaluate(()=>AdminCloud.ready&&Net.live));
 // The shared monoblock is regenerated by the host; guest actions advance one common counter.
 await a.evaluate(()=>AdminRealm.connect('oneblock'));await a.waitForFunction(()=>AdminCloud.ready&&Net.role==='guest');await mono.evaluate(()=>Game.manager.setBlock(0,64,0,B.DIRT,true));
 await a.evaluate(()=>{Game.manager.setBlock(0,64,0,B.DIRT,true);Player.pos=[.5,65,.5];Net.send(['p',.5,65,.5,0,0,20,Admin.me,'oneblock',null,false]);});await mono.waitForFunction(()=>[...AdminCloud.records.values()].some(r=>r.y===65));
 await a.evaluate(()=>finishBreak({x:0,y:64,z:0,block:B.DIRT}));await mono.waitForFunction(()=>OneBlock.count===1);await a.waitForFunction(()=>OneBlock.count===1);assert.equal(await mono.evaluate(()=>OneBlock.count),1);
 // A final checkpoint survives the host leaving and a different browser becoming host.
 await host.evaluate(async()=>{saveGame();await AdminCloud.shutdown();Net.reset();});await b.waitForFunction(()=>!Net.live&&Game.state==='menu');await b.evaluate(()=>AdminRealm.connect('flat'));await b.waitForFunction(()=>AdminCloud.ready&&Net.role==='host',null,{timeout:20000});assert(await b.evaluate(()=>!!window.restored&&Game.manager.getBlock(8,61,8)===B.DRAGON_HEAD&&Game.manager.getBlock(2,61,2)===B.DIAMOND));
 // A Firebase activation error must not create a private, unsynchronized world.
 const blocked=await make('Admin bloqué');await blocked.evaluate(()=>{window.BlocraftCloud.connect=async()=>{throw Object.assign(Error('denied'),{code:'permission-denied'});};AdminRealm.connect('flat');});await blocked.waitForFunction(()=>$('realmStatus').textContent.includes('règles'));assert(!await blocked.evaluate(()=>AdminCloud.active||!!window.loadedWorld));
 assert.deepEqual(errors,[]);console.log('OK : cloud transactionnel simulé + vrais WebRTC, 3 Admins ensemble, pas de rechargement des autres, positions/TP/blocs relayés, messages ciblés, 3 types, départ individuel, sauvegarde/reprise sur autre navigateur, Firebase refusé sans fork local.');
 }finally{for(const p of pages)await p.evaluate(async()=>{await AdminCloud.shutdown();Net.reset();}).catch(()=>{});if(browser)await browser.close();signaling.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
