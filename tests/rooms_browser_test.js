// A local PeerServer exercises the real vendored PeerJS + WebRTC transport.
// No public signaling service is needed for this test. npm run serve first.
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), assert = require('assert');
(async () => {
  const signaling = spawn(process.execPath,['-e',"require('peer').PeerServer({host:'127.0.0.1',port:0,path:'/rooms',allow_discovery:false},s=>process.send({port:s.address().port}));"],{cwd:path.join(__dirname,'..'),stdio:['ignore','ignore','inherit','ipc']});
  const {port} = await new Promise((resolve,reject)=>{ const t=setTimeout(()=>{signaling.kill();reject(new Error('Signaling server startup timed out'));},5000); signaling.once('message',m=>{clearTimeout(t);resolve(m);}); });
  let browser;
  const pages=[];
  try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),
    args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
  });
    let html=fs.readFileSync(path.join(__dirname,'..','blocraft.html'),'utf8');
    html=html.replace('  initGL();','').replace('  initSelection();','').replace("  try { Fx.init(); } catch (e) { console.error('Fx', e); }",'')
      .replace('  newWorld(null, false);','  Game.state="menu";showOverlay("menu");').replace('  requestAnimationFrame(frame);\n}', '}');
    const makePage=async(mobile=false)=>{
      const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1000,height:750},isMobile:mobile,hasTouch:mobile});pages.push(page);
      await page.route('**/blocraft.html',r=>r.fulfill({contentType:'text/html',body:html}));
      await page.addInitScript(()=>localStorage.setItem('blocraft.profile.v1',JSON.stringify({role:'player'})));
await page.goto(new URL('blocraft.html',process.env.SITE_URL||'http://127.0.0.1:8000/').href);
      await page.addScriptTag({path:path.join(__dirname,'..','assets/vendor/peerjs.min.js')});
      await page.evaluate(port=>{
        const NativePeer=window.Peer;
        window.Peer=function(id,options){return new NativePeer(id,{...options,host:'127.0.0.1',port,path:'/rooms',secure:false,config:{iceServers:[]}});};
        window.received=[];window.starts=0;
        const originalMessage=Net.onMessage.bind(Net);
        Net.onMessage=raw=>{received.push(JSON.parse(raw));originalMessage(raw);};
        Game.seed=123;Game.time=.8;
        Game.manager={chunks:new Map([[0,{}]]),editLog:new Map()};
        newWorld=async(seed,flat,options)=>{window.loadedWorld={seed,options};Game.seed=Number(seed);Game.time=options.time;Player.pos=options.pos;};
        startPlaying=()=>{window.starts++;Game.state='playing';showOverlay(null);};
      },port);
      await page.locator('#btnOnline').click();await page.locator('#mpHostName').fill('Salle été '+Date.now()+' '+pages.length);return page;
    };
    const host=await makePage();await host.evaluate(()=>{Game.troll=true;Game.mode='creative';});await host.locator('#btnMpHost').click();
    await host.waitForFunction(()=>/^\d{6}$/.test(document.querySelector('#mpCodeOut').value),null,{timeout:15000});
    const roomName=await host.locator('#mpHostName').inputValue();const code=await host.locator('#mpCodeOut').inputValue();assert(/^\d{6}$/.test(code));
    // An occupied code is retried, without the destroyed peer cancelling its replacement.
    const collision=await makePage();
    await collision.evaluate(code=>{let i=0;ShortRooms.randomCode=()=>i++?(code==='900001'?'900002':'900001'):code;},code);
    await collision.locator('#btnMpHost').click();
    await collision.waitForFunction(code=>/^\d{6}$/.test(document.querySelector('#mpCodeOut').value)&&document.querySelector('#mpCodeOut').value!==code,code,{timeout:15000});
    await collision.evaluate(()=>Net.reset());
    await collision.locator('#mpHostName').fill(roomName);await collision.locator('#btnMpHost').click();
    await collision.waitForFunction(()=>document.querySelector('#mpStatus').textContent.includes('déjà utilisé'));
    assert(!await collision.evaluate(()=>Net.live));
    await collision.locator('#mpHostName').fill('Annulation '+Date.now());
    await collision.evaluate(()=>{ShortRooms.host();Net.reset();});
    assert(!await collision.evaluate(()=>ShortRooms.busy||ShortRooms.peer||Net.live));
    const guest=await makePage(true);await guest.locator('#btnMpJoin').click();await guest.locator('#mpJoinIn').fill(roomName.toUpperCase());await guest.evaluate(()=>{busyLoading=true;setTimeout(()=>busyLoading=false,1500);});await guest.locator('#btnMpAnswer').click();
    await host.waitForFunction(()=>Net.live&&starts===1,null,{timeout:15000});
    await guest.waitForFunction(()=>Net.live&&window.loadedWorld&&loadedWorld.seed==='123'&&loadedWorld.options.troll&&starts===1,null,{timeout:15000});
    await guest.evaluate(()=>Net.send(['chat','Bonjour avec six chiffres']));
    await host.waitForFunction(()=>received.some(m=>m[1]==='Bonjour avec six chiffres'));
    await guest.evaluate(()=>Net.send(['large-fixture','x'.repeat(100000)]));
    await host.waitForFunction(()=>received.some(m=>m[0]==='large-fixture'&&m[1].length===100000));
    // Code validation never destroys an established connection.
    await host.evaluate(async()=>{$('partyName').value='Partie bis '+Date.now();await RoomNames.rename();});
    await guest.waitForFunction(()=>Saves.currentName.startsWith('Partie bis'));
    assert(await host.evaluate(()=>Net.live));
    await guest.evaluate(()=>ShortRooms.join('123'));assert(await guest.evaluate(()=>Net.live));
    // Vehicle ownership, guest inputs and weather really traverse the data channel.
    for(const p of [host,guest])await p.evaluate(()=>{window.cells=new Map([['0,61,0',B.RAIL],['0,61,-1',B.RAIL],['0,61,-2',B.RAIL]]);Game.manager={dim:'flat',chunks:new Map(),editLog:new Map([['fixture',[]]]),redDust:new Set(),redDevices:new Set(),getBlock:(x,y,z)=>cells.get([x,y,z].join(','))||0,setBlock:(x,y,z,t)=>{cells.set([x,y,z].join(','),t);return true;},markDirty(){},heightAt:()=>60};Dimensions.current='flat';Game.mode='survival';Game.inv=new Inventory();Game.slot=0;Game.inv.slots[0]={id:I.MINECART,n:2};Player.pos=[.5,61,.5];Player.yaw=Player.pitch=0;Railways.carts=[];Railways.riding=null;Boats.list=[];Boats.riding=null;Mobs.reset();Net.remote={x:.5,y:61,z:.5,yaw:0,dim:'flat',name:'Invité'};});
    await guest.evaluate(()=>Railways.use({x:0,y:61,z:0,block:B.RAIL}));
    await guest.waitForFunction(()=>Railways.carts.length===1&&Game.inv.count(I.MINECART)===1);
    await guest.waitForTimeout(250);await guest.evaluate(()=>Railways.use({x:0,y:61,z:0,block:B.RAIL}));await guest.waitForFunction(()=>!!Railways.riding);
    assert(await host.evaluate(()=>Railways.carts[0].driver==='guest'&&!Railways.riding));
    await host.evaluate(()=>{Railways.update(.1);Transport.broadcast();});await guest.waitForFunction(()=>Railways.riding&&Railways.riding.pos[2]<.5);
    await host.evaluate(()=>{Game.inv.slots[0]=null;Railways.use({x:0,y:61,z:0,block:B.RAIL});});assert(!await host.evaluate(()=>Railways.riding));
    await guest.waitForTimeout(250);await guest.evaluate(()=>Transport.request('exit',null));await guest.waitForFunction(()=>!Railways.riding);assert.equal(await host.evaluate(()=>Railways.carts[0].driver),null);
    await host.evaluate(()=>Weather.set('orage'));await guest.waitForFunction(()=>Weather.kind==='orage');
    await host.evaluate(()=>{Mobs.add('zombie',.5,61,-7);});await guest.evaluate(()=>{Game.inv.slots[0]={id:I.BOW,n:1};Game.inv.slots[1]={id:I.ARROW,n:2};Archery.shoot();});await host.waitForFunction(()=>Archery.list.length===1);await guest.waitForFunction(()=>Archery.list.length===1&&Archery.list[0].visualOnly);
    await host.evaluate(()=>{for(let i=0;i<40;i++)Archery.update(.02);});assert.equal(await host.evaluate(()=>Mobs.list[0].hp),13);
    assert.equal(await guest.evaluate(()=>Game.inv.count(I.ARROW)),1);
    const third=await makePage();await third.locator('#btnMpJoin').click();await third.locator('#mpJoinIn').fill(code);await third.locator('#btnMpAnswer').click();
    await third.waitForFunction(()=>document.querySelector('#mpStatus').classList.contains('err'),null,{timeout:25000});
    assert(!await third.evaluate(()=>Net.live));assert(await host.evaluate(()=>Net.live));assert(await guest.evaluate(()=>Net.live));
    await third.evaluate(()=>ShortRooms.join('000000'));
    await third.waitForFunction(()=>document.querySelector('#mpStatus').textContent.toLowerCase().includes('aucune partie'),null,{timeout:15000});
    await guest.evaluate(()=>Net.reset());await host.waitForFunction(()=>!Net.live);
    assert.equal(await host.locator('#mpCodeOut').inputValue(),'');
    console.log('OK : PeerJS/WebRTC local, nom exact Unicode/casse, nom occupé, ancien code, renommage sans déconnexion, handshake Trolle, message 100 Ko, wagon invité autoritaire/exclusion/décompte, météo, arc visuel invité/dégâts hôte, 3e joueur refusé et fermeture.');
  } finally {
    for(const page of pages)await page.evaluate(()=>Net.reset()).catch(()=>{});
    if(browser)await browser.close();
    signaling.kill();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
