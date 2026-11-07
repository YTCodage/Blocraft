// Local profile/PIN UI test. Uses a test-only PIN verifier, never a production secret.
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto'),{chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let html=fs.readFileSync(path.join(__dirname,'..','blocraft.html'),'utf8').replace('  initGL();','').replace('  initSelection();','').replace("  try { Fx.init(); } catch (e) { console.error('Fx', e); }",'').replace('  newWorld(null, false);','  Game.state="menu";showOverlay("menu");').replace('  requestAnimationFrame(frame);\n}','}');
 await page.route('**/blocraft.html',r=>r.fulfill({contentType:'text/html',body:html}));
 const url=new URL('blocraft.html',process.env.SITE_URL||'http://127.0.0.1:8000/').href;
 await page.goto(url);assert(await page.locator('#profile').isVisible());assert(!await page.locator('#menu').isVisible());
 await page.locator('#chooseCreator').click();assert(!await page.locator('#profileRoleChoices').isVisible());assert.equal(await page.locator('#profileProgress').getAttribute('aria-valuenow'),'2');await page.locator('#creatorPin').fill('000000');await page.locator('#creatorPinSubmit').click();await page.waitForFunction(()=>document.querySelector('#profileError').textContent.includes('incorrect'));assert(!await page.evaluate(()=>Admin.owner));
 await page.locator('#creatorPinBack').click();await page.locator('#choosePlayer').click();assert(await page.locator('#menu').isVisible());assert.equal(await page.evaluate(()=>RoleGate.role),'player');assert(!await page.evaluate(()=>Admin.owner));
 await page.evaluate(()=>Admin.run('proprietaire'));assert(!await page.evaluate(()=>Admin.owner));
 await page.reload();assert(await page.locator('#menu').isVisible());assert(!await page.locator('#profile').isVisible());
 await page.locator('#btnProfile').click();await page.locator('#chooseCreator').click();
 const testHash=crypto.createHash('sha256').update('123456').digest('hex');await page.evaluate(h=>RoleGate.HASH=h,testHash);
 await page.locator('#creatorPin').fill('123456');await page.locator('#creatorPinSubmit').click();await page.waitForFunction(()=>RoleGate.role==='creator');assert(await page.evaluate(()=>Admin.owner&&Admin.isAdmin()));assert.equal(await page.locator('#creatorPin').inputValue(),'');assert(!await page.locator('#btnCreatorAdmin').evaluate(e=>e.classList.contains('hidden')));
 await page.reload();assert(await page.evaluate(()=>RoleGate.role==='creator'&&Admin.owner));
 await page.locator('#btnProfile').click();await page.locator('#choosePlayer').click();assert(!await page.evaluate(()=>Admin.owner));
 assert.deepEqual(errors,[]);console.log('OK : premier choix Créateur/Joueur, code incorrect refusé, Joueur inchangé, ancien owner non contournant, code correct, droits admin, persistance et changement de profil sur mobile.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
