// New UI/state integration; physics/world generation is replaced by a small terrain fixture.
const fs=require('fs'),path=require('path'),assert=require('assert'),{chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const html=fs.readFileSync(path.join(__dirname,'..','blocraft.html'),'utf8').replace('  initGL();','').replace('  initSelection();','').replace("  try { Fx.init(); } catch (e) { console.error('Fx', e); }",'').replace('  newWorld(null, false);','  Game.state="menu";showOverlay("menu");').replace('  requestAnimationFrame(frame);\n}','}');
 await page.route('**/blocraft.html',r=>r.fulfill({contentType:'text/html',body:html}));
 await page.addInitScript(()=>{localStorage.setItem('blocraft.profile.v1',JSON.stringify({role:'creator'}));localStorage.setItem('blocraft_qa_v1',JSON.stringify({on:true,xray:true,esp:true}));});
 await page.goto(new URL('blocraft.html',process.env.SITE_URL||'http://127.0.0.1:8000/').href);
 assert(await page.evaluate(()=>RoleGate.role==='creator'&&Admin.owner&&!QA.on&&!QA.xray&&!QA.esp));
 assert((await page.locator('#btnProfile').textContent()).includes('Admin'));
 await page.evaluate(()=>{
  window.prepare=()=>{Game.inv=new Inventory();Game.manager={chunks:new Map([[0,{}]]),dim:'overworld',editLog:new Map(),getBlock:(x,y,z)=>y<60?B.STONE:B.AIR,setBlock(){},heightAt:()=>59,ensureChunk(){}};Player.pos=[5,61,5];Player.vel=[0,0,0];Game.spawn=[5,61,5];Game.mode='creative';Game.hardcore=false;Game.hardcoreDead=false;Game.adminRealm=false;Survival.dead=false;Game.state='playing';hideOverlays();};prepare();
 });
 await page.evaluate(()=>Admin.openBar('/'));assert(await page.locator('#commandMenu').isVisible());
 for(const cmd of ['tp','dim','troll','hardcore','donner','kit','admin','retirer','capacite','mondeadmin','structures','vitesse'])assert(await page.locator('#commandMenu button').filter({hasText:new RegExp('^/'+cmd+'(?:\\s|$)')}).count()>0,cmd);
 await page.locator('#cmdInput').fill('/tp');await page.locator('#cmdInput').press('Enter');assert((await page.locator('#commandMenu h3').textContent()).includes('Où'));
 await page.locator('#commandMenu button').filter({hasText:'Vers un joueur'}).click();assert((await page.locator('#commandMenu h3').textContent()).includes('Quel joueur'));
 await page.evaluate(()=>CommandHub.open('/donner diamant'));assert((await page.locator('#commandMenu h3').textContent()).includes('Quel objet'));await page.locator('#commandMenu button').first().click();assert((await page.locator('#commandMenu h3').textContent()).includes('quantité'));await page.locator('#commandMenu button').filter({hasText:/^8$/}).click();assert(await page.evaluate(()=>Game.inv.slots.some(s=>s&&s.n===8)));
 await page.evaluate(()=>{Admin.closeBar();document.activeElement.blur();window.dispatchEvent(new KeyboardEvent('keydown',{key:'/',code:'Period',bubbles:true}));});assert.equal(await page.locator('#cmdInput').inputValue(),'/');
 // An absent player must never silently teleport to some other peer.
 assert(await page.evaluate(()=>{Net.live=true;Net.role='host';Net.remote={x:12,y:61,z:8,name:'Ami exact',dim:'overworld'};const before=Player.pos.slice();Admin.run('/tp introuvable');return Player.pos.every((v,i)=>v===before[i]);}));
 await page.evaluate(()=>CommandHub.open('/tp joueur'));await page.locator('#commandMenu button').filter({hasText:'Ami exact'}).click();assert.deepEqual(await page.evaluate(()=>Player.pos),[12,61,8]);
 await page.evaluate(()=>{Net.live=false;Net.remote=null;Net.role=null;Admin.openBar('/dim');window.destination=null;Dimensions.go=(dim,pos)=>destination={dim,pos};});
 await page.locator('#commandMenu button').filter({hasText:/^End$/}).click();assert.equal(await page.evaluate(()=>destination.dim),'end');
 await page.evaluate(()=>{Admin.run('/troll');Troll.choose(['mob','enderman']);});assert(await page.evaluate(()=>Game.troll&&Survival.maxHealth===40&&Player.height===2.55&&MorphPowers.stats().teleport));
 await page.evaluate(()=>{Player.pos=[0,65,0];Player.yaw=0;Player.pitch=0;MorphPowers.use();});assert(await page.evaluate(()=>Player.pos[2]<-1));
 await page.evaluate(()=>{Troll.choose(['mob','chicken']);});assert(await page.evaluate(()=>Survival.maxHealth===4&&MorphPowers.stats().glide&&MorphPowers.immune('Chute de 8 blocs')));
 await page.evaluate(()=>{Troll.choose(['mob','blaze']);});assert(await page.evaluate(()=>Player.flying&&MorphPowers.immune('La lave')));
 await page.evaluate(()=>{Troll.choose(['block',B.STONE]);});assert(await page.evaluate(()=>MorphPowers.stats().speed===0&&Player.height===1));
 assert(await page.evaluate(()=>{window.exploded=0;window.died=0;Mobs.explode=()=>exploded++;const die=Survival.die;Survival.die=()=>died++;Troll.choose(['mob','creeper']);MorphPowers.use();const fuse=MorphPowers.fuseUntil>performance.now()&&exploded===0;MorphPowers.fuseUntil=performance.now()-1;MorphPowers.tick(.1);Survival.die=die;return fuse&&exploded===1&&died===1;}));
 assert(await page.evaluate(()=>{Troll.choose(['mob','cow']);Survival.invuln=0;Survival.health=10;Survival.hurt(3,'Test attaque');return Survival.health===7&&Game.mode==='creative';}));
 // Preview is rendered from 3D cuboids, follows the pointer, and supports drag/keyboard rotation.
 await page.evaluate(()=>{prepare();window.GAME_ATLAS=generateTextureAtlas();openInventory();});
 assert(await page.evaluate(()=>{const c=$('skinPreview'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>50&&d[i+1]>50)n++;return n>1000;}));
 const beforeYaw=await page.evaluate(()=>Preview3D.yaw);const box=await page.locator('#skinPreview').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height/2);await page.mouse.up();assert.notEqual(await page.evaluate(()=>Preview3D.yaw),beforeYaw);
 await page.mouse.move(10,10);assert(await page.evaluate(()=>Preview3D.headYaw!==0));await page.locator('#skinPreview').focus();await page.keyboard.press('ArrowRight');
 await page.screenshot({path:'/tmp/blocraft-inventory-3d.png'});
 // Hardcore cannot be exited by mode, teleport, QA or respawn; the terminal state is saved.
 assert(await page.evaluate(()=>{prepare();Game.troll=false;Troll.morph=null;MorphPowers.apply();Admin.run('/hardcore');const p=Player.pos.slice();Admin.run('/troll');Admin.run('/tp 50 70 50');QA.unlock();return Game.hardcore&&Game.mode==='survival'&&!Game.troll&&!QA.on&&Player.pos.every((v,i)=>v===p[i]);}));
 assert(await page.evaluate(()=>{Saves.begin('Hardcore test','overworld','hardcore');Survival.health=20;Survival.invuln=0;Survival.hurt(2,'Test dégâts');if(Survival.health!==17)return false;Survival.die('Test Hardcore');respawnAfterDeath();return Game.hardcoreDead&&Game.state==='dead'&&Saves.current().data.hardcoreDead&&Saves.current().data.hardcore&&$('btnRespawn').disabled;}));
 // QA state is not restored but the Admin role is.
 await page.evaluate(()=>{Game.hardcore=false;QA.on=true;QA.xray=true;QA.save();});await page.reload();assert(await page.evaluate(()=>RoleGate.role==='creator'&&Admin.owner&&!QA.on&&!QA.xray&&QA.speedMul===1&&Saves.list.some(e=>e.data&&e.data.hardcoreDead)));
 assert.deepEqual(errors,[]);console.log('OK : palette /, choix joueurs/dimensions, nom exact, capacités/attributs, explosion différée, aperçu 3D interactif, Hardcore définitif, Admin mémorisé et QA temporaire.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
