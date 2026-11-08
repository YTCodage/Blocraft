const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('blocraft.html','utf8');let clock=0;
const context=vm.createContext({console,performance:{now:()=>clock},window:{ontouchstart:null},navigator:{maxTouchPoints:1},isTouch:true,SETTINGS:{dist:4},Math,Map,WeakMap,JSON});
vm.runInContext(html.slice(html.indexOf('const View ='),html.indexOf('function streamChunks')),context);
vm.runInContext(html.slice(html.indexOf('const NetFlow='),html.indexOf('const ShortRooms =')),context);
vm.runInContext(`
window.View=View;window.Flow=NetFlow;
`,context);const view=context.window.View,flow=context.window.Flow;
assert.equal(view.dprCap,1);assert.equal(view.draw,4);view.adapt(20);assert.equal(view.dprCap,1,'one isolated slow sample must not resize the canvas');view.adapt(20);assert.equal(view.dprCap,.9);assert.equal(view.draw,3);for(let i=0;i<10;i++)view.adapt(20);assert.equal(view.dprCap,.75);clock=10000;view.adapt(60);assert.equal(view.dprCap,.75);for(let i=0;i<11;i++)view.adapt(60);assert.equal(view.dprCap,.8,'recovery is slow and hysteretic');
const sent=[],connection={open:true,dataChannel:{bufferedAmount:1024*1024},send:text=>sent.push(JSON.parse(text))};
for(let i=0;i<500;i++)flow.send(connection,['p',i]);for(let i=0;i<500;i++)flow.send(connection,['cloud-peer','alice',['p',i]]);flow.send(connection,['cloud-peer','bob',['p',2]]);
assert.equal(flow.pending.get(connection).size,3,'bounded latest-state queue, separate keys per remote player');flow.send(connection,['b',1,2,3,4]);assert.equal(sent[0][0],'b','reliable edits must never be discarded by pose backpressure');
connection.dataChannel.bufferedAmount=0;flow.flush(connection);assert.equal(sent.length,4);assert.equal(sent[1][1],499);assert.equal(flow.pending.get(connection).size,0);
connection.dataChannel.bufferedAmount=1024*1024;flow.send(connection,['machines',{carts:[1],boats:[]}]);flow.send(connection,['machines',{carts:[2],boats:[],meta:[['state',1]],levels:[]}]);assert.equal(flow.pending.get(connection).has('machines'),false);assert.equal(sent.at(-1)[1].meta[0][1],1,'circuit metadata is reliable, not replaceable vehicle-only state');
const r={x:0,y:0,z:0,yaw:3.13};flow.smooth(r,.016);r.x=1;r.yaw=-3.13;flow.smooth(r,.016);assert(r.renderPos[0]>0&&r.renderPos[0]<1);assert(Math.abs(r.renderYaw-3.13)<.1,'shortest yaw arc');assert.equal(r.x,1,'authoritative state is never smoothed');r.x=50;flow.smooth(r,.016);assert.equal(r.renderPos[0],50,'teleports must snap');
// A backlog cannot force many mobile meshes into the same frame.
Object.assign(context,{Game:{manager:null},Player:{pos:[0,61,0]},gl:{deleteVertexArray(){},deleteBuffer(){}},releaseChunkBuffers(){}});
vm.runInContext(html.slice(html.indexOf('function streamChunks'),html.indexOf('function releaseChunkBuffers'))+'\nwindow.stream=streamChunks;',context);
const chunks=new Map(),queue=new Map();for(let i=0;i<1000;i++){chunks.set(i+',0',{cx:i,cz:0});queue.set(i+',0',1);}let meshes=0,generations=0;
context.Game.manager={chunks,meshQueue:queue,buildMesh(){meshes++;},hasChunk:()=>true};context.window.stream(1.5,2.5);assert.equal(meshes,1,'one indivisible mesh job maximum per mobile frame');
context.Game.manager={chunks:new Map(),meshQueue:new Map(),buildMesh(){meshes++;},hasChunk:()=>false,ensureChunk(){generations++;}};context.window.stream(1.5,2.5);assert.equal(generations,1);assert.equal(meshes,1,'no extra synchronous mesh during mobile generation');
// Network ticking sends stationary state only on heartbeat, but movement still streams.
const packets=[];Object.assign(context,{AdminCloud:{active:false},ShortRooms:{connection:null},Player:{pos:[0,61,0],yaw:0,pitch:0},Survival:{health:20},Dimensions:{current:'flat'},Game:{troll:false,time:.3},Troll:{morph:null},Mobs:{list:[]},$(){return {classList:{add(){}}};}});
vm.runInContext(html.slice(html.indexOf('var Net = {'),html.indexOf("Net.playerName = 'Toi';"))+'\nwindow.Net=Net;',context);const net=context.window.Net;net.live=true;net.role='guest';net.send=m=>packets.push(m);net.updateAvatar=()=>{};
for(let i=0;i<50;i++){clock+=100;net.tick(.1);}assert(packets.filter(p=>p[0]==='p').length<=6,'stationary pose packets should be heartbeat-only');const idle=packets.length;for(let i=0;i<10;i++){clock+=100;context.Player.pos[0]+=.1;net.tick(.1);}assert.equal(packets.length-idle,10,'movement must remain responsive');
// Idle vehicles are deduplicated; reliable circuit deltas survive vehicle-only heartbeats.
Object.assign(context,{Circuits:{levels:new Map([['flat|0,1,0',15]]),meta:new Map([['flat|0,1,0',{level:15}]])},Railways:{carts:[],riding:null},Boats:{list:[],riding:null}});context.Game.manager={dim:'flat'};
vm.runInContext(html.slice(html.indexOf('const Transport={'),html.indexOf('const Adventure={'))+'\nwindow.Transport=Transport;',context);const transport=context.window.Transport;net.role='host';packets.length=0;transport.broadcast(true);clock+=150;transport.broadcast();assert.equal(packets.length,1);clock+=1100;transport.broadcast();assert.equal(packets.length,2);assert(!packets[1][1].meta,'vehicle heartbeat does not retransmit a static circuit map');net.role='guest';transport.receive(packets[1][1]);assert.equal(context.Circuits.meta.size,1,'partial machine packets must preserve the last circuit state');
console.log('OK : mobile DPR/portée avec hystérésis, 1 mesh/génération par frame, 500 états réseau coalescés en 3 clés, blocs/métadonnées fiables, interpolation sans modifier la simulation, heartbeat immobile et flux mobile en mouvement.');
