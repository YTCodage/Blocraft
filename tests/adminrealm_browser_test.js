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
        newWorld=async(seed,flat,options)=>{window.loadedWorld={seed,options};if(options.dim)Dimensions.current=options.dim;Game.seed=Number(seed);Game.time=options.time;Player.pos=options.pos;};
        startPlaying=()=>{window.starts++;Game.state='playing';showOverlay(null);};
      },port);
      await page.locator('#btnOnline').click();await page.locator('#mpHostName').fill('Salle été '+Date.now()+' '+pages.length);return page;
    };
    const host=await makePage();const guest=await makePage(true);
    await host.evaluate(()=>{RoleGate.commit('creator');Game.adminRealm=true;Game.mode='creative';Dimensions.current='flat';Game.manager.dim='flat';});
    const publish=async()=>{
      await host.evaluate(async()=>{$('mpHostName').value='Admin fixture '+Date.now();await Net.host();});
      await host.waitForFunction(()=>!!ShortRooms.code,null,{timeout:15000});
      return await host.evaluate(()=>({code:ShortRooms.code,token:AdminRealm.token}));
    };
    // A correct invitation alone cannot join through the normal client without an Admin profile.
    let invitation=await publish();
    await guest.evaluate(({code,token})=>{AdminRealm.joinToken=token;Net.join(code);},invitation);
    await guest.waitForFunction(()=>received.some(m=>m[0]==='realm-challenge'));
    await guest.waitForFunction(()=>!Net.live,null,{timeout:15000});
    assert(!await guest.evaluate(()=>received.some(m=>m[0]==='h')));assert.equal(await host.evaluate(()=>starts),0);await host.waitForFunction(()=>!Net.live&&!ShortRooms.code);
    // Even a local Admin cannot enter with the wrong private invitation.
    invitation=await publish();
    await guest.evaluate(({code})=>{received=[];RoleGate.commit('creator');AdminRealm.joinToken='0'.repeat(48);Net.join(code);},invitation);
    await guest.waitForFunction(()=>received.some(m=>m[0]==='realm-denied'),null,{timeout:15000});
    assert(!await guest.evaluate(()=>received.some(m=>m[0]==='h')));await host.waitForFunction(()=>!Net.live&&!ShortRooms.code);
    // Valid HMAC challenge + Admin profile: normal world sync follows admission.
    invitation=await publish();
    await guest.evaluate(({code,token})=>{received=[];Admin.me='Admin invité';Net.playerName=Admin.me;AdminRealm.joinToken=token;Net.join(code);},invitation);
    await guest.waitForFunction(()=>window.loadedWorld&&starts===1,null,{timeout:15000}).catch(async e=>{console.log('HOST',await host.evaluate(()=>({received,live:Net.live,role:Net.role,admitted:AdminRealm.admitted,status:$('mpStatus').textContent,starts})));console.log('GUEST',await guest.evaluate(()=>({received,live:Net.live,role:Net.role,profile:RoleGate.role,status:$('mpStatus').textContent,starts})));throw e;});
    assert(await guest.evaluate(()=>loadedWorld.options.adminRealm&&loadedWorld.options.dim==='flat'&&Dimensions.current==='flat'&&Game.adminRealm&&Admin.isAdmin()));
    assert(await host.evaluate(()=>AdminRealm.admitted&&starts===1));
    // Remote ACLs can only be supplied by the host, never forged by a guest.
    await guest.evaluate(()=>Net.send(['a',['Intrus'],'Intrus']));
    await host.waitForFunction(()=>received.some(m=>m[0]==='a'));
    assert(!await host.evaluate(()=>(Net.remoteAdmins||[]).includes('Intrus')));
    // An Admin can nominate a connected player, who remembers the profile on this browser.
    await host.evaluate(()=>{Net.remote={x:0,y:65,z:0,name:'Admin invité',dim:'flat'};Admin.run('/retirer Admin invité');});
    await guest.waitForFunction(()=>!Admin.isAdmin());
    await guest.evaluate(()=>{RoleGate.role='player';RoleGate.apply();});
    await host.evaluate(()=>Admin.run('/admin Admin invité'));
    await guest.waitForFunction(()=>RoleGate.role==='creator'&&Admin.isAdmin());
    assert.equal(await guest.evaluate(()=>JSON.parse(localStorage.getItem(RoleGate.KEY)).role),'creator');
    assert(!await guest.evaluate(()=>QA.on));
    console.log('OK : WebRTC réel, salon Admin privé, accès sans profil/invitation refusé avant envoi du monde, mauvaise preuve refusée, HMAC valide accepté, ACL hôte, nomination et profil mémorisé sans QA.');
  } finally {
    for(const page of pages)await page.evaluate(()=>Net.reset()).catch(()=>{});
    if(browser)await browser.close();
    signaling.kill();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
