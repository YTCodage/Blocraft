// One question per screen; generation is stubbed so the test exercises UI/state only.
const fs=require('fs'),path=require('path'),assert=require('assert'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  let html=fs.readFileSync(path.join(__dirname,'..','blocraft.html'),'utf8').replace('  initGL();','').replace('  initSelection();','').replace("  try { Fx.init(); } catch (e) { console.error('Fx', e); }",'').replace('  newWorld(null, false);','  Game.state="menu";showOverlay("menu");').replace('  requestAnimationFrame(frame);\n}','}');
  await page.route('**/blocraft.html',r=>r.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(()=>localStorage.setItem('blocraft.profile.v1',JSON.stringify({role:'player'})));
  await page.goto(new URL('blocraft.html',process.env.SITE_URL||'http://127.0.0.1:8000/').href);
  await page.evaluate(()=>{window.created=[];Cinematics.play=async()=>new Promise(r=>setTimeout(r,60));window.__startFromMenu=async fresh=>{created.push({fresh,world:Game.startWorld,mode:Game.mode,troll:Game.troll,name:Saves.currentName,seed:$('seedInput').value});Game.state='playing';hideOverlays();};});
  assert(!await page.locator('#menu .modeRow').isVisible());assert(!await page.locator('#menu .worldGrid').isVisible());
  const step=async n=>{assert.equal(await page.locator('#ngProgress').getAttribute('aria-valuenow'),String(n));assert.equal(await page.locator('#newgame [data-step]:visible').count(),1);assert(await page.locator(`#newgame [data-step="${n-1}"]`).isVisible());};
  await page.locator('#btnPlay').click();await step(1);assert(await page.locator('#ngBack').isDisabled());
  await page.locator('.wizardWorld[data-world=flat]').click();await page.locator('#ngStart').click();await step(2);assert(await page.locator('.wizardMode[data-mode=survival]').isDisabled());
  await page.locator('.wizardMode[data-mode=troll]').click();await page.locator('#ngBack').click();await step(1);await page.locator('#ngStart').click();assert.equal(await page.locator('.wizardMode[data-mode=troll]').getAttribute('aria-pressed'),'true');
  assert(await page.evaluate(()=>Game.mode==='survival'&&!Game.troll&&Game.startWorld==='overworld'));
  await page.locator('#ngStart').click();await step(3);await page.locator('#ngStart').click();await step(3);assert((await page.locator('#ngError').textContent()).includes('3 à 28'));assert.equal(await page.evaluate(()=>created.length),0);
  await page.locator('#ngName').fill('Mon monde guidé');await page.locator('#ngName').press('Enter');await step(4);await page.locator('#wizardSeed').fill('terrain-test');
  await page.locator('#ngBack').click();await step(3);assert.equal(await page.locator('#ngName').inputValue(),'Mon monde guidé');await page.locator('#ngStart').click();assert.equal(await page.locator('#wizardSeed').inputValue(),'terrain-test');
  await page.evaluate(()=>{$('ngStart').click();$('ngStart').click();});await page.waitForFunction(()=>created.length===1);
  assert.deepEqual(await page.evaluate(()=>created[0]),{fresh:true,world:'flat',mode:'creative',troll:true,name:'Mon monde guidé',seed:'terrain-test'});
  await page.evaluate(()=>openMenuScreen());await page.locator('#btnPlay').click();await page.locator('.wizardWorld[data-world=oneblock]').click();await page.locator('#ngCancel').click();assert(await page.evaluate(()=>Game.startWorld==='flat'&&Game.troll));
  for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});await page.locator('#btnPlay').click();await step(1);assert(await page.evaluate(()=>{const r=document.querySelector('#newgame .ngPanel').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}));await page.locator('#ngCancel').click();}
  assert.deepEqual(errors,[]);console.log('OK : création 4 étapes, une seule question, progression, retour sans perte, validation nom, graine facultative, confirmation unique, annulation sans mutation et 320/390/1280 px.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
