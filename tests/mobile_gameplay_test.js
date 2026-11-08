// Test de logique déterministe, sans WebGL : npm test
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'blocraft.html'), 'utf8');
const object = name => { const a=html.indexOf(`const ${name} = {`),b=html.indexOf('\n};',a)+3; return html.slice(a,b)+`\nthis.${name}=${name};`; };
let timeout, placed=0, attacks=0, targets=0, closed=false, now=10000;
const messages=[],packets=[];
const ctx=vm.createContext({ Math, Map, Set, Infinity, performance:{now:()=>now},
  setTimeout(fn){timeout=fn;return 1;},clearTimeout(){timeout=null;},
  canvas:{getBoundingClientRect:()=>({left:0,top:0,width:800,height:400})},
  Game:{state:'playing',mode:'survival',manager:{dim:'overworld'},breakHeld:false,placeHeld:false},
  Player:{yaw:0,pitch:0,headInWater:false}, Breaking:{progress:0,key:''},
  Admin:{barOpen:()=>closed,me:'Alice',closeBar(){},run(){}}, Mobile:{buzz(){}},
  lookDir:()=>[0,0,-1], eyePos:()=>[0,1.6,0],raycastVoxel:()=>({block:1,x:0,y:1,z:-1,dist:1}),
  entityRaycast:()=>null,updateTarget(){targets++;},useAction(){placed++;ctx.Game.placeHeld=true;},tryAttack(){attacks++;},Mobs:{target:null},
  Net:{live:true,playerName:'Alice',remote:{name:'Bob'},send:p=>packets.push(p)},
  $:()=>null,document:{body:{classList:{toggle(){}}}},
});
vm.runInContext(object('TouchActions')+object('GameChat'),ctx);
const T=ctx.TouchActions;
T.begin(1,400,200);T.end(1,false);assert.equal(placed,1);assert(!ctx.Game.placeHeld);assert(!ctx.Game.breakHeld);
T.begin(1,400,200);timeout();assert(T.mining);assert(ctx.Game.breakHeld);assert.equal(targets,1);T.end(1,false);assert.equal(placed,1);assert(!T.mining);
T.begin(1,400,200);T.move(1,450,200);assert.equal(timeout,null);T.end(1,false);assert.equal(placed,1);
T.begin(1,400,200);T.end(1,true);assert.equal(placed,1);
T.begin(1,400,200);timeout();T.move(1,450,200);assert(!ctx.Game.breakHeld);T.end(1,false);assert.equal(placed,1);
T.begin(1,400,200);T.end(2,false);assert(T.gesture);T.reset();assert(!T.gesture);
T.begin(1,400,200);T.begin(2,500,200);T.end(1,false);assert.equal(T.gesture.id,2);T.reset();
closed=true;T.begin(1,400,200);assert(!T.gesture);closed=false;
ctx.Game.state='paused';T.begin(1,400,200);assert(!T.gesture);ctx.Game.state='playing';
const center=T.direction(400,200);assert(Math.abs(center[2]+1)<1e-8);assert(T.direction(600,200)[0]>0);assert(T.direction(400,100)[1]>0);
ctx.GameChat.add=(text,kind)=>messages.push({text,kind});
ctx.GameChat.send('Bonjour !');assert.equal(messages[0].text,'Alice : Bonjour !');assert.equal(packets[0][0],'chat');
ctx.GameChat.send('trop vite');assert.equal(packets.length,1);now+=1000;
ctx.GameChat.receive('chat','<script>alert(1)</script>');assert(messages.some(m=>m.text==='Bob : <script>alert(1)</script>'));
now+=500;ctx.GameChat.death('Tué par un zombie');assert(messages.some(m=>m.text==='Alice est mort, tué par un zombie.'));assert.equal(packets.at(-1)[0],'player-death');
assert.equal(ctx.GameChat.clean('a\n\0b'),'a  b');assert.equal(ctx.GameChat.clean('x'.repeat(300)).length,240);
// Same fluid corner height for a source and a neighbouring flowing block.
const a=html.indexOf('function waterCornerHeight('),b=html.indexOf('\n}\n',a)+2;
ctx.BLOCKS={0:{},11:{water:true},47:{water:true,level:1},50:{water:true,level:4},12:{hard:-1},1:{hard:1}};
ctx.B={BEDROCK:12};vm.runInContext(html.slice(a,b)+'\nthis.waterCornerHeight=waterCornerHeight;',ctx);
const water=(x,y,z)=>y===1&&z===0?(x===0?11:x===1?50:0):0;
assert(Math.abs(ctx.waterCornerHeight(water,1,1,1)-.79)<1e-8);
assert.equal(ctx.waterCornerHeight((x,y,z)=>y===2?11:water(x,y,z),1,1,1),1);
const ca=html.indexOf('function canBreakBlock('),cb=html.indexOf('\n}\n',ca)+2;vm.runInContext(html.slice(ca,cb)+'\nthis.canBreakBlock=canBreakBlock;',ctx);
assert(!ctx.canBreakBlock(12));ctx.Game.mode='creative';assert(ctx.canBreakBlock(12));assert(ctx.canBreakBlock(1));
assert(!html.includes('id="tBreak"'));assert(!html.includes('id="tPlace"'));assert(!html.includes('id="btnMode"'));assert(!html.includes('id="btnVision"'));
console.log('OK : tap, maintien, glissement, annulation, multitouch, rayon tactile, chat, morts, anti-spam, raccord eau et bedrock.');
