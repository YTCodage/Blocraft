// Voice uses PeerJS media calls; test permission, name-room endpoint and mute without a browser.
const assert=require('assert'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','blocraft.html'),'utf8');
const begin=html.indexOf('const Voice = {'),end=html.indexOf('\n};\n\n/* Cosmetic outfits',begin)+3;
assert(begin>=0&&end>begin);
let asks=0,stops=0,called=0,closed=0;
const button={textContent:'',title:'',setAttribute(k,v){this[k]=v;}};
const track={stop(){stops++;},addEventListener(){}};
const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
const peer={call(id,media,options){called++;assert.equal(id,'other-browser');assert.equal(media,stream);assert(options.metadata.blocraftVoice);return {peer:id,handlers:{},on(name,fn){this.handlers[name]=fn;},close(){closed++;this.handlers.close?.();}};}};
const ctx=vm.createContext({Map,Net:{live:true,role:'guest'},AdminCloud:{active:false},
  ShortRooms:{peer:{},connection:{peer:'other-browser',provider:peer}},
  navigator:{mediaDevices:{getUserMedia:async opts=>{asks++;assert(opts.audio.echoCancellation);return stream;}}},
  HUD:{toastText(){}},$:id=>id==='voiceToggle'?button:null,
  document:{body:{classList:{toggle(){}}},querySelectorAll:()=>[],getElementById:()=>null},MediaStream:function(){},
});
vm.runInContext(html.slice(begin,end)+'\nthis.Voice=Voice;',ctx);
(async()=>{
  assert.equal(asks,0,'microphone access must never start automatically');
  await ctx.Voice.toggle();assert.equal(asks,1);assert.equal(called,1);assert.equal(button['aria-pressed'],'true');
  await ctx.Voice.toggle();assert.equal(stops,1);assert.equal(button['aria-pressed'],'false');assert.equal(closed,0,'muting must keep incoming audio available');
  await ctx.Voice.toggle();assert.equal(asks,2);assert.equal(called,2);assert(closed>=1,'reconnecting replaces the old media call');
  ctx.Voice.stop();assert.equal(stops,2);assert.equal(ctx.Voice.calls.size,0);
  console.log('OK : autorisation du micro sur demande, connexion via nom de partie, coupure sans interrompre l’écoute, nettoyage.');
})().catch(e=>{console.error(e);process.exitCode=1;});
