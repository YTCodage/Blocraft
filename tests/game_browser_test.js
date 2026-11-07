// WebGL/mobile integration test. npm run serve, then npm run test:game.
// Uses a small deterministic fixture instead of generating an infinite world.
const fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),
    args: ['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
  });
  try {
    const page = await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    let html=fs.readFileSync(path.join(__dirname,'..','blocraft.html'),'utf8');
    html=html.replace('  newWorld(null, false);','  Game.state = "menu"; showOverlay("menu");').replace('  requestAnimationFrame(frame);\n}', '}');
    await page.route('**/blocraft.html',route=>route.fulfill({contentType:'text/html',body:html}));
    const url=new URL('blocraft.html',process.env.SITE_URL||'http://127.0.0.1:8000/').href;
    await page.addInitScript(()=>localStorage.setItem('blocraft.profile.v1',JSON.stringify({role:'player'})));
await page.goto(url,{waitUntil:'load'});
    assert(await page.evaluate(()=>!!gl&&gl.getError()===0&&isTouch));
    assert.equal(await page.locator('#btnMode,#btnVision,#tBreak,#tPlace').count(),0);
    await page.evaluate(()=>{
      hideOverlays();Game.state='playing';Game.mode='creative';Game.slot=0;Game.inv=new Inventory();Game.inv.add(B.DIRT,64);
      Player.pos=[.5,4,1.5];Player.yaw=Player.pitch=0;Player.inWater=Player.headInWater=false;
      Mobile.fsTried=true;Mobs.list=[];Mobs.target=null;
      window.testCells=new Map([['0,5,-2',B.STONE]]);window.testWrites=0;
      Game.manager={dim:'flat',maxY:128,getBlock:(x,y,z)=>testCells.get([x,y,z].join(','))||0,setBlock:(x,y,z,t)=>{testCells.set([x,y,z].join(','),t);testWrites++;return true;},heightAt:()=>4};
    });
    const cdp=await page.context().newCDPSession(page);
    const touch=(type,x=422,y=195)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1}]});
    await Promise.all([touch('touchStart'),touch('touchEnd')]);
    assert.equal(await page.evaluate(()=>testWrites),1,'A tap should place exactly one block');
    await touch('touchStart');await page.waitForTimeout(450);
    assert(await page.evaluate(()=>Game.breakHeld&&TouchActions.mining));
    await page.evaluate(()=>updateBreaking(.2));await touch('touchEnd');
    assert.equal(await page.evaluate(()=>testWrites),2,'Hold should mine without placing on release');
    assert(!await page.evaluate(()=>Game.breakHeld||Game.placeHeld));
    await touch('touchStart');await touch('touchMove',490,200);await touch('touchEnd');
    assert.equal(await page.evaluate(()=>testWrites),2,'Dragging should not place blocks');
    const crafting=await page.evaluate(()=>{
      const r=Crafting.recipes.find(r=>r.out[0]===I.WSWORD);
      Crafting.tablePos=[1,4,0];testCells.set('1,4,0',B.CRAFTING);Crafting.forceTable=false;Crafting.nearTable=true;
      const inventoryLocked=!Crafting.unlocked(r);Crafting.forceTable=true;const tableUnlocked=Crafting.unlocked(r);
      testCells.delete('1,4,0');const destroyedLocked=!Crafting.unlocked(r);Crafting.forceTable=false;
      return {inventoryLocked,tableUnlocked,destroyedLocked,bedRestricted:Crafting.recipes.find(r=>r.out[0]===B.BED).stationOnly,bootstrap:!Crafting.recipes.find(r=>r.out[0]===B.CRAFTING).stationOnly,sheepDrops:MOB_DEFS.sheep.drops.some(d=>d[0]===B.WOOL_WHITE&&d[1]>=1),allRestricted:Crafting.recipes.filter(r=>ITEMS[r.out[0]]&&(ITEMS[r.out[0]].armor||ITEMS[r.out[0]].tool==='sword')).every(r=>r.stationOnly)};
    });
    assert(Object.values(crafting).every(Boolean));
    await page.evaluate(()=>{GameChat.send('<img src=x onerror=alert(1)>');GameChat.death('Tué par un zombie');GameChat.tick();});
    assert.equal(await page.locator('#chatLog img').count(),0);
    assert((await page.locator('#chatLog').textContent()).includes('tué par un zombie'));
    const rendering=await page.evaluate(()=>{
      WorldGen.init(123);Game.manager=new ChunkManager('flat');Game.mode='creative';Game.time=.32;
      const data=new Uint8Array(16*16*128),heights=new Float32Array(256).fill(60);
      const put=(x,y,z,t)=>data[x+16*z+256*y]=t;
      for(let x=0;x<16;x++)for(let z=0;z<16;z++){
        put(x,59,z,B.DIRT);put(x,60,z,x>=8&&x<=11?(x===8?B.WATER:B.WATER1+x-9):B.GRASS);
      }
      [B.CRAFTING,B.MARBLE,B.POLISHED_GRANITE,B.OAK_PARQUET,B.SLATE_TILES,B.LUMINOUS_BRICK].forEach((b,i)=>put(2+i,61,8,b));
      Mobs.add('sheep',6,61,6);
      const chunk=new Chunk(0,0,data,heights);Game.manager.chunks.set('0,0',chunk);Game.manager.buildMesh(chunk);
      Player.pos=[8,62,14];Player.yaw=0;Player.pitch=-.25;
      renderScene(0);
      return {solid:chunk.meshCount,water:chunk.waterCount,error:gl.getError(),newBlocks:EXTRA_BLOCKS.length};
    });
    assert(rendering.solid>0&&rendering.water>0&&rendering.error===0);
    if(process.env.GAME_SCREENSHOT)await page.screenshot({path:process.env.GAME_SCREENSHOT});
    await page.evaluate(()=>{Cinematics.play('intro');});
    await page.waitForTimeout(100);
    assert((await page.locator('#cinematic h1').textContent()).includes('De l’autre côté'));
    await page.locator('#cinematic button').click();
    assert.equal(await page.locator('#cinematic').count(),0);
    const reward = await page.evaluate(()=>{
      Dragon.defeated=false;
      const before=Game.inv.count(I.DIAMONDGEM);
      Dragon.onDeath();Dragon.onDeath();
      return Game.inv.count(I.DIAMONDGEM)-before;
    });
    assert.equal(reward,8,'Dragon death must only reward once');
    await page.waitForSelector('#cinematic');
    await page.waitForTimeout(100);
    assert((await page.locator('#cinematic h1').textContent()).includes('Le dernier battement'));
    assert(await page.evaluate(()=>Cinematics.scenes.ending.some(s=>s[0]==='Le dernier de son espèce')));
    await page.locator('#cinematic button').click();
    const beds=await page.evaluate(()=>{
      Game.state='playing';Game.mode='survival';Game.troll=false;Game.inv=new Inventory();Game.inv.add(B.BED,2);Player.pos=[4.5,61,7.5];Player.pitch=0;Player.yaw=0;
      const placed=Beds.place(4,61,5),head=Game.manager.getBlock(4,61,4),count=Game.inv.count(B.BED);
      finishBreak({x:4,y:61,z:4,block:head});const removed=Game.manager.getBlock(4,61,5)===0&&Game.manager.getBlock(4,61,4)===0&&Game.inv.count(B.BED)===2;
      Game.manager.setBlock(4,61,4,B.STONE,true);const obstructed=!Beds.place(4,61,5)&&Game.inv.count(B.BED)===2;Game.manager.setBlock(4,61,4,B.AIR,true);
      Game.mode='creative';let allDirections=true;for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){Player.yaw=angle;if(!Beds.place(4,61,5)){allDirections=false;continue;}const p=Beds.partner({x:4,y:61,z:5});allDirections=allDirections&&!!p&&Math.hypot(p.x-4,p.z-5)===1;finishBreak({x:4,y:61,z:5,block:B.BED});}
      return {placed,head:BLOCKS[head].bedHead,count,removed,obstructed,allDirections};
    });
    assert(beds.placed&&beds.head&&beds.count===1&&beds.removed&&beds.obstructed&&beds.allDirections,JSON.stringify(beds));
    await page.evaluate(()=>openMenuScreen());await page.locator('.modeBtn[data-mode=troll]').click();
    assert(await page.locator('#newgame').isVisible());assert.equal(await page.locator('#ngMode').textContent(),'Trolle');
    await page.evaluate(()=>{Game.state='playing';hideOverlays();});
    await page.locator('#trollButton').click();await page.locator('#trollSearch').fill('Mouton');await page.locator('#trollChoices button').filter({hasText:/^Mouton$/}).click();
    assert(await page.evaluate(()=>Game.troll&&Game.mode==='creative'&&Troll.local().def.model==='sheep'));
    await page.evaluate(()=>{Net.live=true;Net.remote={x:6,y:61,z:5,yaw:0,dim:Dimensions.current,morph:['block',B.GRASS]};if(Net.avatarMob().def.model!=='block')throw new Error('Remote disguise missing');renderScene(.1);Net.live=false;Net.remote=null;});
    await page.locator('#trollButton').click();await page.locator('#trollSearch').fill('Pierre');await page.locator('#trollChoices button').filter({hasText:/^Pierre$/}).click();
    assert(await page.evaluate(()=>Troll.morph[0]==='block'&&Troll.morph[1]===B.STONE));
    await page.locator('#trollButton').click();await page.locator('#trollView').click();assert(!await page.evaluate(()=>Troll.third));await page.locator('#trollView').click();await page.locator('#trollClose').click();
    assert(await page.evaluate(()=>saveGame()&&Saves.current().data.troll&&Saves.current().data.morph[0]==='block'));
    await page.evaluate(()=>renderScene(.1));assert.equal(await page.evaluate(()=>gl.getError()),0);await page.screenshot({path:'/tmp/blocraft-troll.png'});
    assert.deepEqual(errors,[]);
    console.log('OK : WebGL, gestes tactiles, établi, chat, eau, histoire, lit 2 cases/4 orientations/obstacle/butin unique, mode Trolle et déguisements locaux/distants.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
